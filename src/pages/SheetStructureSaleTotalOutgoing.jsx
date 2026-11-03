import React, { useState, useEffect, useMemo, useRef } from 'react';
import './SheetStructureSaleTotalOutgoing.css';

const DEF_COLS = [
  "Status",
  "Sales Confirm No",
  "Sales Confirm Date",
  "Party Name",
  "Description",
  "Wire Rod",
  "Scqty",
  "Soqty",
  "Daqty",
  "Ccqty",
  "Balance Qty",
  "Vailidity",
];

const DEF_TYPES = ["t", "t", "d", "t", "t", "n", "n", "n", "n", "n", "n", "t"];

function ymd(d) {
  if (!d || !(d instanceof Date) || isNaN(d)) return '';
  const p = (n) => (n < 10 ? '0' + n : n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function fromYmd(x) {
  if (!x) return null;
  const a = String(x).split('-');
  if (a.length !== 3) return null;
  return new Date(+a[0], +a[1] - 1, +a[2]);
}

function fmtDate(d) {
  if (!d || !(d instanceof Date) || isNaN(d)) return '';
  const p = (n) => (n < 10 ? '0' + n : n);
  return p(d.getDate()) + '-' + p(d.getMonth() + 1) + '-' + d.getFullYear();
}

function fmtNum(v) {
  if (v === '' || v === null || v === undefined) return '';
  const num = Number(v);
  if (isNaN(num)) return String(v);
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function nm(x) {
  return String(x).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function SheetStructureSaleTotalOutgoing() {
  const [wb, setWb] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  const [cols, setCols] = useState([]);
  const [types, setTypes] = useState([]);
  const [rows, setRows] = useState([]);

  const [sortC, setSortC] = useState(-1);
  const [sortD, setSortD] = useState(1);
  const [searchQ, setSearchQ] = useState('');
  const [colFilter, setColFilter] = useState({});

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [formData, setFormData] = useState([]);
  const [autoBalance, setAutoBalance] = useState(true);
  const [formError, setFormError] = useState('');

  // Image Upload state
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const showMsg = (text, type = '') => {
    setMessage({ text, type });
  };

  const handlePickImage = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImageSrc(url);
    setImageZoom(1);
    showMsg('Reference image uploaded! Inspect while updating entries.');
  };

  // Restore on initial mount
  useEffect(() => {
    try {
      const isCleared = localStorage.getItem('etl_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('etl_table');
        localStorage.setItem('etl_cleared_v1', 'true');
        return;
      }
      const stored = localStorage.getItem('etl_table');
      if (stored) {
        const t = JSON.parse(stored);
        if (t && t.cols && t.cols.length) {
          setCols(t.cols);
          setTypes(t.types || []);
          const restoredRows = (t.rows || []).map((r) =>
            r.map((v) => (v && typeof v === 'object' && v.d ? fromYmd(v.d) : v))
          );
          setRows(restoredRows);
          setSheetNames(['Saved data']);
          setIsAppVisible(true);
          showMsg(`Pichla saved data wapas aaya (${restoredRows.length} rows).`);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persistData = (newCols, newTypes, newRows) => {
    try {
      localStorage.setItem(
        'etl_table',
        JSON.stringify({
          cols: newCols,
          types: newTypes,
          rows: newRows.map((r) =>
            r.map((v) => (v instanceof Date ? { d: ymd(v) } : v))
          ),
        })
      );
    } catch {
      // ignore
    }
  };

  const loadSheetData = (workbook, index) => {
    const XLSX = window.XLSX;
    if (!XLSX) return;
    const ws = workbook.Sheets[workbook.SheetNames[index]];
    let aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
    aoa = aoa.filter((r) => r.some((c) => c !== '' && c !== null));

    if (!aoa.length) {
      showMsg('Is sheet me data nahi hai.', 'err');
      return;
    }

    let hi = 0;
    let best = -1;
    for (let k = 0; k < Math.min(10, aoa.length); k++) {
      const n = aoa[k].filter((c) => c !== '').length;
      if (n > best) {
        best = n;
        hi = k;
      }
    }

    const w = Math.max(...aoa.map((r) => r.length));
    const newCols = [];
    for (let c = 0; c < w; c++) {
      newCols.push(
        String(aoa[hi][c] === undefined || aoa[hi][c] === '' ? 'Col ' + (c + 1) : aoa[hi][c]).trim()
      );
    }

    const newRows = aoa.slice(hi + 1).map((r) => {
      const o = [];
      for (let c = 0; c < w; c++) {
        o.push(r[c] === undefined ? '' : r[c]);
      }
      return o;
    });

    const newTypes = newCols.map((_, c) => {
      const vals = newRows.map((r) => r[c]).filter((v) => v !== '');
      if (!vals.length) return 't';
      if (vals.every((v) => v instanceof Date)) return 'd';
      if (vals.every((v) => typeof v === 'number')) return 'n';
      return 't';
    });

    setCols(newCols);
    setTypes(newTypes);
    setRows(newRows);
    setSortC(-1);
    setColFilter({});
    setSearchQ('');
    setIsAppVisible(true);
    persistData(newCols, newTypes, newRows);
  };

  const handlePickFile = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('Library load nahi hui. Internet check karo aur page refresh karo.', 'err');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const readWb = XLSX.read(new Uint8Array(e.target.result), {
          type: 'array',
          cellDates: true,
        });
        setWb(readWb);
        setSheetNames(readWb.SheetNames);
        setSelectedSheetIndex(0);
        loadSheetData(readWb, 0);
        showMsg(`${file.name} safalta-poorvak load ho gayi.`);
      } catch (err) {
        showMsg('File padh nahi payi: ' + err.message, 'err');
      }
    };
    reader.onerror = () => showMsg('File khul nahi payi.', 'err');
    reader.readAsArrayBuffer(file);
  };

  const handleManualStart = () => {
    if (rows.length && !window.confirm('Abhi ka table hat jayega aur khali report-format table banega. Aage badhun?')) {
      return;
    }
    setWb(null);
    setCols([...DEF_COLS]);
    setTypes([...DEF_TYPES]);
    setRows([]);
    setSortC(-1);
    setColFilter({});
    setSearchQ('');
    setSheetNames(['Manual']);
    setSelectedSheetIndex(0);
    setIsAppVisible(true);
    persistData(DEF_COLS, DEF_TYPES, []);
    openFormModal(-1, DEF_COLS, DEF_TYPES, []);
  };

  const handleSheetChange = (e) => {
    const idx = +e.target.value;
    setSelectedSheetIndex(idx);
    if (wb) {
      loadSheetData(wb, idx);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handlePickImage(file);
      } else {
        handlePickFile(file);
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (isModalOpen) return;
      const items = (e.clipboardData || {}).items || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handlePickImage(file);
            e.preventDefault();
            return;
          }
        }
      }

      const files = (e.clipboardData || {}).files || [];
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          handlePickImage(file);
          e.preventDefault();
        } else if (/\.(xlsx|xls|xlsm|csv)$/i.test(file.name)) {
          handlePickFile(file);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isModalOpen]);

  const getCellText = (v, t) => {
    if (v === '' || v === null || v === undefined) return '';
    if (t === 'd') return fmtDate(v);
    if (t === 'n') return fmtNum(v);
    return String(v);
  };

  const viewRows = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    let res = rows.filter((r) => {
      for (const c in colFilter) {
        if (colFilter[c] !== '' && String(r[c]) !== colFilter[c]) {
          return false;
        }
      }
      if (!q) return true;
      return r.some((v, i) => getCellText(v, types[i]).toLowerCase().includes(q));
    });

    if (sortC > -1) {
      res = [...res].sort((a, b) => {
        const x = a[sortC];
        const y = b[sortC];
        if (x === '' && y === '') return 0;
        if (x === '') return 1;
        if (y === '') return -1;
        if (x instanceof Date && y instanceof Date) return (x - y) * sortD;
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * sortD;
        return String(x).localeCompare(String(y)) * sortD;
      });
    }

    return res;
  }, [rows, colFilter, searchQ, sortC, sortD, types]);

  const filterOptions = useMemo(() => {
    const opts = {};
    cols.forEach((c, i) => {
      if (types[i] !== 't') return;
      const set = new Set();
      rows.forEach((r) => {
        if (r[i] !== '' && r[i] !== null && r[i] !== undefined) {
          set.add(String(r[i]));
        }
      });
      const arr = Array.from(set);
      if (arr.length > 1 && arr.length <= 30) {
        opts[i] = arr.sort();
      }
    });
    return opts;
  }, [cols, types, rows]);

  const handleSort = (cIdx) => {
    if (sortC === cIdx) {
      setSortD(-sortD);
    } else {
      setSortC(cIdx);
      setSortD(1);
    }
  };

  const handleResetFilters = () => {
    setColFilter({});
    setSearchQ('');
  };

  const handleWipeData = () => {
    if (window.confirm('Saari rows hata dun? (Columns ka format rahega)')) {
      setRows([]);
      persistData(cols, types, []);
      showMsg('Saari rows hata di gayin.');
    }
  };

  const handleDeleteRow = (origIdx) => {
    if (window.confirm('Ye row hata dun?')) {
      const nextRows = [...rows];
      nextRows.splice(origIdx, 1);
      setRows(nextRows);
      persistData(cols, types, nextRows);
      showMsg('Row hata di.');
    }
  };

  const downloadFile = (name, type, txt) => {
    const blob = new Blob([txt], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
  };

  const handleExportCSV = () => {
    const q = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headerLine = cols.map(q).join(',');
    const rowLines = viewRows.map((r) =>
      r.map((v, i) => q(v === '' ? '' : types[i] === 'd' ? fmtDate(v) : v)).join(',')
    );
    downloadFile('Sheet_Structure_Sale_Outgoing.csv', 'text/csv;charset=utf-8', '\ufeff' + [headerLine, ...rowLines].join('\r\n'));
  };

  const handleExportXLS = () => {
    const XLSX = window.XLSX;
    if (!XLSX) return;
    const data = [cols, ...viewRows.map((r) => r.map((v, i) => (types[i] === 'd' && v !== '' ? fmtDate(v) : v)))];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const nb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(nb, ws, 'Sales Data');
    XLSX.writeFile(nb, 'Sheet_Structure_Sale_Outgoing.xlsx');
  };

  const getColIndex = (name, currentCols = cols) => {
    return currentCols.findIndex((c) => nm(c) === name);
  };

  const openFormModal = (idx, currentCols = cols, currentTypes = types, currentRows = rows) => {
    setEditIdx(idx);
    setFormError('');

    const initialForm = currentCols.map((c, i) => {
      const v = idx >= 0 ? currentRows[idx][i] : '';
      if (currentTypes[i] === 'd') {
        return v instanceof Date ? ymd(v) : idx < 0 ? ymd(new Date()) : '';
      }
      if (currentTypes[i] === 'n') {
        return v === '' || v === null || v === undefined ? '' : String(v);
      }
      if (idx < 0) {
        const u = Array.from(new Set(currentRows.map((r) => r[i]).filter((x) => x !== '')));
        if (u.length === 1 && currentRows.every((r) => r[i] !== '')) {
          return u[0];
        }
      }
      return v === '' || v === null || v === undefined ? '' : String(v);
    });

    const sc = getColIndex('scqty', currentCols);
    const cc = getColIndex('ccqty', currentCols);
    const da = getColIndex('daqty', currentCols);
    const bl = getColIndex('balanceqty', currentCols);

    if (sc > -1 && cc > -1 && da > -1 && bl > -1) {
      setAutoBalance(true);
      const parseVal = (val) => {
        const n = parseFloat(String(val || '').replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
      };
      const bal = Math.round((parseVal(initialForm[sc]) - parseVal(initialForm[cc]) - parseVal(initialForm[da])) * 100) / 100;
      initialForm[bl] = String(bal);
    }

    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleFormInputChange = (i, val) => {
    const updated = [...formData];
    updated[i] = val;

    const sc = getColIndex('scqty');
    const cc = getColIndex('ccqty');
    const da = getColIndex('daqty');
    const bl = getColIndex('balanceqty');

    if (autoBalance && sc > -1 && cc > -1 && da > -1 && bl > -1) {
      if (i === sc || i === cc || i === da) {
        const parseVal = (v) => {
          const n = parseFloat(String(v || '').replace(/,/g, ''));
          return isNaN(n) ? 0 : n;
        };
        const calculated = Math.round((parseVal(updated[sc]) - parseVal(updated[cc]) - parseVal(updated[da])) * 100) / 100;
        updated[bl] = String(calculated);
      }
    }

    const dc = types.indexOf('d');
    const sn = getColIndex('salesconfirmno');
    if (i === dc && sn > -1 && val) {
      const cur = updated[sn] || '';
      if (cur === '' || cur.endsWith('/')) {
        let pre = null;
        for (let k = 0; k < rows.length; k++) {
          const m = /^(.*\/)\d{2}\/\d{2}\/\d{4}$/.exec(String(rows[k][sn]));
          if (m) {
            pre = m[1];
            break;
          }
        }
        if (pre) {
          const a = val.split('-');
          updated[sn] = pre + a[1] + '/' + a[2] + '/';
        }
      }
    }

    setFormData(updated);
  };

  const saveFormEntry = () => {
    const out = [];
    for (let i = 0; i < cols.length; i++) {
      const raw = String(formData[i] ?? '').trim();
      let v = '';
      if (raw !== '') {
        if (types[i] === 'n') {
          v = parseFloat(raw.replace(/,/g, ''));
          if (isNaN(v)) {
            setFormError(`"${cols[i]}" me kripya sirf sankhya (number) likhein.`);
            return false;
          }
        } else if (types[i] === 'd') {
          v = fromYmd(raw);
        } else {
          v = raw;
        }
      }
      out.push(v);
    }

    if (out.every((v) => v === '')) {
      setFormError('Kripya kam se kam ek field bharein.');
      return false;
    }

    const sn = getColIndex('salesconfirmno');
    if (sn > -1 && out[sn] !== '') {
      const dup = rows.some((r, ri) => ri !== editIdx && String(r[sn]) === String(out[sn]));
      if (dup && !window.confirm(`"${out[sn]}" pehle se table me maujood hai. Phir bhi save karein?`)) {
        return false;
      }
    }

    let nextRows;
    if (editIdx >= 0) {
      nextRows = [...rows];
      nextRows[editIdx] = out;
    } else {
      nextRows = [out, ...rows];
    }

    setRows(nextRows);
    persistData(cols, types, nextRows);
    showMsg(editIdx >= 0 ? 'Row safalta-poorvak update ho gayi.' : `New Entry add ho gayi (${nextRows.length} rows).`);
    return true;
  };

  const handleSaveAndClose = () => {
    if (saveFormEntry()) {
      setIsModalOpen(false);
    }
  };

  const handleSaveAndNext = () => {
    if (saveFormEntry()) {
      openFormModal(-1);
    }
  };

  const getDatalistOptions = (i) => {
    const set = new Set();
    rows.forEach((r) => {
      if (r[i] !== '' && r[i] !== null && r[i] !== undefined) {
        set.add(String(r[i]));
      }
    });
    return Array.from(set).sort().slice(0, 300);
  };

  const firstTextIndex = types.indexOf('t');

  return (
    <div className="sheet-structure-page">
      {/* Top Header */}
      <div className="ssto-header">
        <div>
          <h2>Sheet Structure Sale Total Billate Outgoing</h2>
          <p>Sales orders, dispatch status aur balance overview report</p>
        </div>
      </div>

      {/* Dual Dropzone Cards (Excel & Image) */}
      <div className="plant-dropzone-grid">
        <div
          className={`plant-drop-card ${isDragOver ? 'over' : ''}`}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <div className="plant-drop-icon">📁</div>
          <div className="plant-drop-title">Excel ya CSV file upload karein</div>
          <div className="plant-drop-subtitle">Click karein ya yahan drag &amp; drop karein (.xlsx, .xls, .csv)</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.xlsm,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handlePickFile(e.target.files[0]);
              }
            }}
          />
        </div>

        <div
          className="plant-drop-card image-card"
          onClick={() => imageInputRef.current && imageInputRef.current.click()}
        >
          <div className="plant-drop-icon">🖼️</div>
          <div className="plant-drop-title">Reference Image Upload karein</div>
          <div className="plant-drop-subtitle">Image drag &amp; drop karein ya clipboard se paste karein (Ctrl + V)</div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handlePickImage(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Upload Actions Bar */}
      <div className="upload-card-wrapper" style={{ padding: '12px 18px', marginBottom: '8px' }}>
        <div className="upload-actions-bar" style={{ margin: 0, padding: 0, border: 'none' }}>
          <div className="manual-start-group">
            <button
              type="button"
              className="btn-action btn-primary"
              onClick={handleManualStart}
            >
              ✍️ Bina file ke manual entry se shuru karein
            </button>
            <span className="helper-badge-text">
              (Standard plant format ke saath empty table load hoga)
            </span>
          </div>

          {message.text && (
            <div className={`status-badge ${message.type === 'err' ? 'err' : ''}`}>
              <span>{message.type === 'err' ? '⚠️' : '✓'}</span>
              <span>{message.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reference Image Preview Box */}
      {uploadedImageSrc && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
              🖼️ Uploaded Reference Image
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-action"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}
              >
                ＋ Zoom In
              </button>
              <button
                type="button"
                className="btn-action"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}
              >
                － Zoom Out
              </button>
              <button
                type="button"
                className="btn-action"
                style={{ padding: '4px 10px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => setUploadedImageSrc(null)}
              >
                ✖ Close Image
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '420px', overflow: 'auto', background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <img
              src={uploadedImageSrc}
              alt="Reference document"
              style={{ width: `${imageZoom * 100}%`, maxWidth: 'none', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      )}

      {isAppVisible && (
        <>
          {/* Summary KPI Metric Cards */}
          <div className="kpi-cards-grid">
            <div className="kpi-card highlight">
              <div className="kpi-label">Kul Rows</div>
              <div className="kpi-value">{viewRows.length}</div>
              <div className="kpi-subtext">Total {rows.length} me se</div>
            </div>

            {cols.map((c, i) => {
              if (types[i] !== 'n') return null;
              const sum = viewRows.reduce((acc, r) => acc + (Number(r[i]) || 0), 0);
              return (
                <div key={c + i} className="kpi-card">
                  <div className="kpi-label">{c}</div>
                  <div className="kpi-value">{fmtNum(sum)}</div>
                  <div className="kpi-subtext">Kul Yog (Sum)</div>
                </div>
              );
            })}
          </div>

          {/* Filter & Operations Toolbar in a Single Clean Line */}
          <div className="toolbar-container">
            <div className="toolbar-row">
              <div className="toolbar-buttons-group">
                <button
                  type="button"
                  className="btn-action btn-primary"
                  onClick={() => openFormModal(-1)}
                >
                  + New Entry
                </button>
                <button
                  type="button"
                  className="btn-action"
                  onClick={handleExportXLS}
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  className="btn-action"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="btn-action"
                  onClick={handleResetFilters}
                >
                  Reset Filter
                </button>
                <button
                  type="button"
                  className="btn-action btn-danger-outline"
                  onClick={handleWipeData}
                >
                  Clear Data
                </button>
              </div>

              <div className="filter-controls-group">
                <div className="control-item">
                  <input
                    id="search-input"
                    type="search"
                    placeholder="Search records..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    style={{ width: '180px' }}
                  />
                </div>

                {sheetNames.length > 1 && (
                  <div className="control-item">
                    <select
                      id="sheet-select"
                      value={selectedSheetIndex}
                      onChange={handleSheetChange}
                    >
                      {sheetNames.map((n, i) => (
                        <option key={i} value={i}>
                          {n.trim() || `Sheet ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {Object.keys(filterOptions).slice(0, 2).map((colIdxStr) => {
                  const i = +colIdxStr;
                  return (
                    <div key={i} className="control-item">
                      <select
                        id={`cf-${i}`}
                        value={colFilter[i] || ''}
                        onChange={(e) =>
                          setColFilter({
                            ...colFilter,
                            [i]: e.target.value,
                          })
                        }
                      >
                        <option value="">All {cols[i]}</option>
                        {filterOptions[i].map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="table-viewport-card">
            <div className="table-scroll-container">
              <table className="data-table-main">
                <thead>
                  <tr>
                    <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                    {cols.map((c, i) => (
                      <th key={c + i} onClick={() => handleSort(i)}>
                        {c}
                        <span className="sort-icon">
                          {sortC === i ? (sortD > 0 ? '▲' : '▼') : '⇅'}
                        </span>
                      </th>
                    ))}
                    <th style={{ width: '70px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRows.length > 0 ? (
                    viewRows.map((r, ri) => {
                      const oi = rows.indexOf(r);
                      return (
                        <tr key={ri}>
                          <td className="index-cell">{ri + 1}</td>
                          {r.map((v, i) => {
                            const isNum = types[i] === 'n';
                            const isTag = types[i] === 't' && /^(valid|invalid|active|closed)$/i.test(String(v));
                            const formatted = getCellText(v, types[i]);

                            return (
                              <td key={i} className={isNum ? 'num-cell' : ''}>
                                {isTag ? (
                                  <span className={`status-pill ${/^(valid|active)$/i.test(v) ? 'good' : 'bad'}`}>
                                    {v}
                                  </span>
                                ) : (
                                  formatted
                                )}
                              </td>
                            );
                          })}
                          <td className="action-cell">
                            <div className="action-btn-group">
                              <button
                                type="button"
                                className="table-icon-btn"
                                title="Edit Row"
                                aria-label="Edit Row"
                                onClick={() => openFormModal(oi)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="table-icon-btn delete-btn"
                                title="Delete Row"
                                aria-label="Delete Row"
                                onClick={() => handleDeleteRow(oi)}
                              >
                                ×
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={cols.length + 2}>
                        <div className="empty-state-card">
                          <div className="empty-state-icon">📋</div>
                          <div>Koi records nahi mile.</div>
                          <small>New Entry karein ya Excel file upload karein.</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {types.includes('n') && viewRows.length > 0 && (
                  <tfoot>
                    <tr>
                      <td />
                      {cols.map((_, i) => {
                        if (types[i] === 'n') {
                          const sum = viewRows.reduce((acc, r) => acc + (Number(r[i]) || 0), 0);
                          return (
                            <td key={i} className="num-cell">
                              {fmtNum(sum)}
                            </td>
                          );
                        }
                        return (
                          <td key={i}>
                            {i === firstTextIndex ? `Total (${viewRows.length} Rows)` : ''}
                          </td>
                        );
                      })}
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modern Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <h3 id="modal-title">
                {editIdx < 0 ? '➕ Nayi Row Entry' : `✏️ Row Update Karein (#${editIdx + 1})`}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-inputs-grid">
                {cols.map((c, i) => {
                  const isLong = /party|name|desc/i.test(c);
                  const isDate = types[i] === 'd';
                  const isNum = types[i] === 'n';
                  const sc = getColIndex('scqty');
                  const cc = getColIndex('ccqty');
                  const da = getColIndex('daqty');
                  const bl = getColIndex('balanceqty');
                  const isBalanceField = autoBalance && sc > -1 && cc > -1 && da > -1 && bl === i;

                  return (
                    <div key={c + i} className={`form-group-item ${isLong ? 'grid-span-2' : ''}`}>
                      <label htmlFor={`form-input-${i}`}>{c}</label>
                      {isDate ? (
                        <input
                          type="date"
                          id={`form-input-${i}`}
                          value={formData[i] || ''}
                          onChange={(e) => handleFormInputChange(i, e.target.value)}
                        />
                      ) : isNum ? (
                        <input
                          id={`form-input-${i}`}
                          className="num-input"
                          inputMode="decimal"
                          autoComplete="off"
                          readOnly={isBalanceField}
                          value={formData[i] || ''}
                          onChange={(e) => handleFormInputChange(i, e.target.value)}
                        />
                      ) : (
                        <>
                          <input
                            id={`form-input-${i}`}
                            autoComplete="off"
                            list={`datalist-col-${i}`}
                            value={formData[i] || ''}
                            onChange={(e) => handleFormInputChange(i, e.target.value)}
                          />
                          <datalist id={`datalist-col-${i}`}>
                            {getDatalistOptions(i).map((opt) => (
                              <option key={opt} value={opt} />
                            ))}
                          </datalist>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {getColIndex('scqty') > -1 &&
                getColIndex('ccqty') > -1 &&
                getColIndex('daqty') > -1 &&
                getColIndex('balanceqty') > -1 && (
                  <div className="auto-formula-notice">
                    <label>
                      <input
                        type="checkbox"
                        checked={autoBalance}
                        onChange={(e) => {
                          setAutoBalance(e.target.checked);
                          if (e.target.checked) {
                            const sc = getColIndex('scqty');
                            const cc = getColIndex('ccqty');
                            const da = getColIndex('daqty');
                            const bl = getColIndex('balanceqty');
                            const parseVal = (v) => {
                              const n = parseFloat(String(v || '').replace(/,/g, ''));
                              return isNaN(n) ? 0 : n;
                            };
                            const calc =
                              Math.round(
                                (parseVal(formData[sc]) - parseVal(formData[cc]) - parseVal(formData[da])) * 100
                              ) / 100;
                            const updated = [...formData];
                            updated[bl] = String(calc);
                            setFormData(updated);
                          }
                        }}
                      />{' '}
                      Auto-calculate formula: <b>{cols[getColIndex('balanceqty')]}</b> ={' '}
                      {cols[getColIndex('scqty')]} − {cols[getColIndex('ccqty')]} −{' '}
                      {cols[getColIndex('daqty')]}
                    </label>
                  </div>
                )}
            </div>

            <div className="modal-footer">
              {formError && (
                <div className="form-error-text" role="alert">
                  ⚠️ {formError}
                </div>
              )}
              {editIdx < 0 && (
                <button
                  type="button"
                  className="btn-action"
                  onClick={handleSaveAndNext}
                >
                  Save &amp; Agli Entry
                </button>
              )}
              <button
                type="button"
                className="btn-action btn-primary"
                onClick={handleSaveAndClose}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
