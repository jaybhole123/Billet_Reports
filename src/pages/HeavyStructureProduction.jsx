import React, { useState, useMemo, useRef } from 'react';
import './HeavyStructureProduction.css';

const RAW_GROUPS = [
  'Raw Material',
  'Miss Roll',
  'Cold Pcs',
  'Rejected Rat Cut',
  'Laher',
  'Dagi/Repair',
];

const INCLUDED_GROUPS = ['Raw Material', 'Miss Roll'];

const RAWF_CONFIG = [
  { key: 'grp', label: 'Group', type: 'select', options: RAW_GROUPS },
  { key: 'size', label: 'Billet Size', type: 'text', placeholder: 'e.g. 160X160 (N)' },
  { key: 'len', label: 'Billet Length (m)', type: 'number', step: '0.001' },
  { key: 'pcs', label: 'Charged Pcs', type: 'number' },
  { key: 'wt', label: 'WT (MT)', type: 'number', step: '0.001' },
  { key: 'rem', label: 'Remark', type: 'text' },
];

const FINF_CONFIG = [
  { key: 'sec', label: 'Section Size', type: 'text', placeholder: 'e.g. MC 200X75' },
  { key: 'kg', label: 'Section Wt (KG/m)', type: 'number', step: '0.001' },
  { key: 'len', label: 'Length Mtr', type: 'text', placeholder: 'e.g. 12.000 or 11.0-12.0' },
  { key: 'pcs', label: 'Nos / Pcs', type: 'number' },
  { key: 'wt', label: 'Total Wt (MT)', type: 'number', step: '0.001' },
  { key: 'rem', label: 'Remark (Embossing)', type: 'text', placeholder: 'e.g. JINDAL' },
];

const f3 = (n) => (+n || 0).toFixed(3);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const getInitialReports = () => [];

