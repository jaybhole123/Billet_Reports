import React, { useState, useMemo, useRef, useEffect } from 'react';
import DateNavigator from '../components/DateNavigator';
import './YesterdayOutgoing.css';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fd = (d) => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, x] = parts;
  return `${x}-${MON[parseInt(m, 10) - 1] || m}-${y.slice(2)}`;
};

const f3 = (n) => (+n || 0).toFixed(3);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const extractBundles = (desc) => {
  const match = String(desc || '').match(/(\d+)\s*BUNDLES/i);
  return match ? parseInt(match[1], 10) : 0;
};

const getInitialSampleData = () => [];

export default function YesterdayOutgoing() {
  const [data, setData] = useState(() => {
    try {
      const isCleared = localStorage.getItem('wire_cleared_v2');
      if (!isCleared) {
        localStorage.removeItem('wire_reg');
        localStorage.setItem('wire_cleared_v2', 'true');
        return [];
      }
      const saved = localStorage.getItem('wire_reg');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    sn: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    cons: '',
    item: 'WIRE ROD (FG)',
    spec: '5.5 MM',
    desc: '',
    len: '.',
    pack: 'BUNDAL',
    inv: '',
    veh: '',
    qty: '',
    rem: ''
  });

  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [toastMessage, setToastMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Reference Image
  const [refImage, setRefImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wire_reg', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Helper date parsing for imports
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

  // Import Excel File
  const handleExcelImport = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded. Please check internet connection.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
        let count = 0;
        let maxSn = Math.max(0, ...data.map((d) => +d.sn || 0));

        const importedRows = [];
        let curId = Date.now();

        rows.forEach((x) => {
          const g = {};
          Object.keys(x).forEach((k) => {
            g[norm(k)] = x[k];
          });
          const v = g.vendorname || g.vendor;
          if (!v) return;

          importedRows.push({
            id: ++curId,
            sn: +g.sn || ++maxSn,
            date: parseImportDate(g.date) || new Date().toISOString().slice(0, 10),
            vendor: String(v),
            cons: String(g.consignee || ''),
            item: String(g.itemname || g.item || 'WIRE ROD (FG)'),
            spec: String(g.specification || g.spec || ''),
            desc: String(g.materialdescription || g.desc || ''),
            len: String(g.itemlength || g.len || '.'),
            pack: String(g.packingtype || g.pack || 'BUNDAL'),
            inv: String(g.invoiceno || g.inv || ''),
            veh: String(g.vehicleno || g.veh || ''),
            qty: parseFloat(String(g.pquantity || g.qty || 0).replace(/,/g, '')) || 0,
            rem: String(g.remark || g.rem || '')
          });
          count++;
        });

        if (importedRows.length > 0) {
          setData((prev) => [...prev, ...importedRows]);
          showToast(`Successfully imported ${count} entries from Excel!`);
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

  // Image Import
  const handleImageImport = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRefImage(url);
    setImageZoom(1);
    showToast('Reference image uploaded! Scroll down to inspect.');
  };

  // Export Excel
  const handleExport = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }
    const sorted = [...data].sort((a, b) => (a.sn || 0) - (b.sn || 0));
    const exportRows = sorted.map((r) => ({
      'S.N.': r.sn,
      Date: fd(r.date),
      'Vendor Name': r.vendor,
      Consignee: r.cons,
      'Item Name': r.item,
      Specification: r.spec,
      'Material Description': r.desc,
      'Item Length': r.len,
      'Packing Type': r.pack,
      'Invoice No': r.inv,
      'Vehicle No': r.veh,
      'P Quantity (MT)': r.qty,
      Remark: r.rem
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Wire Rod Dispatch');
    XLSX.writeFile(wb, `Wire_Rod_Dispatch_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Exported dispatch register to Excel!');
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }
    const headers = [
      'S.N.',
      'Date',
      'Vendor Name',
      'Consignee',
      'Item Name',
      'Specification',
      'Material Description',
      'Item Length',
      'Packing Type',
      'Invoice No',
      'Vehicle No',
      'P Quantity',
      'Remark'
    ];
    const sample = [
      2170,
      '26-10-2026',
      'KRISH ASSOCIATES-RAIPUR',
      'PRABHURAM STEEL PRIVATE LIMITED',
      'WIRE ROD (FG)',
      '5.5 MM',
      'COMMERCIAL 12 BUNDLES',
      '.',
      'BUNDAL',
      'WRM/26-27/004194',
      'CG04PM7926',
      22.1,
      ''
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Wire_Rod_Dispatch_Template.xlsx');
    showToast('Template downloaded!');
  };

  // Global Drag & Drop and Clipboard Paste Listeners
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
  }, [data]);

  // Vendor & Spec Options for filter and autocomplete
  const vendorList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.vendor).filter(Boolean))).sort();
  }, [data]);

  const consigneeList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.cons).filter(Boolean))).sort();
  }, [data]);

  const specList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.spec).filter(Boolean))).sort();
  }, [data]);

  const packList = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.pack).filter(Boolean))).sort();
  }, [data]);

  // Filtered Rows
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((r) => {
        if (selectedDate && r.date && r.date !== selectedDate) return false;
        if (selectedVendor && r.vendor !== selectedVendor) return false;
        if (selectedSpec && r.spec !== selectedSpec) return false;
        if (q) {
          const combined = `${r.sn} ${r.vendor} ${r.cons} ${r.item} ${r.spec} ${r.desc} ${r.inv} ${r.veh} ${r.rem}`.toLowerCase();
          if (!combined.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.sn || 0) - (b.sn || 0));
  }, [data, search, selectedVendor, selectedSpec, selectedDate]);

  // KPI calculations
  const totalQty = useMemo(() => {
    return filteredData.reduce((acc, r) => acc + (+r.qty || 0), 0);
  }, [filteredData]);

  const totalBundles = useMemo(() => {
    return filteredData.reduce((acc, r) => acc + extractBundles(r.desc), 0);
  }, [filteredData]);

  const uniqueVehicles = useMemo(() => {
    return new Set(filteredData.map((r) => r.veh).filter(Boolean)).size;
  }, [filteredData]);

  const uniqueInvoices = useMemo(() => {
    return new Set(filteredData.map((r) => r.inv).filter(Boolean)).size;
  }, [filteredData]);

  // Specification-wise summary
  const specSummary = useMemo(() => {
    const map = {};
    filteredData.forEach((r) => {
      const s = r.spec || 'Unspecified';
      map[s] = (map[s] || 0) + (+r.qty || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredData]);

  // Handle Open Modal
  const handleOpenAdd = () => {
    setEditItem(null);
    const maxSn = Math.max(0, ...data.map((d) => +d.sn || 0));
    setFormData({
      sn: maxSn + 1,
      date: new Date().toISOString().slice(0, 10),
      vendor: '',
      cons: '',
      item: 'WIRE ROD (FG)',
      spec: '5.5 MM',
      desc: '',
      len: '.',
      pack: 'BUNDAL',
      inv: '',
      veh: '',
      qty: '',
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
    if (!formData.vendor.trim()) {
      showToast('Please enter Vendor Name');
      return;
    }

    if (editItem) {
      setData((prev) =>
        prev.map((r) =>
          r.id === editItem.id
            ? {
                ...formData,
                qty: +formData.qty || 0
              }
            : r
        )
      );
      showToast('Entry updated successfully!');
    } else {
      const newEntry = {
        ...formData,
        id: Date.now(),
        qty: +formData.qty || 0
      };
      setData((prev) => [...prev, newEntry]);
      showToast('New entry created!');
    }
    setModalOpen(false);
  };

  const handleDeleteRow = (id, sn, vendor) => {
    setConfirmModal({
      open: true,
      title: 'Delete Dispatch Entry?',
      message: `Are you sure you want to delete S.N. ${sn} (${vendor})? This action cannot be undone.`,
      onConfirm: () => {
        setData((prev) => prev.filter((r) => r.id !== id));
        showToast('Entry deleted!');
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      open: true,
      title: 'Clear All Register Entries?',
      message: 'This will permanently remove all entries from the Yesterday Outgoing.',
      onConfirm: () => {
        setData([]);
        showToast('All data has been cleared.');
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleInlineRemarkChange = (id, val) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, rem: val } : r)));
  };

  return (
    <div className="yo-page-container">
      {/* Drag & drop global overlay */}
      {isDragOver && (
        <div className="yo-drag-overlay">
          <div className="yo-drag-card">
            <span style={{ fontSize: '48px' }}>📦</span>
            <h2>Drop Excel or Image File Here</h2>
            <p>Upload .xlsx/.xls/.csv data or reference image for manual entry</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="yo-header">
        <div className="yo-header-left">
          <div className="yo-logo-badge">📦</div>
          <div className="yo-title-group">
            <h1>Yesterday Outgoing</h1>
            <p>Vendor · Consignee · Invoice · Vehicle · Quantity (MT)</p>
          </div>
        </div>
        <div className="yo-header-actions">
          <button className="yo-btn yo-btn-primary pri" onClick={handleOpenAdd}>
            ＋ New Entry
          </button>
          <button className="yo-btn" onClick={handleDownloadTemplate} title="Download Excel format template">
            ⬇ Template
          </button>
        </div>
      </div>

      {/* Single Row KPI Summary Cards */}
      <div className="yo-kpi-grid">
        <div className="yo-kpi-card">
          <span className="yo-kpi-label">Total Quantity</span>
          <span className="yo-kpi-val" style={{ color: 'var(--yo-primary)' }}>
            {f3(totalQty)} MT
          </span>
          <span className="yo-kpi-sub">Total dispatched weight</span>
        </div>
        <div className="yo-kpi-card green">
          <span className="yo-kpi-label">Total Dispatch</span>
          <span className="yo-kpi-val">{filteredData.length}</span>
          <span className="yo-kpi-sub">Total active records</span>
        </div>
        <div className="yo-kpi-card blue">
          <span className="yo-kpi-label">Total Bundles</span>
          <span className="yo-kpi-val">{totalBundles}</span>
          <span className="yo-kpi-sub">From material descriptions</span>
        </div>
        <div className="yo-kpi-card amber">
          <span className="yo-kpi-label">Vehicles</span>
          <span className="yo-kpi-val">{uniqueVehicles}</span>
          <span className="yo-kpi-sub">Unique trucks dispatched</span>
        </div>
        <div className="yo-kpi-card red">
          <span className="yo-kpi-label">Invoices</span>
          <span className="yo-kpi-val">{uniqueInvoices}</span>
          <span className="yo-kpi-sub">Unique bill invoices</span>
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

      {/* Image Preview Box if reference image loaded */}
      {refImage && (
        <div className="yo-img-preview-card">
          <div className="yo-img-preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b style={{ fontSize: '14px', color: '#1e293b' }}>Reference Image Preview</b>
              <span style={{ fontSize: '12px', color: 'var(--yo-text-muted)' }}>
                Inspect document while keying in manual entries
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="yo-btn yo-btn-sm" onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}>
                ＋ Zoom In
              </button>
              <button className="yo-btn yo-btn-sm" onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}>
                － Zoom Out
              </button>
              <button className="yo-btn yo-btn-sm yo-btn-primary" onClick={handleOpenAdd}>
                ＋ Add Entry
              </button>
              <button className="yo-btn yo-btn-sm yo-btn-danger" onClick={() => setRefImage(null)}>
                ✖ Close
              </button>
            </div>
          </div>
          <div className="yo-img-preview-body">
            <img
              src={refImage}
              alt="Dispatch reference register"
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
      <div className="yo-table-card">
        {/* Clean Executive Toolbar */}
        <div className="yo-toolbar-card">
          <div className="yo-toolbar-left">
            <span className="yo-toolbar-title-text">Dispatch Table</span>
            <span className="yo-badge">{filteredData.length} records</span>
            <button
              type="button"
              className="yo-btn yo-btn-danger yo-btn-clear"
              onClick={handleClearAll}
              title="Clear all records"
            >
              🗑 Clear All
            </button>
          </div>

          <div className="yo-toolbar-right">
            <input
              type="text"
              className="yo-input"
              style={{ width: '190px' }}
              placeholder="Search vendor, veh, inv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="yo-select"
              style={{ maxWidth: '140px' }}
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendorList.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              className="yo-select"
              style={{ maxWidth: '130px' }}
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
            >
              <option value="">All Specs</option>
              {specList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <DateNavigator value={selectedDate} onChange={setSelectedDate} />
          </div>
        </div>

        {/* Specification Breakdown Chips Bar */}
        <div className="yo-chips-bar">
          <span className="yo-chips-title">Specification-wise:</span>
          {specSummary.map(([spec, qty]) => (
            <span key={spec} className="yo-chip">
              {spec} · <b>{f3(qty)} MT</b>
            </span>
          ))}
        </div>

        {/* Dispatch Register Table */}
        <div className="yo-table-wrap">
          <table className="yo-table">
            <thead>
              <tr>
                <th style={{ width: '55px' }}>S.N.</th>
                <th className="yo-th-left" style={{ width: '90px' }}>Date</th>
                <th className="yo-th-left yo-sticky-vendor-th" style={{ minWidth: '220px' }}>
                  Vendor Name
                </th>
                <th className="yo-th-left" style={{ minWidth: '200px' }}>Consignee</th>
                <th className="yo-th-left" style={{ minWidth: '120px' }}>Item Name</th>
                <th className="yo-th-left" style={{ minWidth: '110px' }}>Specification</th>
                <th className="yo-th-left" style={{ minWidth: '180px' }}>Material Description</th>
                <th className="yo-th-left" style={{ width: '80px' }}>Length</th>
                <th className="yo-th-left" style={{ width: '90px' }}>Packing</th>
                <th className="yo-th-left" style={{ minWidth: '140px' }}>Invoice No</th>
                <th className="yo-th-left" style={{ minWidth: '110px' }}>Vehicle No</th>
                <th style={{ minWidth: '110px' }}>P Quantity</th>
                <th className="yo-th-left" style={{ minWidth: '160px' }}>Remark</th>
                <th className="yo-th-center" style={{ width: '130px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '36px', color: 'var(--yo-text-muted)' }}>
                    No dispatch records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id}>
                    <td>{row.sn || idx + 1}</td>
                    <td className="yo-td-left">{fd(row.date)}</td>
                    <td className="yo-td-left yo-sticky-vendor-td">
                      <b>{row.vendor}</b>
                    </td>
                    <td className="yo-td-left">{row.cons}</td>
                    <td className="yo-td-left">{row.item}</td>
                    <td className="yo-td-left">{row.spec}</td>
                    <td className="yo-td-left">{row.desc}</td>
                    <td className="yo-td-left">{row.len}</td>
                    <td className="yo-td-left">{row.pack}</td>
                    <td className="yo-td-left">{row.inv}</td>
                    <td className="yo-td-left">{row.veh}</td>
                    <td className="yo-td-qty">{f3(row.qty)} MT</td>
                    <td className="yo-td-left">
                      <input
                        type="text"
                        className="yo-inline-rem"
                        value={row.rem || ''}
                        placeholder="Write remark..."
                        onChange={(e) => handleInlineRemarkChange(row.id, e.target.value)}
                      />
                    </td>
                    <td className="yo-td-center">
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="yo-btn yo-btn-sm"
                          style={{ color: 'var(--yo-accent)', borderColor: '#bfdbfe', background: '#eff6ff' }}
                          onClick={() => handleOpenEdit(row)}
                          title="Update Entry"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="yo-btn yo-btn-sm yo-btn-danger"
                          onClick={() => handleDeleteRow(row.id, row.sn, row.vendor)}
                          title="Delete Entry"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* Grand Total Row */}
              {filteredData.length > 0 && (
                <tr className="yo-total-row">
                  <td colSpan="2" style={{ textAlign: 'center' }}>TOTAL</td>
                  <td className="yo-sticky-vendor-td yo-td-left" style={{ fontWeight: 800 }}>
                    {filteredData.length} Dispatches
                  </td>
                  <td colSpan="8" style={{ textAlign: 'right', paddingRight: '14px' }}>
                    GRAND TOTAL WEIGHT
                  </td>
                  <td className="yo-total-val">{f3(totalQty)} MT</td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="yo-modal-mask">
          <div className="yo-modal">
            <div className="yo-modal-header">
              <h3>{editItem ? '✏️ Update Dispatch Entry' : '＋ New Dispatch Entry'}</h3>
              <button className="yo-btn yo-btn-sm" onClick={() => setModalOpen(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleSaveForm}>
              <div className="yo-modal-body">
                <div className="yo-form-grid">
                  <div className="yo-form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>Vendor Name *</label>
                    <input
                      type="text"
                      list="yo_vendor_datalist"
                      required
                      placeholder="e.g. KRISH ASSOCIATES-RAIPUR"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    />
                    <datalist id="yo_vendor_datalist">
                      {vendorList.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yo-form-group">
                    <label>Consignee</label>
                    <input
                      type="text"
                      list="yo_cons_datalist"
                      placeholder="e.g. PRABHURAM STEEL"
                      value={formData.cons}
                      onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                    />
                    <datalist id="yo_cons_datalist">
                      {consigneeList.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yo-form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={formData.item}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>Specification</label>
                    <input
                      type="text"
                      list="yo_spec_datalist"
                      placeholder="e.g. 5.5 MM, 8 MM"
                      value={formData.spec}
                      onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    />
                    <datalist id="yo_spec_datalist">
                      {specList.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yo-form-group">
                    <label>Material Description</label>
                    <input
                      type="text"
                      placeholder="e.g. COMMERCIAL 12 BUNDLES"
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>Item Length</label>
                    <input
                      type="text"
                      value={formData.len}
                      onChange={(e) => setFormData({ ...formData, len: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>Packing Type</label>
                    <input
                      type="text"
                      list="yo_pack_datalist"
                      value={formData.pack}
                      onChange={(e) => setFormData({ ...formData, pack: e.target.value })}
                    />
                    <datalist id="yo_pack_datalist">
                      {packList.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div className="yo-form-group">
                    <label>Invoice No</label>
                    <input
                      type="text"
                      placeholder="e.g. WRM/26-27/004194"
                      value={formData.inv}
                      onChange={(e) => setFormData({ ...formData, inv: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>Vehicle No</label>
                    <input
                      type="text"
                      placeholder="e.g. CG04PM7926"
                      value={formData.veh}
                      onChange={(e) => setFormData({ ...formData, veh: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group">
                    <label>P Quantity (MT)</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="e.g. 22.100"
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    />
                  </div>

                  <div className="yo-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Remark</label>
                    <input
                      type="text"
                      placeholder="Optional remarks"
                      value={formData.rem}
                      onChange={(e) => setFormData({ ...formData, rem: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="yo-modal-footer">
                <button type="button" className="yo-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="yo-btn yo-btn-primary">
                  💾 Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmModal.open && (
        <div className="yo-modal-mask">
          <div className="yo-modal yo-modal-sm">
            <div className="yo-modal-body">
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{confirmModal.title}</h3>
              <p style={{ margin: 0, color: 'var(--yo-text-muted)', fontSize: '13px' }}>
                {confirmModal.message}
              </p>
            </div>
            <div className="yo-modal-footer">
              <button
                className="yo-btn"
                onClick={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button className="yo-btn yo-btn-danger" onClick={confirmModal.onConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="yo-toast-container">
          <div className="yo-toast">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
