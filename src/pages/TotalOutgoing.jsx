import React, { useState, useMemo, useRef, useEffect } from 'react';
import DateNavigator from '../components/DateNavigator';
import './TotalOutgoing.css';

const fd = (d) => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const f3 = (n) => (+n || 0).toFixed(3);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const nm = (v) => parseFloat(String(v || 0).replace(/,/g, '')) || 0;

const bal = (r) => Math.round(((+r.prv || 0) - (+r.db || 0) - (+r.dw || 0)) * 1000) / 1000;

const GROUP_COLORS = {
  'mill scale': '#16a34a',
  'ms. billets': '#f59e0b',
  'other': '#2563eb'
};

const PALETTE = ['#2563eb', '#9333ea', '#0d9488', '#db2777', '#4f46e5'];

const getInitialSampleData = () => [];

export default function TotalOutgoing() {
  const [data, setData] = useState(() => {
    try {
      const isCleared = localStorage.getItem('total_outgoing_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('sauda_reg');
        localStorage.setItem('total_outgoing_cleared_v1', 'true');
        return [];
      }
      const saved = localStorage.getItem('sauda_reg');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rows) return parsed.rows;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [reportDate, setReportDate] = useState(() => {
    try {
      const saved = localStorage.getItem('sauda_reg');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rd) return parsed.rd;
      }
    } catch (e) {
      console.error(e);
    }
    return '2026-10-25';
  });

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParty, setSelectedParty] = useState('');

  // Modals & form
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    grp: 'Mill Scale',
    date: '2026-10-25',
    mat: '',
    party: '',
    sauda: '',
    rate: '',
    prv: '',
    db: 0,
    dw: 0,
    rem: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Reference Image
  const [refImage, setRefImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sauda_reg', JSON.stringify({ rows: data, rd: reportDate }));
    } catch (e) {
      console.error(e);
    }
  }, [data, reportDate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const parseImportDate = (v) => {
    v = String(v || '').trim();
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    m = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (m) {
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return '';
  };

  // Import Excel File using window.XLSX
  const handleExcelImport = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
        let count = 0;
        let curId = Date.now();
        const imported = [];

        rows.forEach((x) => {
          const g = {};
          Object.keys(x).forEach((k) => {
            g[norm(k)] = x[k];
          });
          const p = g.partyname || g.party;
          if (!p) return;

          const mat = String(g.material || '');
          const grp = g.group || (/scale/i.test(mat) ? 'Mill Scale' : /billet/i.test(mat) ? 'Ms. Billets' : 'Other');

          imported.push({
            id: ++curId,
            grp: String(grp),
            date: parseImportDate(g.date) || reportDate,
            mat,
            party: String(p),
            sauda: nm(g.saudaqty || g.sauda),
            rate: nm(g.basicrate || g.rate),
            prv: nm(g.prvpending || g.prv),
            db: nm(g.qtydispatchb || g.db),
            dw: nm(g.qtydispatchw || g.dw),
            rem: String(g.remark || g.rem || '')
          });
          count++;
        });

        if (imported.length > 0) {
          setData((prev) => [...prev, ...imported]);
          showToast(`Successfully imported ${count} sauda records!`);
        } else {
          showToast('No valid records found in Excel sheet.');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Reference Image Upload
  const handleImageImport = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRefImage(url);
    setImageZoom(1);
    showToast('Reference image uploaded! Inspect while updating entries.');
  };

  // Export Excel
  const handleExport = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }

    const exportRows = data.map((r) => ({
      Group: r.grp,
      Date: fd(r.date),
      Material: r.mat,
      'Party Name': r.party,
      'Sauda Qty': r.sauda,
      'Basic Rate': r.rate,
      'Prv. Pending': r.prv,
      'Qty. Dispatch (B)': r.db,
      'Qty. Dispatch (W)': r.dw,
      'Balance Pending': bal(r),
      Remark: r.rem
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sauda Pending');
    XLSX.writeFile(wb, `Sauda_Pending_${reportDate}.xlsx`);
    showToast('Exported Sauda register to Excel!');
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }

    const headers = [
      'Group',
      'Date',
      'Material',
      'Party Name',
      'Sauda Qty',
      'Basic Rate',
      'Prv. Pending',
      'Qty. Dispatch (B)',
      'Qty. Dispatch (W)',
      'Remark'
    ];
    const sample = [
      'Mill Scale',
      '13/08/2026',
      'Mill Scale',
      'AD Minerals',
      200,
      7500,
      20.9,
      0,
      0,
      ''
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sauda');
    XLSX.writeFile(wb, 'Sauda_Pending_Template.xlsx');
    showToast('Template downloaded!');
  };

  // Carry Forward Action
  const handleCarryForward = () => {
    const n = new Date(reportDate + 'T00:00:00');
    n.setDate(n.getDate() + 1);
    const nextDate = n.toISOString().slice(0, 10);

    setConfirmModal({
      open: true,
      title: 'Carry Forward Pending to Next Day?',
      message: `Har row ka 'Balance Pending' agle din ka 'Prv. Pending' ban jayega, Dispatch (B & W) 0.000 ho jayega, aur Report Date ${fd(nextDate)} ho jayegi.`,
      confirmText: 'Carry Forward',
      onConfirm: () => {
        setData((prev) =>
          prev.map((r) => ({
            ...r,
            prv: bal(r),
            db: 0,
            dw: 0
          }))
        );
        setReportDate(nextDate);
        showToast(`Carry forward complete! Date set to ${fd(nextDate)}`);
        setConfirmModal({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null });
      }
    });
  };

  // Clear All Data
  const handleClearAll = () => {
    setConfirmModal({
      open: true,
      title: 'Clear All Sauda Records?',
      message: 'This will permanently remove all entries from the Sauda Pending Register.',
      confirmText: 'Clear All',
      onConfirm: () => {
        setData([]);
        showToast('All sauda records cleared.');
        setConfirmModal({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null });
      }
    });
  };

  // Global Drag & Drop & Paste Listeners
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const name = file.name.toLowerCase();
      if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
        handleExcelImport(file);
      } else if (file.type.startsWith('image/')) {
        handleImageImport(file);
      } else {
        showToast('Please drop an Excel spreadsheet or image file.');
      }
    };

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          handleImageImport(blob);
          e.preventDefault();
          break;
        } else if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const name = file.name.toLowerCase();
            if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
              handleExcelImport(file);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, [data, reportDate]);

  // Lists for dropdowns
  const groupList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.grp).filter(Boolean))).sort();
  }, [data]);

  const partyList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.party).filter(Boolean))).sort();
  }, [data]);

  const materialList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.mat).filter(Boolean))).sort();
  }, [data]);

  // Filtered Rows
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      if (reportDate && r.date && r.date !== reportDate) return false;
      if (selectedGroup && r.grp !== selectedGroup) return false;
      if (selectedParty && r.party !== selectedParty) return false;
      if (q) {
        const comb = `${r.grp} ${r.party} ${r.mat} ${r.rem}`.toLowerCase();
        if (!comb.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, selectedGroup, selectedParty, reportDate]);

  // Groups present in filtered data
  const distinctGroups = useMemo(() => {
    return Array.from(new Set(filteredData.map((r) => r.grp)));
  }, [filteredData]);

  // Global KPI totals
  const overallKPI = useMemo(() => {
    return {
      sauda: filteredData.reduce((s, r) => s + (+r.sauda || 0), 0),
      prv: filteredData.reduce((s, r) => s + (+r.prv || 0), 0),
      dispatched: filteredData.reduce((s, r) => s + (+r.db || 0) + (+r.dw || 0), 0),
      balance: filteredData.reduce((s, r) => s + bal(r), 0),
      openParties: new Set(filteredData.filter((r) => bal(r) > 0).map((r) => r.party)).size
    };
  }, [filteredData]);

  // Open Form
  const handleOpenAdd = () => {
    setEditItem(null);
    const last = data[data.length - 1] || {};
    setFormData({
      grp: last.grp || 'Mill Scale',
      date: reportDate,
      mat: last.mat || '',
      party: '',
      sauda: '',
      rate: '',
      prv: '',
      db: 0,
      dw: 0,
      rem: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditItem(row);
    setFormData({ ...row });
    setModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.party.trim()) {
      showToast('Please enter Party Name');
      return;
    }

    if (editItem) {
      setData((prev) =>
        prev.map((r) =>
          r.id === editItem.id
            ? {
                ...formData,
                sauda: +formData.sauda || 0,
                rate: +formData.rate || 0,
                prv: +formData.prv || 0,
                db: +formData.db || 0,
                dw: +formData.dw || 0
              }
            : r
        )
      );
      showToast('Sauda entry updated!');
    } else {
      const newEntry = {
        ...formData,
        id: Date.now(),
        sauda: +formData.sauda || 0,
        rate: +formData.rate || 0,
        prv: +formData.prv || 0,
        db: +formData.db || 0,
        dw: +formData.dw || 0
      };
      setData((prev) => [...prev, newEntry]);
      showToast('New Sauda entry added!');
    }
    setModalOpen(false);
  };

  const handleDeleteRow = (id, party, mat) => {
    setConfirmModal({
      open: true,
      title: 'Delete Sauda Entry?',
      message: `Are you sure you want to delete ${party} (${mat})?`,
      confirmText: 'Delete',
      onConfirm: () => {
        setData((prev) => prev.filter((r) => r.id !== id));
        showToast('Entry deleted!');
        setConfirmModal({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null });
      }
    });
  };

  const handleInlineRemarkChange = (id, val) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, rem: val } : r)));
  };

  // Preview form balance calculation
  const formBalance = Math.round(((+formData.prv || 0) - (+formData.db || 0) - (+formData.dw || 0)) * 1000) / 1000;

  return (
    <div className="sp-page-container">
      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="sp-drag-overlay">
          <div className="sp-drag-card">
            <span style={{ fontSize: '48px' }}>🤝</span>
            <h2>Drop Excel or Image File Here</h2>
            <p>Upload .xlsx/.xls/.csv sauda register or drop image to view</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="sp-header">
        <div className="sp-header-left">
          <div className="sp-logo-badge">🤝</div>
          <div className="sp-title-group">
            <h1>SAUDA PENDING REGISTER</h1>
            <p>Mill Scale · Ms. Billets · Party-wise Pending</p>
          </div>
        </div>

        <div className="sp-header-actions">
          <DateNavigator value={reportDate} onChange={setReportDate} />

          <button className="sp-btn" onClick={handleCarryForward} title="Balance ko agle din ka Prv. Pending bana deta hai">
            ⏭ Carry Forward
          </button>

          <button className="sp-btn sp-btn-primary pri" onClick={handleOpenAdd}>
            ＋ New Entry
          </button>

          <button className="sp-btn" onClick={handleDownloadTemplate} title="Download Excel template">
            ⬇ Template
          </button>
        </div>
      </div>

      {/* Single-Row KPI Summary Cards */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card">
          <span className="sp-kpi-label">Total Sauda Qty</span>
          <span className="sp-kpi-val" style={{ color: 'var(--sp-primary)' }}>
            {f3(overallKPI.sauda)} MT
          </span>
          <span className="sp-kpi-sub">Total deal booked</span>
        </div>

        <div className="sp-kpi-card blue">
          <span className="sp-kpi-label">Prv. Pending</span>
          <span className="sp-kpi-val">{f3(overallKPI.prv)} MT</span>
          <span className="sp-kpi-sub">Carried from previous</span>
        </div>

        <div className="sp-kpi-card green">
          <span className="sp-kpi-label">Dispatched (B + W)</span>
          <span className="sp-kpi-val">{f3(overallKPI.dispatched)} MT</span>
          <span className="sp-kpi-sub">Billed + Weight dispatch</span>
        </div>

        <div className="sp-kpi-card red">
          <span className="sp-kpi-label">Balance Pending</span>
          <span className="sp-kpi-val" style={{ color: 'var(--sp-danger)' }}>
            {f3(overallKPI.balance)} MT
          </span>
          <span className="sp-kpi-sub">Remaining balance</span>
        </div>

        <div className="sp-kpi-card amber">
          <span className="sp-kpi-label">Open Parties</span>
          <span className="sp-kpi-val">{overallKPI.openParties}</span>
          <span className="sp-kpi-sub">Pending balance parties</span>
        </div>
      </div>

      {/* Dual Dropzone Cards (Excel & Image) */}
      <div className="plant-dropzone-grid">
        <div
          className="plant-drop-card"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="plant-drop-icon">📁</div>
          <div className="plant-drop-title">Excel ya CSV file upload karein</div>
          <div className="plant-drop-subtitle">Click karein ya yahan drag &amp; drop karein (.xlsx, .xls, .csv)</div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleExcelImport(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>

        <div
          className="plant-drop-card image-card"
          onClick={() => imageInputRef.current?.click()}
        >
          <div className="plant-drop-icon">🖼️</div>
          <div className="plant-drop-title">Reference Image Upload karein</div>
          <div className="plant-drop-subtitle">Image drag &amp; drop karein ya clipboard se paste karein (Ctrl + V)</div>
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImageImport(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Reference Image Preview Box */}
      {refImage && (
        <div className="sp-img-preview-card">
          <div className="sp-img-preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b style={{ fontSize: '14px', color: '#1e293b' }}>Reference Document Preview</b>
              <span style={{ fontSize: '12px', color: 'var(--sp-muted)' }}>
                Inspect document while updating sauda entries
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="sp-btn sp-btn-sm" onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}>
                ＋ Zoom In
              </button>
              <button className="sp-btn sp-btn-sm" onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}>
                － Zoom Out
              </button>
              <button className="sp-btn sp-btn-sm sp-btn-primary pri" onClick={handleOpenAdd}>
                ＋ Add Entry
              </button>
              <button className="sp-btn sp-btn-sm danger-outline" onClick={() => setRefImage(null)}>
                ✖ Close
              </button>
            </div>
          </div>
          <div className="sp-img-preview-body">
            <img
              src={refImage}
              alt="Reference document"
              style={{
                width: `${imageZoom * 100}%`,
                maxWidth: 'none',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="sp-table-card">
        {/* Single Row Action Toolbar */}
        <div className="sp-toolbar-card">
          <div className="sp-toolbar-title">
            <span>Sauda Table</span>
            <span className="sp-badge">{filteredData.length} records</span>
          </div>

          <input
            type="text"
            className="sp-input"
            style={{ width: '230px' }}
            placeholder="Search Party, Material, Group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="sp-select"
            style={{ maxWidth: '180px' }}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {groupList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="sp-select"
            style={{ maxWidth: '200px' }}
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
          >
            <option value="">All Parties</option>
            {partyList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            className="sp-btn sp-btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedGroup('');
              setSelectedParty('');
            }}
          >
            Reset
          </button>

          <div style={{ flex: 1 }} />

          <button className="sp-btn sp-btn-sm danger-outline" onClick={handleClearAll}>
            🗑 Clear All
          </button>
        </div>

        {/* Grouped Table */}
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr>
                <th className="sp-th-left" style={{ width: '100px' }}>Date</th>
                <th className="sp-th-left" style={{ minWidth: '160px' }}>Material</th>
                <th className="sp-th-left sp-sticky-party-th" style={{ minWidth: '220px' }}>
                  Party Name
                </th>
                <th style={{ minWidth: '100px' }}>Sauda Qty</th>
                <th style={{ minWidth: '100px' }}>Basic Rate</th>
                <th style={{ minWidth: '110px' }}>Prv. Pending</th>
                <th style={{ minWidth: '110px' }}>Qty Dispatch (B)</th>
                <th style={{ minWidth: '110px' }}>Qty Dispatch (W)</th>
                <th style={{ minWidth: '120px' }}>Balance Pending</th>
                <th className="sp-th-left" style={{ minWidth: '160px' }}>Remark</th>
                <th className="sp-th-center" style={{ width: '130px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: 'var(--sp-muted)' }}>
                    No sauda records found.
                  </td>
                </tr>
              ) : (
                distinctGroups.map((grpName, gIdx) => {
                  const groupRows = filteredData.filter((r) => r.grp === grpName);
                  const grpColor =
                    GROUP_COLORS[grpName.toLowerCase()] ||
                    PALETTE[gIdx % PALETTE.length];

                  const gTotals = {
                    sauda: groupRows.reduce((s, r) => s + (+r.sauda || 0), 0),
                    prv: groupRows.reduce((s, r) => s + (+r.prv || 0), 0),
                    db: groupRows.reduce((s, r) => s + (+r.db || 0), 0),
                    dw: groupRows.reduce((s, r) => s + (+r.dw || 0), 0),
                    bal: groupRows.reduce((s, r) => s + bal(r), 0)
                  };

                  return (
                    <React.Fragment key={grpName}>
                      {/* Group Header Banner */}
                      <tr className="sp-group-header-row">
                        <td colSpan="11" style={{ backgroundColor: grpColor }}>
                          {grpName}
                        </td>
                      </tr>

                      {/* Group Rows */}
                      {groupRows.map((row) => {
                        const bVal = bal(row);
                        return (
                          <tr key={row.id}>
                            <td className="sp-td-left">{fd(row.date)}</td>
                            <td className="sp-td-left">{row.mat}</td>
                            <td className="sp-td-left sp-sticky-party-td">
                              <b>{row.party}</b>
                            </td>
                            <td>
                              <b>{f3(row.sauda)}</b>
                            </td>
                            <td>
                              <b>{row.rate ? (+row.rate).toLocaleString('en-IN') : '-'}</b>
                            </td>
                            <td>{f3(row.prv)}</td>
                            <td>{f3(row.db)}</td>
                            <td>{f3(row.dw)}</td>
                            <td className={`sp-balance-val ${bVal <= 0 ? 'ok' : ''}`}>
                              {f3(bVal)}
                            </td>
                            <td className="sp-td-left">
                              <input
                                type="text"
                                className="sp-inline-rem"
                                value={row.rem || ''}
                                placeholder="Write remark..."
                                onChange={(e) => handleInlineRemarkChange(row.id, e.target.value)}
                              />
                            </td>
                            <td className="sp-td-center">
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  className="sp-btn sp-btn-sm"
                                  style={{ color: 'var(--sp-blue)', borderColor: '#bfdbfe', background: '#eff6ff' }}
                                  onClick={() => handleOpenEdit(row)}
                                  title="Update Entry"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="sp-btn sp-btn-sm danger-outline"
                                  onClick={() => handleDeleteRow(row.id, row.party, row.mat)}
                                  title="Delete Entry"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Group Subtotal Row */}
                      <tr className="sp-group-subtotal">
                        <td colSpan="2" style={{ textAlign: 'center', fontWeight: 800 }}>
                          TOTAL — {grpName}
                        </td>
                        <td className="sp-sticky-party-td sp-td-left" style={{ fontWeight: 800 }}>
                          {groupRows.length} Orders
                        </td>
                        <td>{f3(gTotals.sauda)}</td>
                        <td></td>
                        <td>{f3(gTotals.prv)}</td>
                        <td>{f3(gTotals.db)}</td>
                        <td>{f3(gTotals.dw)}</td>
                        <td className="sp-balance-val">{f3(gTotals.bal)}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}

              {/* Grand Total Row */}
              {filteredData.length > 0 && (
                <tr style={{ background: '#e2e8f0', fontWeight: 900, borderTop: '3px solid #94a3b8' }}>
                  <td colSpan="2" style={{ textAlign: 'center', fontSize: '13px' }}>
                    GRAND TOTAL
                  </td>
                  <td className="sp-sticky-party-td sp-td-left" style={{ fontWeight: 900, background: '#e2e8f0' }}>
                    {filteredData.length} Deals
                  </td>
                  <td style={{ fontSize: '13px' }}>{f3(overallKPI.sauda)}</td>
                  <td></td>
                  <td style={{ fontSize: '13px' }}>{f3(overallKPI.prv)}</td>
                  <td style={{ fontSize: '13px' }}>{f3(filteredData.reduce((s, r) => s + (+r.db || 0), 0))}</td>
                  <td style={{ fontSize: '13px' }}>{f3(filteredData.reduce((s, r) => s + (+r.dw || 0), 0))}</td>
                  <td className="sp-balance-val" style={{ fontSize: '14px' }}>
                    {f3(overallKPI.balance)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="sp-modal-mask">
          <div className="sp-modal">
            <div className="sp-modal-header">
              <h3>{editItem ? '✏️ Update Sauda Entry' : '＋ New Sauda Entry'}</h3>
              <button className="sp-btn sp-btn-sm" onClick={() => setModalOpen(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleSaveForm}>
              <div className="sp-modal-body">
                <div className="sp-form-grid">
                  <div className="sp-form-group">
                    <label>Group (Mill Scale / Ms. Billets) *</label>
                    <input
                      type="text"
                      list="sp_grp_list"
                      required
                      placeholder="e.g. Mill Scale, Ms. Billets"
                      value={formData.grp}
                      onChange={(e) => setFormData({ ...formData, grp: e.target.value })}
                    />
                    <datalist id="sp_grp_list">
                      {groupList.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sp-form-group">
                    <label>Sauda Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Party Name *</label>
                    <input
                      type="text"
                      list="sp_party_list"
                      required
                      placeholder="e.g. AD Minerals"
                      value={formData.party}
                      onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                    />
                    <datalist id="sp_party_list">
                      {partyList.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sp-form-group">
                    <label>Material</label>
                    <input
                      type="text"
                      list="sp_mat_list"
                      placeholder="e.g. Mill Scale, Ms Billet"
                      value={formData.mat}
                      onChange={(e) => setFormData({ ...formData, mat: e.target.value })}
                    />
                    <datalist id="sp_mat_list">
                      {materialList.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sp-form-group">
                    <label>Sauda Qty (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 200.000"
                      value={formData.sauda}
                      onChange={(e) => setFormData({ ...formData, sauda: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Basic Rate (₹)</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 7500"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Prv. Pending (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 20.900"
                      value={formData.prv}
                      onChange={(e) => setFormData({ ...formData, prv: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Qty Dispatch (B) (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Billed dispatch"
                      value={formData.db}
                      onChange={(e) => setFormData({ ...formData, db: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Qty Dispatch (W) (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Weight dispatch"
                      value={formData.dw}
                      onChange={(e) => setFormData({ ...formData, dw: e.target.value })}
                    />
                  </div>

                  <div className="sp-form-group">
                    <label>Remark</label>
                    <input
                      type="text"
                      placeholder="Optional notes"
                      value={formData.rem}
                      onChange={(e) => setFormData({ ...formData, rem: e.target.value })}
                    />
                  </div>
                </div>

                {/* Balance Pending Live Preview */}
                <div className="sp-balance-preview">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#9a3412' }}>
                    Calculated Balance Pending (Prv − Dispatch B − W):
                  </span>
                  <b style={{ color: 'var(--sp-primary)', fontSize: '18px' }}>
                    {f3(formBalance)} MT
                  </b>
                </div>
              </div>

              <div className="sp-modal-footer">
                <button type="button" className="sp-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sp-btn sp-btn-primary pri">
                  💾 Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmModal.open && (
        <div className="sp-modal-mask">
          <div className="sp-modal sp-modal-sm">
            <div className="sp-modal-body">
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{confirmModal.title}</h3>
              <p style={{ margin: 0, color: 'var(--sp-muted)', fontSize: '13px' }}>
                {confirmModal.message}
              </p>
            </div>
            <div className="sp-modal-footer">
              <button
                className="sp-btn"
                onClick={() => setConfirmModal({ open: false, title: '', message: '', confirmText: 'Confirm', onConfirm: null })}
              >
                Cancel
              </button>
              <button className="sp-btn danger-outline" onClick={confirmModal.onConfirm}>
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="sp-toast-container">
          <div className="sp-toast">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
