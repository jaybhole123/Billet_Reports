import React, { useState, useMemo, useRef, useEffect } from 'react';
import './HeavyMillFinishStockKamDhenu.css';

// Length columns definition
export const COLS = [
  ['7.300 Mtr', '7.3'],
  ['7.400 Mtr', '7.4'],
  ['7.700 Mtr', '7.7'],
  ['8.0-8.150 Mtr', '8.0'],
  ['8.300 Mtr', '8.3'],
  ['9 Mtr', '9'],
  ['9.200 Mtr', '9.2'],
  ['9.700 Mtr', '9.7'],
  ['9.800 Mtr', '9.8'],
  ['10.000 Mtr', '10'],
  ['11 Mtr', '11'],
  ['12 Mtr', '12'],
  ['11.0-12.0 Mtr', '11-12'],
  ['13 Mtr', '13'],
  ['12.5 Ft (3.9Mtr)', '12.5F'],
  ['16 Ft (4.9Mtr)', '16F'],
  ['20 Ft (6.1Mtr)', '20F'],
  ['22 Ft (6.705Mtr)', '22F'],
  ['6.800 Mtr', '6.8'],
  ['6.0-6.5 Mtr', '6-6.5'],
  ['Random 16-21 Ft', 'R1'],
  ['Random 25-32 Ft', 'R2'],
  ['Defective', 'def'],
  ['Bend', 'bend'],
];

export const CATS = ['Channel', 'I Beam', 'H Beam 100X116', 'H Beam 152X152', 'Other'];

const getInitialSampleData = () => [];

const f3 = (n) => (+n || 0).toFixed(3);
const tot = (r) => COLS.reduce((s, c) => s + (+r.v[c[1]] || 0), 0);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]/g, '');

const guessCat = (s) => {
  const str = (s || '').toLowerCase();
  if (str.includes('channel')) return CATS[0];
  if (str.includes('i beam')) return CATS[1];
  if (str.includes('100x116')) return CATS[2];
  if (str.includes('152x152')) return CATS[3];
  return CATS[4];
};

