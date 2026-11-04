import React, { useState, useMemo, useRef, useEffect } from 'react';
import DateNavigator from '../components/DateNavigator';
import './YesterdayIncoming.css';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fd = (d) => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, x] = parts;
  return `${x}-${MON[parseInt(m, 10) - 1] || m}-${y.slice(2)}`;
};

const f3 = (n) => (+n || 0).toFixed(3);
const ik = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const sh = (r) => Math.round(((+r.rec || 0) - (+r.desp || 0)) * 1000) / 1000;

const getInitialSampleData = () => [];

export default function YesterdayIncoming() {
  const [data, setData] = useState(() => {
    try {
      const isCleared = localStorage.getItem('incoming_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('bill_reg');
        localStorage.setItem('incoming_cleared_v1', 'true');
        return [];
      }
      const saved = localStorage.getItem('bill_reg');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [searchQ, setSearchQ] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState({ text: '', isErr: false });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formFields, setFormFields] = useState({
    date: new Date().toISOString().slice(0, 10),
    bdate: '',
    inv: '',
    do: '',
    thr: '',
    party: '',
    truck: '',
    item: '',
    desp: '',
    rec: '',
    rate: '',
    rem: '',
  });

  // Image preview state
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);

  const xFileRef = useRef(null);
  const iFileRef = useRef(null);

  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('bill_reg', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const showMsg = (text, isErr = false) => {
    setMessage({ text, isErr });
  };

  // Open Form
  const openForm = (id = null) => {
    setEditId(id);
    if (id) {
      const r = data.find((x) => x.id === id);
      if (r) {
        setFormFields({
          date: r.date || '',
          bdate: r.bdate || '',
          inv: r.inv || '',
          do: r.do || '',
          thr: r.thr || '',
          party: r.party || '',
          truck: r.truck || '',
          item: r.item || '',
          desp: r.desp ?? '',
          rec: r.rec ?? '',
          rate: r.rate ?? '',
          rem: r.rem || '',
        });
      }
    } else {
      setFormFields({
        date: new Date().toISOString().slice(0, 10),
        bdate: new Date().toISOString().slice(0, 10),
        inv: '',
        do: '',
        thr: '',
        party: '',
        truck: '',
        item: '',
        desp: '',
        rec: '',
        rate: '',
        rem: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formFields.party.trim() || !formFields.item.trim()) {
      showMsg('Party Name aur Item zaroori hain.', true);
      return;
    }

    const payload = {
      ...formFields,
      desp: formFields.desp ? +formFields.desp : 0,
      rec: formFields.rec ? +formFields.rec : 0,
      rate: formFields.rate ? +formFields.rate : 0,
    };

    if (editId) {
      updateData((prev) => prev.map((x) => (x.id === editId ? { ...x, ...payload } : x)));
      showMsg('Entry update ho gayi.');
    } else {
      updateData((prev) => [...prev, { id: Date.now(), ...payload }]);
      showMsg('Nayi entry add ho gayi.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const r = data.find((x) => x.id === id);
    if (window.confirm(`Delete entry for "${r?.party || 'this entry'}"?`)) {
      updateData((prev) => prev.filter((x) => x.id !== id));
      showMsg('Entry delete ho gayi.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Saara purchase register data clear karein?')) {
      updateData([]);
      showMsg('Saara data clear ho gaya.');
    }
  };

  const handleRemarkChange = (id, val) => {
    updateData((prev) => prev.map((r) => (r.id === id ? { ...r, rem: val } : r)));
  };

  // Helper date parsing
  const parseDateStr = (v) => {
    v = String(v || '').trim();
    if (!v) return '';
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = v.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[a-z]*[-\s,]*(\d{2,4})$/);
    if (m) {
      const mo = MON.findIndex((x) => x.toLowerCase() === m[2].toLowerCase()) + 1;
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      if (mo) return `${y}-${String(mo).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    m = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (m) {
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return '';
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
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
        let count = 0;
        const newItems = [];

        rows.forEach((x) => {
          const g = {};
          Object.keys(x).forEach((k) => (g[norm(k)] = x[k]));
          const party = g.partyname || g.party;
          const item = g.item;
          if (!party || !item) return;

          const nm = (v) => parseFloat(String(v || '').replace(/,/g, '')) || 0;

          newItems.push({
            id: Date.now() + Math.random(),
            date: parseDateStr(g.date),
            bdate: parseDateStr(g.billdate),
            inv: String(g.invno || g.inv || ''),
            do: String(g.dono || g.do || ''),
            thr: String(g.through || ''),
            party: String(party),
            truck: String(g.truckno || g.truck || ''),
            item: String(item),
            desp: nm(g.despqty || g.desp),
            rec: nm(g.recqty || g.rec),
            rate: nm(g.basicrate || g.rate),
            rem: String(g.remark || ''),
          });
          count++;
        });

        if (count) {
          updateData((prev) => [...prev, ...newItems]);
          showMsg(`${count} rows imported from Excel.`);
        } else {
          showMsg('No valid rows found in Excel sheet.', true);
        }
      } catch (err) {
        showMsg('Error reading Excel: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Image Upload
  const handleReadImage = (file) => {
    if (!file || file.type.indexOf('image') !== 0) {
      showMsg('Please select a valid image file.', true);
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedImageSrc(url);
    setImageZoom(1);
    showMsg('Reference image preview loaded.');
  };

  // Drag and Drop & Paste
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

  // Export Excel
  const handleExportExcel = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('XLSX library not loaded.', true);
      return;
    }
    const exportRows = data.map((r, i) => ({
      Sn: i + 1,
      Date: fd(r.date),
      'Bill date': fd(r.bdate),
      'Inv. No.': r.inv,
      'D.O. No.': r.do,
      Through: r.thr,
      'Party Name': r.party,
      'Truck No.': r.truck,
      Item: r.item,
      'Desp Qty': r.desp,
      'Rec Qty': r.rec,
      Shortage: sh(r),
      'Basic Rate': r.rate,
      Remark: r.rem,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), 'Register');
    XLSX.writeFile(wb, 'Billet_Purchase_Register.xlsx');
    showMsg('Excel file downloaded.');
  };

  // Unique item options for filter & datalists
  const uniqueItems = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.item).filter(Boolean))).sort();
  }, [data]);

  const uniqueDatalists = useMemo(() => {
    const thr = new Set();
    const party = new Set();
    const truck = new Set();
    data.forEach((r) => {
      if (r.thr) thr.add(r.thr);
      if (r.party) party.add(r.party);
      if (r.truck) truck.add(r.truck);
    });
    return {
      thr: Array.from(thr).sort(),
      party: Array.from(party).sort(),
      truck: Array.from(truck).sort(),
    };
  }, [data]);

  // Filter rows & Statistics
  const { filteredRows, stats, groupedOrders } = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    const rows = data.filter((r) => {
      if (selectedDate && r.date && r.date !== selectedDate) return false;
      if (filterItem && r.item !== filterItem) return false;
      if (q) {
        const text = [r.party, r.inv, r.truck, r.do, r.thr, r.item, r.rem].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    const orders = [];
    rows.forEach((r) => {
      const k = ik(r.item);
      if (!orders.includes(k)) orders.push(k);
    });

    const totalDesp = rows.reduce((s, x) => s + (+x.desp || 0), 0);
    const totalRec = rows.reduce((s, x) => s + (+x.rec || 0), 0);
    const netDiff = totalRec - totalDesp;
    const shortageTrucks = rows.filter((x) => sh(x) < 0).length;
    const totalVal = rows.reduce((s, x) => s + (+x.rec || 0) * (+x.rate || 0), 0);

    return {
      filteredRows: rows,
      groupedOrders: orders,
      stats: {
        totalDesp,
        totalRec,
        netDiff,
        shortageTrucks,
        totalVal,
      },
    };
  }, [data, searchQ, filterItem, selectedDate]);

  return (
    <div
      className={`yi-page-container ${isDragOver ? 'global-drag-active' : ''}`}
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
      <div className="yi-page-header">
        <h2>Yesterday Incoming</h2>
        <p>Inbound raw material dispatch, receiving weights, truck shortages &amp; basic rates</p>
      </div>

      {/* Single-Row KPI Metrics Grid */}
      <div className="yi-kpi-grid">
        <div className="yi-kpi-card highlight">
          <div className="yi-kpi-label">Total Despatch Qty</div>
          <div className="yi-kpi-value">{f3(stats.totalDesp)} MT</div>
          <div className="yi-kpi-sub">Supplier Invoice Weight</div>
        </div>

        <div className="yi-kpi-card success">
          <div className="yi-kpi-label">Total Received Qty</div>
          <div className="yi-kpi-value">{f3(stats.totalRec)} MT</div>
          <div className="yi-kpi-sub">Plant Scale Weight</div>
        </div>

        <div className={`yi-kpi-card ${stats.netDiff < 0 ? 'danger' : 'blue'}`}>
          <div className="yi-kpi-label">Net Shortage / Excess</div>
          <div className="yi-kpi-value">{f3(stats.netDiff)} MT</div>
          <div className="yi-kpi-sub">{stats.netDiff < 0 ? 'Weight Loss (Short)' : 'Gain / Excess'}</div>
        </div>

        <div className="yi-kpi-card danger">
          <div className="yi-kpi-label">Shortage Trucks</div>
          <div className="yi-kpi-value">{stats.shortageTrucks} Trucks</div>
          <div className="yi-kpi-sub">Vehicles with weight drop</div>
        </div>

        <div className="yi-kpi-card">
          <div className="yi-kpi-label">Total Value (Rec × Rate)</div>
          <div className="yi-kpi-value">₹ {Math.round(stats.totalVal).toLocaleString('en-IN')}</div>
          <div className="yi-kpi-sub">Estimated Procurement Value</div>
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

      {/* Single-Row Executive Toolbar */}
      <div className="yi-toolbar-card">
        <div className="yi-toolbar-left">
          <button type="button" className="yi-btn pri" onClick={() => openForm()}>
            + New Entry
          </button>

          <button type="button" className="yi-btn danger-outline" onClick={handleClearAll}>
            Clear Data
          </button>
        </div>

        <div className="yi-toolbar-right">
          <div className="yi-search-wrap">
            <span className="yi-search-icon">🔍</span>
            <input
              className="yi-input"
              placeholder="Party, inv, truck, DO..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>

          <select
            className="yi-select"
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
          >
            <option value="">All Items</option>
            {uniqueItems.map((it) => (
              <option key={it} value={it}>
                {it}
              </option>
            ))}
          </select>

          <DateNavigator value={selectedDate} onChange={setSelectedDate} />

          {(searchQ || filterItem) && (
            <button
              type="button"
              className="yi-btn sm"
              onClick={() => {
                setSearchQ('');
                setFilterItem('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Badge */}
      {message.text && (
        <div>
          <div className={`yi-msg-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Image Preview Box */}
      {uploadedImageSrc && (
        <div className="yi-img-preview-card">
          <div className="yi-img-preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b>🖼️ Register Reference Image</b>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                (Verify purchase bill records against uploaded photo)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="yi-btn sm"
                onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
              >
                ＋ Zoom
              </button>
              <button
                type="button"
                className="yi-btn sm"
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
              >
                － Zoom
              </button>
              <button
                type="button"
                className="yi-btn sm pri"
                onClick={() => openForm()}
              >
                ＋ New Entry
              </button>
              <button
                type="button"
                className="yi-btn sm"
                onClick={() => setUploadedImageSrc(null)}
              >
                ✖ Close
              </button>
            </div>
          </div>
          <div className="yi-img-preview-body">
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

      {/* Main Register Table */}
      <div className="yi-table-card">
        <div className="yi-table-title-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="yi-title-tag">INCOMING</span>
            <span className="yi-table-title">BILLET INCOMING REGISTER REPORT</span>
            <span className="yi-badge-count">{filteredRows.length} entries</span>
          </div>
        </div>

        <div className="yi-scroll-wrap">
          <table className="yi-table-main">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>Sn</th>
                <th className="left-align" style={{ minWidth: '100px' }}>Date</th>
                <th className="left-align" style={{ minWidth: '100px' }}>Bill Date</th>
                <th className="left-align" style={{ minWidth: '130px' }}>Inv. No.</th>
                <th className="left-align" style={{ minWidth: '95px' }}>D.O. No.</th>
                <th className="left-align" style={{ minWidth: '160px' }}>Through</th>
                <th className="left-align sticky-col" style={{ minWidth: '220px' }}>Party Name</th>
                <th className="left-align" style={{ minWidth: '120px' }}>Truck No.</th>
                <th className="left-align" style={{ minWidth: '150px' }}>Item</th>
                <th style={{ minWidth: '100px' }}>Desp Qty</th>
                <th style={{ minWidth: '100px' }}>Rec Qty</th>
                <th style={{ minWidth: '90px' }}>Shortage</th>
                <th style={{ minWidth: '100px' }}>Basic Rate</th>
                <th className="left-align" style={{ minWidth: '170px' }}>Remark</th>
                <th style={{ textAlign: 'center', width: '105px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="yi-empty-state">
                    No records found. Click '+ New Entry' or upload a file to begin.
                  </td>
                </tr>
              ) : (
                (() => {
                  let sn = 0;
                  const elements = [];

                  groupedOrders.forEach((k) => {
                    const groupRows = filteredRows.filter((r) => ik(r.item) === k);
                    if (!groupRows.length) return;

                    const gDesp = groupRows.reduce((s, x) => s + (+x.desp || 0), 0);
                    const gRec = groupRows.reduce((s, x) => s + (+x.rec || 0), 0);
                    const gShort = gRec - gDesp;

                    groupRows.forEach((r) => {
                      sn++;
                      const shortageVal = sh(r);
                      elements.push(
                        <tr key={r.id}>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{sn}</td>
                          <td className="left-align">{fd(r.date)}</td>
                          <td className="left-align">{fd(r.bdate)}</td>
                          <td className="left-align">{r.inv}</td>
                          <td className="left-align">{r.do}</td>
                          <td className="left-align">{r.thr}</td>
                          <td className="left-align sticky-col"><b>{r.party}</b></td>
                          <td className="left-align">{r.truck}</td>
                          <td className="left-align">{r.item}</td>
                          <td>{f3(r.desp)}</td>
                          <td>{f3(r.rec)}</td>
                          <td
                            className={
                              shortageVal < 0
                                ? 'yi-cell-shortage'
                                : shortageVal > 0
                                ? 'yi-cell-excess'
                                : ''
                            }
                          >
                            {shortageVal !== 0 ? f3(shortageVal) : '–'}
                          </td>
                          <td>{(+r.rate || 0).toLocaleString('en-IN')}</td>
                          <td className="left-align">
                            <input
                              className="yi-remark-input"
                              defaultValue={r.rem || ''}
                              placeholder="Remark..."
                              onBlur={(e) => handleRemarkChange(r.id, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="yi-btn sm edit-btn"
                                onClick={() => openForm(r.id)}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="yi-btn sm del-btn"
                                onClick={() => handleDelete(r.id)}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });

                    // Subtotal for Item
                    elements.push(
                      <tr key={`tot-${k}`} className="yi-group-row">
                        <td colSpan={9} style={{ textAlign: 'right' }}>
                          TOTAL — {groupRows[0].item}
                        </td>
                        <td className="yi-group-total">{f3(gDesp)}</td>
                        <td className="yi-group-total">{f3(gRec)}</td>
                        <td className="yi-group-total">{f3(gShort)}</td>
                        <td colSpan={3}></td>
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

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="yi-modal-overlay">
          <div className="yi-modal-content">
            <div className="yi-modal-header">
              <h3>{editId ? '✏️ Update Billet Entry' : '＋ New Billet Entry (Manual)'}</h3>
              <button
                type="button"
                className="yi-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="yi-modal-body">
                <div className="yi-modal-grid">
                  <div className="yi-field-group">
                    <label className="yi-field-label">Date</label>
                    <input
                      type="date"
                      value={formFields.date}
                      onChange={(e) => setFormFields({ ...formFields, date: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Bill Date</label>
                    <input
                      type="date"
                      value={formFields.bdate}
                      onChange={(e) => setFormFields({ ...formFields, bdate: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Invoice No.</label>
                    <input
                      placeholder="e.g. FGS26-27-01375"
                      value={formFields.inv}
                      onChange={(e) => setFormFields({ ...formFields, inv: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">D.O. No.</label>
                    <input
                      placeholder="e.g. 000616"
                      value={formFields.do}
                      onChange={(e) => setFormFields({ ...formFields, do: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Through (Broker / Direct)</label>
                    <input
                      list="dl-thr"
                      placeholder="e.g. Direct / Kanuj Khanna"
                      value={formFields.thr}
                      onChange={(e) => setFormFields({ ...formFields, thr: e.target.value })}
                    />
                    <datalist id="dl-thr">
                      {uniqueDatalists.thr.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Party Name *</label>
                    <input
                      list="dl-party"
                      placeholder="Supplier / Mill Name"
                      value={formFields.party}
                      onChange={(e) => setFormFields({ ...formFields, party: e.target.value })}
                      required
                    />
                    <datalist id="dl-party">
                      {uniqueDatalists.party.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Truck No.</label>
                    <input
                      list="dl-truck"
                      placeholder="e.g. CG11AB3266"
                      value={formFields.truck}
                      onChange={(e) => setFormFields({ ...formFields, truck: e.target.value })}
                    />
                    <datalist id="dl-truck">
                      {uniqueDatalists.truck.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Item / Material *</label>
                    <input
                      list="dl-item"
                      placeholder="e.g. Ms.Billet(200X160)"
                      value={formFields.item}
                      onChange={(e) => setFormFields({ ...formFields, item: e.target.value })}
                      required
                    />
                    <datalist id="dl-item">
                      {uniqueItems.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Desp Qty (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formFields.desp}
                      onChange={(e) => setFormFields({ ...formFields, desp: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Rec Qty (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formFields.rec}
                      onChange={(e) => setFormFields({ ...formFields, rec: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Basic Rate (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 44020"
                      value={formFields.rate}
                      onChange={(e) => setFormFields({ ...formFields, rate: e.target.value })}
                    />
                  </div>

                  <div className="yi-field-group">
                    <label className="yi-field-label">Remark</label>
                    <input
                      placeholder="Optional remark..."
                      value={formFields.rem}
                      onChange={(e) => setFormFields({ ...formFields, rem: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: 600 }}>
                  Calculated Shortage (Rec − Desp):{' '}
                  <span
                    style={{
                      color:
                        (+formFields.rec || 0) - (+formFields.desp || 0) < 0
                          ? 'var(--yi-danger)'
                          : 'var(--yi-success)',
                      fontWeight: 700,
                    }}
                  >
                    {f3((+formFields.rec || 0) - (+formFields.desp || 0))} MT
                  </span>
                </div>
              </div>

              <div className="yi-modal-footer">
                <button
                  type="button"
                  className="yi-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="yi-btn pri">
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