export default function HeavyStructureProduction() {
  const [reports, setReports] = useState(() => {
    try {
      const isCleared = localStorage.getItem('hsm_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('hsm_rep');
        localStorage.setItem('hsm_cleared_v1', 'true');
        return [];
      }
      const saved = localStorage.getItem('hsm_rep');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.reps && parsed.reps.length) return parsed.reps;
      }
    } catch (e) {}
    return [];
  });

  const [curId, setCurId] = useState(() => {
    try {
      const saved = localStorage.getItem('hsm_rep');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cur) return parsed.cur;
      }
    } catch (e) {}
    return reports[0]?.id || null;
  });

  const [message, setMessage] = useState({ text: '', isErr: false });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState('raw'); // 'raw' or 'fin'
  const [modalEditIdx, setModalEditIdx] = useState(null);
  const [formFields, setFormFields] = useState({});

  // Image preview state
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const xFileRef = useRef(null);
  const iFileRef = useRef(null);

  // Sync to localStorage
  const saveState = (updatedReps, activeCurId = curId) => {
    try {
      localStorage.setItem('hsm_rep', JSON.stringify({ reps: updatedReps, cur: activeCurId }));
    } catch (e) {}
  };

  const showMsg = (text, isErr = false) => {
    setMessage({ text, isErr });
  };

  // Active Report
  const currentReport = useMemo(() => {
    return reports.find((r) => r.id === curId) || reports[0] || null;
  }, [reports, curId]);

  // Production and Loss calculations
  const summaryCalc = useMemo(() => {
    if (!currentReport) return { raw: 0, prod: 0, miss: 0, endc: 0, burn: 0 };
    const raw = currentReport.raw
      .filter((x) => INCLUDED_GROUPS.includes(x.grp))
      .reduce((s, x) => s + (+x.wt || 0), 0);
    const prod = currentReport.fin.reduce((s, x) => s + (+x.wt || 0), 0);
    const miss = +currentReport.miss || 0;
    const endc = +currentReport.endc || 0;
    const burn =
      currentReport.burn === '' || currentReport.burn == null
        ? Math.max(0, raw - prod - miss - endc)
        : +currentReport.burn;

    return { raw, prod, miss, endc, burn };
  }, [currentReport]);

  const updateCurrentReport = (updater) => {
    setReports((prev) => {
      const next = prev.map((r) => {
        if (r.id === curId) {
          return typeof updater === 'function' ? updater(r) : { ...r, ...updater };
        }
        return r;
      });
      saveState(next);
      return next;
    });
  };

  // Report Switching and Creation
  const handleCreateReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newRep = {
      id: Date.now(),
      date: today,
      shift: 'Day',
      pdr: '',
      run: '',
      coal: '',
      miss: '',
      burn: '',
      endc: '',
      raw: [],
      fin: [],
    };
    const updated = [newRep, ...reports];
    setReports(updated);
    setCurId(newRep.id);
    saveState(updated, newRep.id);
    showMsg('New report created successfully.');
  };

  const handleDeleteReport = () => {
    if (!currentReport) return;
    if (window.confirm(`Delete report for ${currentReport.date} (${currentReport.shift})?`)) {
      const updated = reports.filter((r) => r.id !== curId);
      const nextCur = updated[0]?.id || null;
      setReports(updated);
      setCurId(nextCur);
      saveState(updated, nextCur);
      showMsg('Report deleted.');
    }
  };

  // Open Form
  const openForm = (kind, index = null) => {
    setModalKind(kind);
    setModalEditIdx(index);
    if (index != null && currentReport) {
      const item = currentReport[kind][index];
      setFormFields({ ...item });
    } else {
      if (kind === 'raw') {
        setFormFields({
          grp: RAW_GROUPS[0],
          size: '',
          len: '',
          pcs: '',
          wt: '',
          rem: '',
        });
      } else {
        setFormFields({
          sec: '',
          kg: '',
          len: '',
          pcs: '',
          wt: '',
          rem: '',
        });
      }
    }
    setIsModalOpen(true);
  };

  // Auto Calculate Weight
  const handleAutoCalculateWeight = () => {
    let w = 0;
    if (modalKind === 'raw') {
      const m = (formFields.size || '').match(/(\d+)\s*[xX]\s*(\d+)/) || [];
      const d1 = +m[1] || 0;
      const d2 = +m[2] || 0;
      const len = +formFields.len || 0;
      const pcs = +formFields.pcs || 0;
      w = ((d1 * d2 * 7.85) / 1e6) * len * pcs;
    } else {
      const nums = (String(formFields.len || '').match(/[\d.]+/g) || []).map(Number);
      const avgLen = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const kg = +formFields.kg || 0;
      const pcs = +formFields.pcs || 0;
      w = (kg * avgLen * pcs) / 1000;
    }
    setFormFields((prev) => ({ ...prev, wt: w.toFixed(3) }));
    showMsg('Weight calculated from dimensions.');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (modalKind === 'raw' && !formFields.size) {
      showMsg('Please enter billet size.', true);
      return;
    }
    if (modalKind === 'fin' && !formFields.sec) {
      showMsg('Please enter section size.', true);
      return;
    }

    const payload = {
      ...formFields,
      id: formFields.id || Date.now(),
      pcs: formFields.pcs ? +formFields.pcs : '',
      wt: formFields.wt ? +formFields.wt : '',
    };
    if (modalKind === 'raw') {
      payload.len = formFields.len ? +formFields.len : '';
    } else {
      payload.kg = formFields.kg ? +formFields.kg : '';
    }

    updateCurrentReport((r) => {
      const list = [...r[modalKind]];
      if (modalEditIdx != null) {
        list[modalEditIdx] = payload;
      } else {
        list.push(payload);
      }
      return { ...r, [modalKind]: list };
    });

    setIsModalOpen(false);
    showMsg(modalEditIdx != null ? 'Entry updated.' : 'New entry added.');
  };

  const handleDeleteItem = (kind, index) => {
    if (window.confirm('Delete this record?')) {
      updateCurrentReport((r) => {
        const list = [...r[kind]];
        list.splice(index, 1);
        return { ...r, [kind]: list };
      });
      showMsg('Entry deleted.');
    }
  };

  const handleRemarkChange = (kind, id, val) => {
    updateCurrentReport((r) => {
      const list = r[kind].map((x) => (x.id === id ? { ...x, rem: val } : x));
      return { ...r, [kind]: list };
    });
  };

  // Excel Upload
  const handleReadExcel = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('XLSX library not loaded.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        let rawCount = 0;
        let finCount = 0;
        const newRaw = [];
        const newFin = [];

        wb.SheetNames.forEach((sn) => {
          const isFin = /fin/i.test(sn);
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: '' });

          rows.forEach((x) => {
            const g = {};
            Object.keys(x).forEach((k) => (g[norm(k)] = x[k]));
            if (isFin) {
              const sec = g.sectionsize || g.section;
              if (!sec) return;
              newFin.push({
                id: Date.now() + Math.random(),
                sec: String(sec),
                kg: +(g.sectionwtkg || g.sectionwt || 0),
                len: String(g.lengthmtr || g.length || ''),
                pcs: +(g.nospcs || g.pcs || 0),
                wt: +(g.totalwtmt || g.totalwt || 0),
                rem: String(g.remark || ''),
              });
              finCount++;
            } else {
              const s = g.billetsize || g.size;
              if (!s) return;
              newRaw.push({
                id: Date.now() + Math.random(),
                grp: RAW_GROUPS.find((q) => norm(q) === norm(g.group || '')) || RAW_GROUPS[0],
                size: String(s),
                len: +(g.billetlength || 0),
                pcs: +(g.chargedpcs || g.pcs || 0),
                wt: +(g.wtmt || g.wt || 0),
                rem: String(g.remark || ''),
              });
              rawCount++;
            }
          });
        });

        if (rawCount || finCount) {
          updateCurrentReport((r) => ({
            ...r,
            raw: [...r.raw, ...newRaw],
            fin: [...r.fin, ...newFin],
          }));
          showMsg(`${rawCount} Raw & ${finCount} Finished entries imported.`);
        } else {
          showMsg('No valid Raw or Finished entries found in Excel.', true);
        }
      } catch (err) {
        showMsg('Error importing Excel: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Image Upload
  const handleReadImage = (file) => {
    if (!file || file.type.indexOf('image') !== 0) {
      showMsg('Please select an image file.', true);
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedImageSrc(url);
    setImageZoom(1);
    showMsg('Image reference preview loaded.');
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!currentReport) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('XLSX library not loaded.', true);
      return;
    }

    const c = summaryCalc;
    const wb = XLSX.utils.book_new();

    const rawRows = currentReport.raw.map((x) => ({
      Group: x.grp,
      'Billet Size': x.size,
      'Billet Length': x.len,
      'Charged Pcs': x.pcs,
      'WT (MT)': x.wt,
      Remark: x.rem,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawRows), 'Raw');

    const finRows = currentReport.fin.map((x) => ({
      'Section Size': x.sec,
      'Section Wt (KG)': x.kg,
      'Length Mtr': x.len,
      'Nos/Pcs': x.pcs,
      'Total Wt (MT)': x.wt,
      Remark: x.rem,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finRows), 'Finished');

    const pct = (v) => (c.raw ? +((v / c.raw) * 100).toFixed(3) : 0);
    const summaryData = [
      ['Date', currentReport.date],
      ['Shift', currentReport.shift],
      ['PDR', currentReport.pdr],
      ['Running Time', currentReport.run],
      ['Coal Consumed', currentReport.coal],
      [],
      ['Metric', 'MT', '%'],
      ['Total Raw Material', c.raw, 100],
      ['Total Production', c.prod, pct(c.prod)],
      ['Miss Roll', c.miss, pct(c.miss)],
      ['Burning Loss', c.burn, pct(c.burn)],
      ['End Cutting', c.endc, pct(c.endc)],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    XLSX.writeFile(wb, `Heavy_Structure_Production_${currentReport.date}_${currentReport.shift}.xlsx`);
    showMsg('Excel file exported.');
  };

  const pctStr = (v) => (summaryCalc.raw ? ((v / summaryCalc.raw) * 100).toFixed(2) + ' %' : '–');

  const [isDragOver, setIsDragOver] = useState(false);

  React.useEffect(() => {
    const handlePaste = (e) => {
      if (isModalOpen) return;
      const files = (e.clipboardData || {}).files || [];
      if (files.length > 0) {
        const file = files[0];
        if (file.type.indexOf('image') === 0) {
          handleReadImage(file);
          return;
        } else if (/\.(xlsx|xls|xlsm|csv)$/i.test(file.name)) {
          handleReadExcel(file);
          return;
        }
      }
      const it = (e.clipboardData || {}).items || [];
      for (let i = 0; i < it.length; i++) {
        if (it[i].type.indexOf('image') === 0) {
          handleReadImage(it[i].getAsFile());
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isModalOpen, currentReport]);

  const handlePageDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isModalOpen) return;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.indexOf('image') === 0) {
        handleReadImage(file);
      } else if (/\.(xlsx|xls|xlsm|csv)$/i.test(file.name)) {
        handleReadExcel(file);
      } else {
        showMsg('Please drop a valid Excel (.xlsx, .xls) or Image file.', true);
      }
    }
  };

  return (
    <div
      className={`hsp-page-container ${isDragOver ? 'global-drag-active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDragOver(false);
        }
      }}
      onDrop={handlePageDrop}
    >
      {isDragOver && (
        <div className="global-drag-overlay">
          <div className="global-drag-badge">
            <span>📥</span>
            <span>Drop Excel (.xlsx, .xls) or Image file to load</span>
          </div>
        </div>
      )}
      {/* Top Page Header */}
      <div className="hsp-page-header">
        <h2>Heavy Structure Mill — Production Report</h2>
        <p>Comprehensive shift-wise raw material charging, finished section output &amp; loss analysis</p>
      </div>

      {/* KPI Metrics Cards in Single Row */}
      <div className="hsp-kpi-grid">
        <div className="hsp-kpi-card highlight">
          <div className="hsp-kpi-label">Total Raw Material</div>
          <div className="hsp-kpi-value">{f3(summaryCalc.raw)} MT</div>
          <div className="hsp-kpi-sub">Charged Billet Input</div>
        </div>

        <div className="hsp-kpi-card success">
          <div className="hsp-kpi-label">Total Production</div>
          <div className="hsp-kpi-value">{f3(summaryCalc.prod)} MT</div>
          <div className="hsp-kpi-sub">Yield: {pctStr(summaryCalc.prod)}</div>
        </div>

        <div className="hsp-kpi-card blue">
          <div className="hsp-kpi-label">Miss Roll</div>
          <div className="hsp-kpi-value">{f3(summaryCalc.miss)} MT</div>
          <div className="hsp-kpi-sub">Loss: {pctStr(summaryCalc.miss)}</div>
        </div>

        <div className="hsp-kpi-card danger">
          <div className="hsp-kpi-label">Burning Loss</div>
          <div className="hsp-kpi-value">{f3(summaryCalc.burn)} MT</div>
          <div className="hsp-kpi-sub">Loss: {pctStr(summaryCalc.burn)}</div>
        </div>

        <div className="hsp-kpi-card">
          <div className="hsp-kpi-label">End Cutting</div>
          <div className="hsp-kpi-value">{f3(summaryCalc.endc)} MT</div>
          <div className="hsp-kpi-sub">Loss: {pctStr(summaryCalc.endc)}</div>
        </div>
      </div>

      {/* Dual Dropzone Cards (Excel & Image) */}
      <div className="plant-dropzone-grid">
        <div
          className="plant-drop-card"
          onClick={() => xFileRef.current && xFileRef.current.click()}
        >
          <div className="plant-drop-icon">📁</div>
          <div className="plant-drop-title">Excel ya CSV file upload karein</div>
          <div className="plant-drop-subtitle">Click karein ya yahan drag &amp; drop karein (.xlsx, .xls, .csv)</div>
          <input
            ref={xFileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleReadExcel(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>

        <div
          className="plant-drop-card image-card"
          onClick={() => iFileRef.current && iFileRef.current.click()}
        >
          <div className="plant-drop-icon">🖼️</div>
          <div className="plant-drop-title">Reference Image Upload karein</div>
          <div className="plant-drop-subtitle">Image drag &amp; drop karein ya clipboard se paste karein (Ctrl + V)</div>
          <input
            ref={iFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleReadImage(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Single-Row Clean Executive Toolbar */}
      <div className="hsp-toolbar-card">
        <div className="hsp-toolbar-left">
          <button type="button" className="hsp-btn pri" onClick={() => openForm('raw')}>
            + Raw Entry
          </button>
          <button type="button" className="hsp-btn pri" onClick={() => openForm('fin')}>
            + Finished Entry
          </button>

          <button type="button" className="hsp-btn" onClick={handleExportExcel}>
            📤 Export Excel
          </button>
        </div>

        <div className="hsp-toolbar-right">
          <select
            className="hsp-select"
            value={curId || ''}
            onChange={(e) => setCurId(+e.target.value)}
            style={{ fontWeight: 600 }}
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} · {r.shift} Shift
              </option>
            ))}
          </select>

          <button type="button" className="hsp-btn" onClick={handleCreateReport}>
            ＋ New Report
          </button>

          <button
            type="button"
            className="hsp-btn danger-outline"
            onClick={handleDeleteReport}
            disabled={reports.length <= 1}
          >
            Delete Report
          </button>
        </div>
      </div>

      {/* Status Alert Badge */}
      {message.text && (
        <div>
          <div className={`hsp-msg-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Image Reference Card */}
      {uploadedImageSrc && (
        <div className="hsp-img-preview-card">
          <div className="hsp-img-preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b>🖼️ Production Sheet Reference Image</b>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (Verify numbers while reviewing raw and finished logs)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="hsp-btn sm"
                onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
              >
                ＋ Zoom
              </button>
              <button
                type="button"
                className="hsp-btn sm"
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
              >
                － Zoom
              </button>
              <button
                type="button"
                className="hsp-btn sm"
                onClick={() => setUploadedImageSrc(null)}
              >
                ✖ Close
              </button>
            </div>
          </div>
          <div className="hsp-img-preview-body">
            <img
              src={uploadedImageSrc}
              alt="Uploaded Reference"
              style={{
                width: `${100 * imageZoom}%`,
                maxWidth: 'none',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Shift Details & Operational Parameters */}
      {currentReport && (
        <div className="hsp-details-card">
          <div className="hsp-details-header">
            <span className="hsp-details-title">⚙️ Shift Parameters &amp; Scrap Losses</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Auto-saves on input</span>
          </div>
          <div className="hsp-details-grid">
            <div className="hsp-field-group">
              <label className="hsp-field-label">Date</label>
              <input
                type="date"
                value={currentReport.date || ''}
                onChange={(e) => updateCurrentReport({ date: e.target.value })}
              />
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">Shift</label>
              <select
                value={currentReport.shift || 'Day'}
                onChange={(e) => updateCurrentReport({ shift: e.target.value })}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">Mill Running Time</label>
              <input
                value={currentReport.run || ''}
                placeholder="e.g. 10.30 Hrs."
                onChange={(e) => updateCurrentReport({ run: e.target.value })}
              />
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">Coal Consumed</label>
              <input
                value={currentReport.coal || ''}
                placeholder="e.g. 4.5 MT"
                onChange={(e) => updateCurrentReport({ coal: e.target.value })}
              />
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">Miss Roll (MT)</label>
              <input
                type="number"
                step="0.001"
                value={currentReport.miss ?? ''}
                placeholder="0.000"
                onChange={(e) => updateCurrentReport({ miss: e.target.value === '' ? '' : +e.target.value })}
              />
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">End Cutting (MT)</label>
              <input
                type="number"
                step="0.001"
                value={currentReport.endc ?? ''}
                placeholder="0.000"
                onChange={(e) => updateCurrentReport({ endc: e.target.value === '' ? '' : +e.target.value })}
              />
            </div>

            <div className="hsp-field-group">
              <label className="hsp-field-label">Burning Loss (MT) [Empty = Auto]</label>
              <input
                type="number"
                step="0.001"
                value={currentReport.burn ?? ''}
                placeholder="Auto calculated"
                onChange={(e) => updateCurrentReport({ burn: e.target.value === '' ? '' : +e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Raw Material (Billet) Table */}
      <div className="hsp-table-card">
        <div className="hsp-table-title-bar">
          <div className="hsp-table-title-group">
            <span className="hsp-title-tag">RAW</span>
            <span className="hsp-table-title">RAW MATERIAL (BILLET) CHARGING</span>
            <span className="hsp-badge-count">{currentReport?.raw?.length || 0} entries</span>
          </div>
          <button type="button" className="hsp-btn sm pri" onClick={() => openForm('raw')}>
            ＋ Add Billet Entry
          </button>
        </div>

        <div className="hsp-scroll-wrap">
          <table className="hsp-table-main">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th className="left-align" style={{ minWidth: '180px' }}>Billet Size</th>
                <th style={{ minWidth: '120px' }}>Billet Length (m)</th>
                <th style={{ minWidth: '100px' }}>Charged Pcs</th>
                <th style={{ minWidth: '110px' }}>WT (MT)</th>
                <th className="left-align" style={{ minWidth: '160px' }}>Remark</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {!currentReport || currentReport.raw.length === 0 ? (
                <tr>
                  <td colSpan={7} className="hsp-empty-state">
                    No raw material entries recorded yet.
                  </td>
                </tr>
              ) : (
                (() => {
                  const elements = [];
                  RAW_GROUPS.forEach((grp) => {
                    const groupRows = currentReport.raw.filter((x) => x.grp === grp);
                    if (!groupRows.length) return;
                    const groupTotal = groupRows.reduce((s, x) => s + (+x.wt || 0), 0);

                    elements.push(
                      <tr key={`grp-${grp}`} className="hsp-group-row">
                        <td colSpan={7}>
                          {grp.toUpperCase()} · {f3(groupTotal)} MT
                          {!INCLUDED_GROUPS.includes(grp) && ' (Excluded from total raw)'}
                        </td>
                      </tr>
                    );

                    groupRows.forEach((row) => {
                      const idx = currentReport.raw.indexOf(row);
                      elements.push(
                        <tr key={row.id}>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td className="left-align"><b>{row.size}</b></td>
                          <td>{f3(row.len)}</td>
                          <td>{row.pcs || 0}</td>
                          <td style={{ fontWeight: 700, color: 'var(--hsp-primary)' }}>{f3(row.wt)}</td>
                          <td className="left-align">
                            <input
                              className="hsp-remark-input"
                              defaultValue={row.rem || ''}
                              placeholder="Remark..."
                              onBlur={(e) => handleRemarkChange('raw', row.id, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="hsp-btn sm edit-btn"
                                onClick={() => openForm('raw', idx)}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="hsp-btn sm del-btn"
                                onClick={() => handleDeleteItem('raw', idx)}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  });

                  elements.push(
                    <tr key="raw-total-row" className="hsp-total-row">
                      <td colSpan={4} style={{ textAlign: 'right' }}>
                        TOTAL RAW CHARGED (Raw Material + Miss Roll)
                      </td>
                      <td style={{ fontSize: '15px' }}>{f3(summaryCalc.raw)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  );

                  return elements;
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finished Material Table */}
      <div className="hsp-table-card">
        <div className="hsp-table-title-bar">
          <div className="hsp-table-title-group">
            <span className="hsp-title-tag">FINISHED</span>
            <span className="hsp-table-title">FINISHED MATERIAL PRODUCTION</span>
            <span className="hsp-badge-count">{currentReport?.fin?.length || 0} entries</span>
          </div>
          <button type="button" className="hsp-btn sm pri" onClick={() => openForm('fin')}>
            ＋ Add Finished Entry
          </button>
        </div>

        <div className="hsp-scroll-wrap">
          <table className="hsp-table-main">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th className="left-align" style={{ minWidth: '180px' }}>Section Size</th>
                <th style={{ minWidth: '110px' }}>Section Wt (KG)</th>
                <th style={{ minWidth: '110px' }}>Length Mtr</th>
                <th style={{ minWidth: '90px' }}>Nos / Pcs</th>
                <th style={{ minWidth: '110px' }}>Total Wt (MT)</th>
                <th className="left-align" style={{ minWidth: '160px' }}>Remark (Embossing)</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {!currentReport || currentReport.fin.length === 0 ? (
                <tr>
                  <td colSpan={8} className="hsp-empty-state">
                    No finished material entries recorded yet.
                  </td>
                </tr>
              ) : (
                (() => {
                  const elements = currentReport.fin.map((x, i) => (
                    <tr key={x.id}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{i + 1}</td>
                      <td className="left-align"><b>{x.sec}</b></td>
                      <td>{f3(x.kg)}</td>
                      <td>{x.len}</td>
                      <td>{x.pcs || 0}</td>
                      <td style={{ fontWeight: 700, color: 'var(--hsp-primary)' }}>{f3(x.wt)}</td>
                      <td className="left-align">
                        <input
                          className="hsp-remark-input"
                          defaultValue={x.rem || ''}
                          placeholder="Remark (Embossing)..."
                          onBlur={(e) => handleRemarkChange('fin', x.id, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="hsp-btn sm edit-btn"
                            onClick={() => openForm('fin', i)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="hsp-btn sm del-btn"
                            onClick={() => handleDeleteItem('fin', i)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));

                  const totalPcs = currentReport.fin.reduce((s, x) => s + (+x.pcs || 0), 0);
                  elements.push(
                    <tr key="fin-total-row" className="hsp-total-row">
                      <td colSpan={4} style={{ textAlign: 'right' }}>
                        TOTAL PRODUCTION
                      </td>
                      <td>{totalPcs}</td>
                      <td style={{ fontSize: '15px' }}>{f3(summaryCalc.prod)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  );

                  return elements;
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="hsp-modal-overlay">
          <div className="hsp-modal-content">
            <div className="hsp-modal-header">
              <h3>
                {modalEditIdx != null ? '✏️ Update' : '＋ New'}{' '}
                {modalKind === 'raw' ? 'Raw Material (Billet)' : 'Finished Material'} Entry
              </h3>
              <button
                type="button"
                className="hsp-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="hsp-modal-body">
                <div className="hsp-modal-grid">
                  {(modalKind === 'raw' ? RAWF_CONFIG : FINF_CONFIG).map((f) => {
                    if (f.type === 'select') {
                      return (
                        <div key={f.key} className="hsp-field-group">
                          <label className="hsp-field-label">{f.label}</label>
                          <select
                            value={formFields[f.key] || ''}
                            onChange={(e) =>
                              setFormFields({ ...formFields, [f.key]: e.target.value })
                            }
                          >
                            {f.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={f.key} className="hsp-field-group">
                        <label className="hsp-field-label">{f.label}</label>
                        <input
                          type={f.type || 'text'}
                          step={f.step}
                          placeholder={f.placeholder || ''}
                          value={formFields[f.key] ?? ''}
                          onChange={(e) =>
                            setFormFields({ ...formFields, [f.key]: e.target.value })
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="hsp-btn sm"
                    onClick={handleAutoCalculateWeight}
                  >
                    🧮 Auto-calculate Weight (Estimate)
                  </button>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    (You can also type weight manually)
                  </span>
                </div>
              </div>

              <div className="hsp-modal-footer">
                <button
                  type="button"
                  className="hsp-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hsp-btn pri">
                  💾 Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