export default function HeavyMillFinishStockKamDhenu() {
  const [data, setData] = useState(() => {
    try {
      const isCleared = localStorage.getItem('kamdhenu_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('hmstock2');
        localStorage.setItem('kamdhenu_cleared_v1', 'true');
        return [];
      }
      const saved = localStorage.getItem('hmstock2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    const p = (n) => ('0' + n).slice(-2);
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
  });

  const [searchQ, setSearchQ] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [message, setMessage] = useState({ text: '', isErr: false });

  // Image preview state
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formFields, setFormFields] = useState({
    sl: '',
    sec: '',
    cat: CATS[0],
    v: {},
    rem: '',
  });

  const xFileRef = useRef(null);
  const iFileRef = useRef(null);

  // Save to localStorage
  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('hmstock2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const showMsg = (text, isErr = false) => {
    setMessage({ text, isErr });
  };

  // Auto calculate next SL number
  const getNextSl = () => {
    let max = 0;
    data.forEach((r) => {
      const val = parseInt(r.sl, 10);
      if (!isNaN(val) && val > max) max = val;
    });
    return String(max + 1);
  };

  // Open Form
  const openForm = (id = null) => {
    setEditId(id);
    if (id) {
      const r = data.find((x) => x.id === id);
      if (r) {
        setFormFields({
          sl: r.sl,
          sec: r.sec,
          cat: r.cat || guessCat(r.sec),
          v: { ...r.v },
          rem: r.rem || '',
        });
      }
    } else {
      setFormFields({
        sl: getNextSl(),
        sec: '',
        cat: CATS[0],
        v: {},
        rem: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const sec = formFields.sec.trim();
    if (!sec) {
      showMsg('Kripya Section ka naam likhein.', true);
      return;
    }

    const cleanV = {};
    Object.keys(formFields.v).forEach((k) => {
      const val = +formFields.v[k];
      if (val) cleanV[k] = val;
    });

    const o = {
      sl: +formFields.sl || 0,
      sec,
      cat: formFields.cat,
      v: cleanV,
      rem: formFields.rem.trim(),
    };

    if (editId) {
      updateData((prev) => prev.map((r) => (r.id === editId ? { ...r, ...o } : r)));
      showMsg('Entry safalta-poorvak update ho gayi.');
    } else {
      updateData((prev) => [...prev, { id: Date.now(), ...o }]);
      showMsg('Nayi entry add ho gayi.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const r = data.find((x) => x.id === id);
    if (window.confirm(`"${r?.sec || 'Is entry'}" ko delete karein?`)) {
      updateData((prev) => prev.filter((x) => x.id !== id));
      showMsg('Entry delete ho gayi.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Kya aap saara data delete karna chahte hain?')) {
      updateData([]);
      showMsg('Saara data clear kar diya gaya.');
    }
  };

  const handleRemarkChange = (id, val) => {
    updateData((prev) => prev.map((r) => (r.id === id ? { ...r, rem: val } : r)));
  };

  // Excel Upload
  const handleReadExcel = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('XLSX library load nahi hui.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        let count = 0;
        const newItems = [];

        rows.forEach((x) => {
          const g = {};
          Object.keys(x).forEach((k) => (g[norm(k)] = x[k]));
          const sec = g.section || g.sec;
          if (!sec) return;

          const v = {};
          COLS.forEach((c) => {
            const val = +(g[norm(c[0])] || g[norm(c[1])] || 0);
            if (val) v[c[1]] = val;
          });

          newItems.push({
            id: Date.now() + count++,
            sl: +g.sl || +g.slno || 0,
            sec: String(sec),
            cat: CATS.find((c) => norm(c) === norm(g.category || '')) || guessCat(String(sec)),
            v,
            rem: g.remark || '',
          });
        });

        if (newItems.length) {
          updateData((prev) => [...prev, ...newItems]);
          showMsg(`${newItems.length} rows Excel se safalta-poorvak load ho gayin.`);
        } else {
          showMsg('Excel sheet me koi valid data nahi mila.', true);
        }
      } catch (err) {
        showMsg('Excel parse karne me error: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Image Upload for quick review
  const handleReadImage = (file) => {
    if (!file || file.type.indexOf('image') !== 0) {
      showMsg('Sirf image file select karein.', true);
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedImageSrc(url);
    setImageZoom(1);
    showMsg('Image preview load ho gaya.');
  };

  // Export to Excel
  const handleExportExcel = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('XLSX library load nahi hai.', true);
      return;
    }
    const exportRows = data.map((r) => {
      const o = { SL: r.sl, Section: r.sec, Category: r.cat };
      COLS.forEach((c) => {
        o[c[0]] = r.v[c[1]] || '';
      });
      o.TOTAL = tot(r);
      o.Remark = r.rem;
      return o;
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), 'Kamdhenu_Stock');
    XLSX.writeFile(wb, `Heavy_Mill_Finish_Stock_Kamdhenu_${dateStr}.xlsx`);
    showMsg('Excel file download ho gayi.');
  };

  // Filtered rows & Stats
  const { filteredRows, stats, categoryTotals } = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    const rows = data
      .filter((r) => {
        if (filterCat && r.cat !== filterCat) return false;
        if (q && !r.sec.toLowerCase().includes(q) && !(r.rem || '').toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat) || a.sl - b.sl);

    const catSums = {};
    let grandTot = 0;
    let defTot = 0;
    let bendTot = 0;

    rows.forEach((r) => {
      const t = tot(r);
      catSums[r.cat] = (catSums[r.cat] || 0) + t;
      grandTot += t;
      defTot += +r.v.def || 0;
      bendTot += +r.v.bend || 0;
    });

    return {
      filteredRows: rows,
      stats: {
        grandTotal: grandTot,
        defective: defTot,
        bend: bendTot,
        totalSections: rows.length,
      },
      categoryTotals: catSums,
    };
  }, [data, searchQ, filterCat]);

  // Form total calculation
  const modalFormTotal = useMemo(() => {
    return Object.values(formFields.v).reduce((acc, curr) => acc + (+curr || 0), 0);
  }, [formFields.v]);

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
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
  }, [isModalOpen, data]);

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
      className={`hm-page-container ${isDragOver ? 'global-drag-active' : ''}`}
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
      <div className="hm-page-header">
        <h2>Heavy Mill Finish Stock (KamDhenu)</h2>
        <p>Heavy mill finished goods inventory breakdown, length distribution &amp; defectives summary</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="hm-kpi-grid">
        <div className="hm-kpi-card highlight">
          <div className="hm-kpi-label">Grand Total Stock [MT]</div>
          <div className="hm-kpi-value">{f3(stats.grandTotal)}</div>
          <div className="hm-kpi-sub">Total Bundled Weight</div>
        </div>

        <div className="hm-kpi-card danger">
          <div className="hm-kpi-label">Defective Total [MT]</div>
          <div className="hm-kpi-value">{f3(stats.defective)}</div>
          <div className="hm-kpi-sub">Defective Sections</div>
        </div>

        <div className="hm-kpi-card blue">
          <div className="hm-kpi-label">Bend Total [MT]</div>
          <div className="hm-kpi-value">{f3(stats.bend)}</div>
          <div className="hm-kpi-sub">Bent / Rework Stock</div>
        </div>

        <div className="hm-kpi-card success">
          <div className="hm-kpi-label">Total Sections</div>
          <div className="hm-kpi-value">{stats.totalSections}</div>
          <div className="hm-kpi-sub">Active Product Profiles</div>
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
      <div className="hm-toolbar-card">
        <div className="hm-toolbar-left">
          <button type="button" className="hm-btn pri" onClick={() => openForm()}>
            + New Entry
          </button>

          <button type="button" className="hm-btn" onClick={handleExportExcel}>
            📤 Export Excel
          </button>

          <button type="button" className="hm-btn danger-outline" onClick={handleClearAll}>
            Clear Data
          </button>
        </div>

        <div className="hm-toolbar-right">
          <div className="hm-search-wrap">
            <span className="hm-search-icon">🔍</span>
            <input
              className="hm-input"
              placeholder="Search section or remark..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>

          <select
            className="hm-select"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="hm-date-box">
            <span>Date:</span>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="DD-MM-YYYY"
              style={{ width: '105px' }}
            />
          </div>
        </div>
      </div>

      {/* Status Alert Badge */}
      {message.text && (
        <div>
          <div className={`hm-msg-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Image Preview Box if Uploaded */}
      {uploadedImageSrc && (
        <div className="hm-img-preview-card">
          <div className="hm-img-preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b>🖼️ Uploaded Sheet Reference Image</b>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (Image dekh kar entries verify ya add karein)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="hm-btn sm"
                onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
              >
                ＋ Zoom
              </button>
              <button
                type="button"
                className="hm-btn sm"
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
              >
                － Zoom
              </button>
              <button
                type="button"
                className="hm-btn sm pri"
                onClick={() => openForm()}
              >
                ＋ Nayi Entry
              </button>
              <button
                type="button"
                className="hm-btn sm"
                onClick={() => setUploadedImageSrc(null)}
              >
                ✖ Close
              </button>
            </div>
          </div>
          <div className="hm-img-preview-body">
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

      {/* Main Stock Table */}
      <div className="hm-table-card">
        <div className="hm-table-title-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="hm-title-tag">KAMDHENU</span>
            <span className="hm-table-title">HEAVY MILL FINISH STOCK REPORT</span>
            <span className="hm-badge-count">{filteredRows.length} entries</span>
          </div>
        </div>

        <div className="hm-scroll-wrap">
          <table className="hm-table-main">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>SL</th>
                <th className="left-align sticky-sec" style={{ minWidth: '220px' }}>
                  Section
                </th>
                {COLS.map((c) => (
                  <th key={c[1]}>{c[0]}</th>
                ))}
                <th style={{ minWidth: '90px' }}>Total</th>
                <th className="left-align" style={{ minWidth: '180px' }}>
                  Remark
                </th>
                <th style={{ textAlign: 'center', minWidth: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length + 5} className="hm-empty-state">
                    Koi data nahi mila. '+ Nayi Entry' ya 'Excel Upload' se shuru karein.
                  </td>
                </tr>
              ) : (
                (() => {
                  let lastCat = null;
                  const elements = [];

                  filteredRows.forEach((r) => {
                    if (r.cat !== lastCat) {
                      lastCat = r.cat;
                      elements.push(
                        <tr key={`cat-${r.cat}`} className="hm-cat-row">
                          <td colSpan={COLS.length + 5}>
                            <span>{r.cat}</span>
                            <span className="hm-cat-badge">
                              Sub-total: {f3(categoryTotals[r.cat])} MT
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    const rowTotal = tot(r);

                    elements.push(
                      <tr key={r.id}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{r.sl}</td>
                        <td className="left-align sticky-sec">{r.sec}</td>
                        {COLS.map((c) => {
                          const val = r.v[c[1]];
                          let cellClass = '';
                          if (!val) {
                            cellClass = 'cell-zero';
                          } else if (c[1] === 'def') {
                            cellClass = 'cell-def';
                          } else if (c[1] === 'bend') {
                            cellClass = 'cell-bend';
                          }

                          return (
                            <td key={c[1]} className={cellClass}>
                              {val ? f3(val) : '–'}
                            </td>
                          );
                        })}
                        <td className="cell-total">{f3(rowTotal)}</td>
                        <td className="left-align">
                          <input
                            className="hm-remark-input"
                            defaultValue={r.rem || ''}
                            placeholder="Remark..."
                            onBlur={(e) => handleRemarkChange(r.id, e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="hm-btn sm edit-btn"
                              onClick={() => openForm(r.id)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="hm-btn sm del-btn"
                              onClick={() => handleDelete(r.id)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });

                  return elements;
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Entry Modal */}
      {isModalOpen && (
        <div className="hm-modal-overlay">
          <div className="hm-modal-content">
            <div className="hm-modal-header">
              <h3>{editId ? '✏️ Update Entry' : '＋ New Entry (Heavy Mill Kamdhenu)'}</h3>
              <button
                type="button"
                className="hm-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="hm-modal-body">
                <div
                  className="hm-form-row"
                  style={{ gridTemplateColumns: '90px 1fr 220px' }}
                >
                  <div>
                    <label className="hm-form-label">SL No. (Auto)</label>
                    <input
                      className="hm-input"
                      type="number"
                      value={formFields.sl}
                      readOnly
                      style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="hm-form-label">Section *</label>
                    <input
                      className="hm-input"
                      placeholder="e.g. 150X75 (Channel -Normal)"
                      value={formFields.sec}
                      onChange={(e) => setFormFields({ ...formFields, sec: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="hm-form-label">Category</label>
                    <select
                      className="hm-select"
                      value={formFields.cat}
                      onChange={(e) => setFormFields({ ...formFields, cat: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      {CATS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="hm-subheading">📏 Length-Wise Quantities [MT]</div>
                <div className="hm-grid-lengths">
                  {COLS.map((c) => (
                    <div key={c[1]}>
                      <label className="hm-form-label" style={{ fontSize: '11px' }}>
                        {c[0]}
                      </label>
                      <input
                        className="hm-input"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        value={formFields.v[c[1]] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormFields((prev) => ({
                            ...prev,
                            v: {
                              ...prev.v,
                              [c[1]]: val,
                            },
                          }));
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label className="hm-form-label">Remark</label>
                  <input
                    className="hm-input"
                    placeholder="Optional remark..."
                    value={formFields.rem}
                    onChange={(e) => setFormFields({ ...formFields, rem: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="hm-modal-footer">
                <div style={{ marginRight: 'auto', fontSize: '14px', fontWeight: 600 }}>
                  Calculated Total:{' '}
                  <span style={{ color: 'var(--hm-primary)', fontSize: '18px', fontWeight: 700 }}>
                    {f3(modalFormTotal)} MT
                  </span>
                </div>
                <button
                  type="button"
                  className="hm-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hm-btn pri">
                  💾 Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
