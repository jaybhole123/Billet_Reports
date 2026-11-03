import React, { useState, useEffect, useMemo } from 'react';
import './MisSheet.css';

const f3 = (n) => (+n || 0).toFixed(3);
const norm = (s) => String(s || '').trim().toUpperCase();

export default function MisSheet() {
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isEditMode, setIsEditMode] = useState(false);

  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('mis_manual_overrides');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [customDescriptions, setCustomDescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('mis_custom_descriptions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [noteText, setNoteText] = useState(() => {
    try {
      return localStorage.getItem('mis_note_text') || '';
    } catch (e) {
      return '';
    }
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Sync overrides & notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mis_manual_overrides', JSON.stringify(manualOverrides));
      localStorage.setItem('mis_custom_descriptions', JSON.stringify(customDescriptions));
      localStorage.setItem('mis_note_text', noteText);
    } catch (e) {}
  }, [manualOverrides, customDescriptions, noteText]);

  // Real-time localStorage state
  const [rawStore, setRawStore] = useState(() => ({
    billetsStock: localStorage.getItem('billets_stock'),
    nmp: localStorage.getItem('material_purchase'),
    yesterdayIncoming: localStorage.getItem('bill_reg'),
    yesterdayOutgoing: localStorage.getItem('wire_reg'),
    totalOutgoing: localStorage.getItem('sauda_reg'),
    sheetSale: localStorage.getItem('etl_table'),
    lsmFinish: localStorage.getItem('lsm_finish_stock_v2'),
    kamdhenu: localStorage.getItem('hmstock2'),
    jindal: localStorage.getItem('hmstock_jindal'),
    hsmRep: localStorage.getItem('hsm_rep'),
    lsmRep: localStorage.getItem('lsm_rep'),
  }));

  // Re-read storage on event
  useEffect(() => {
    const handleStorageChange = () => {
      setRawStore({
        billetsStock: localStorage.getItem('billets_stock'),
        nmp: localStorage.getItem('material_purchase'),
        yesterdayIncoming: localStorage.getItem('bill_reg'),
        yesterdayOutgoing: localStorage.getItem('wire_reg'),
        totalOutgoing: localStorage.getItem('sauda_reg'),
        sheetSale: localStorage.getItem('etl_table'),
        lsmFinish: localStorage.getItem('lsm_finish_stock_v2'),
        kamdhenu: localStorage.getItem('hmstock2'),
        jindal: localStorage.getItem('hmstock_jindal'),
        hsmRep: localStorage.getItem('hsm_rep'),
        lsmRep: localStorage.getItem('lsm_rep'),
      });
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Parse source objects from system pages
  const sources = useMemo(() => {
    let billetsStock = { blocks: [] };
    let nmp = { blocks: [] };
    let yesterdayIncoming = [];
    let yesterdayOutgoing = [];
    let totalOutgoing = { rows: [] };
    let sheetSale = { rows: [], cols: [] };
    let lsmFinish = { blocks: [] };
    let kamdhenu = [];
    let jindal = [];
    let hsmRep = { reps: [] };
    let lsmRep = { reps: [] };

    try { if (rawStore.billetsStock) billetsStock = JSON.parse(rawStore.billetsStock); } catch (e) {}
    try { if (rawStore.nmp) nmp = JSON.parse(rawStore.nmp); } catch (e) {}
    try { if (rawStore.yesterdayIncoming) yesterdayIncoming = JSON.parse(rawStore.yesterdayIncoming); } catch (e) {}
    try { if (rawStore.yesterdayOutgoing) yesterdayOutgoing = JSON.parse(rawStore.yesterdayOutgoing); } catch (e) {}
    try { if (rawStore.totalOutgoing) totalOutgoing = JSON.parse(rawStore.totalOutgoing); } catch (e) {}
    try { if (rawStore.sheetSale) sheetSale = JSON.parse(rawStore.sheetSale); } catch (e) {}
    try { if (rawStore.lsmFinish) lsmFinish = JSON.parse(rawStore.lsmFinish); } catch (e) {}
    try { if (rawStore.kamdhenu) kamdhenu = JSON.parse(rawStore.kamdhenu); } catch (e) {}
    try { if (rawStore.jindal) jindal = JSON.parse(rawStore.jindal); } catch (e) {}
    try { if (rawStore.hsmRep) hsmRep = JSON.parse(rawStore.hsmRep); } catch (e) {}
    try { if (rawStore.lsmRep) lsmRep = JSON.parse(rawStore.lsmRep); } catch (e) {}

    return {
      billetsStock,
      nmp,
      yesterdayIncoming,
      yesterdayOutgoing,
      totalOutgoing,
      sheetSale,
      lsmFinish,
      kamdhenu,
      jindal,
      hsmRep,
      lsmRep,
    };
  }, [rawStore]);

  // Helpers for manual value & description override
  const getVal = (key, autoVal) => {
    if (manualOverrides && manualOverrides[key] !== undefined && manualOverrides[key] !== '') {
      return parseFloat(manualOverrides[key]) || 0;
    }
    return (+autoVal || 0);
  };

  const handleOverrideChange = (key, val) => {
    setManualOverrides((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const getDesc = (key, defDesc) => {
    if (customDescriptions && customDescriptions[key] !== undefined) {
      return customDescriptions[key];
    }
    return defDesc || '';
  };

  const handleDescChange = (key, desc) => {
    setCustomDescriptions((prev) => ({
      ...prev,
      [key]: desc,
    }));
  };

  // Date matcher
  const isDateMatch = (rowDateStr, targetYmd) => {
    if (!rowDateStr || !targetYmd) return true;
    const clean = String(rowDateStr).trim();
    if (clean === targetYmd) return true;

    const [tY, tM, tD] = targetYmd.split('-');
    const tD_int = parseInt(tD, 10);
    const tM_int = parseInt(tM, 10);

    const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1], 10);
      const m = parseInt(dmyMatch[2], 10);
      let y = parseInt(dmyMatch[3], 10);
      if (y < 100) y += 2000;
      if (d === tD_int && m === tM_int && y === parseInt(tY, 10)) return true;
    }
    return false;
  };

  // =========================================================================
  // 1. PURE DYNAMIC BILLETS STOCK (Only sizes in BilletsStock page)
  // =========================================================================
  const billetStockRows = useMemo(() => {
    const map = {};
    if (sources.billetsStock?.blocks) {
      sources.billetsStock.blocks.forEach((blk) => {
        (blk.rows || []).forEach((r) => {
          let sz = String(r.size || '').trim().toUpperCase();
          if (!sz) return;
          const clQ = parseFloat(r.clQ) || parseFloat(r.tot) || 0;
          map[sz] = (map[sz] || 0) + clQ;
        });
      });
    }

    return Object.entries(map).map(([size, autoVal]) => ({
      key: `dyn_bs_${norm(size)}`,
      defaultDesc: size,
      auto: autoVal,
    }));
  }, [sources.billetsStock]);

  const totalBilletStock = useMemo(() => {
    return billetStockRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [billetStockRows, manualOverrides]);

  // =========================================================================
  // 2. PURE DYNAMIC BILLETS INCOMING (Only sizes in Material Purchase page)
  // =========================================================================
  const billetIncomingRows = useMemo(() => {
    const map = {};
    if (sources.nmp?.blocks) {
      sources.nmp.blocks.forEach((blk) => {
        (blk.rows || []).forEach((r) => {
          let mat = String(r.mat || blk.label || '').trim().toUpperCase();
          mat = mat.replace(/^MS\.\s*BILLET\s*/i, '').replace(/^BILLET\s*/i, '').replace(/[()]/g, '').trim();
          if (!mat) return;
          const bal = parseFloat(r.bal) || 0;
          map[mat] = (map[mat] || 0) + bal;
        });
      });
    }

    return Object.entries(map).map(([size, autoVal]) => ({
      key: `dyn_bi_${norm(size)}`,
      defaultDesc: size,
      auto: autoVal,
    }));
  }, [sources.nmp]);

  const totalBilletIncoming = useMemo(() => {
    return billetIncomingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [billetIncomingRows, manualOverrides]);

  // =========================================================================
  // 3. LIVE SUMMARY & TOTAL METAL CALCULATIONS
  // =========================================================================
  const totalBilletsStockAndIncoming = totalBilletStock + totalBilletIncoming;
  const burningEndCutting = totalBilletsStockAndIncoming * 0.06;
  const lessAfterBurningLoss = totalBilletsStockAndIncoming - burningEndCutting;

  // Structure Stock Light: LSM Finish Stock
  const computedStructureStockLight = useMemo(() => {
    let tot = 0;
    if (sources.lsmFinish?.blocks) {
      sources.lsmFinish.blocks.forEach((b) => {
        (b.rows || []).forEach((r) => {
          tot += Object.values(r.v || {}).reduce((a, b) => a + (+b || 0), 0);
        });
      });
    }
    return tot;
  }, [sources.lsmFinish]);

  // Structure Stock Heavy: KamDhenu + Jindal Stock
  const computedStructureStockHeavy = useMemo(() => {
    let tot = 0;
    (sources.kamdhenu || []).forEach((r) => {
      tot += Object.values(r.v || {}).reduce((a, b) => a + (+b || 0), 0);
    });
    (sources.jindal || []).forEach((r) => {
      tot += Object.values(r.v || {}).reduce((a, b) => a + (+b || 0), 0);
    });
    return tot;
  }, [sources.kamdhenu, sources.jindal]);

  // Sales Order Light: from Sheet Structure Sale Outgoing page
  const computedSalesOrderLight = useMemo(() => {
    if (!sources.sheetSale?.rows || !sources.sheetSale.rows.length) return 0;
    const cols = sources.sheetSale.cols || [];
    const balIdx = cols.findIndex((c) => /balance\s*qty/i.test(c));
    const idx = balIdx >= 0 ? balIdx : 10;
    return sources.sheetSale.rows.reduce((acc, r) => {
      const v = parseFloat(r[idx]) || 0;
      return acc + (v > 0 ? v : 0);
    }, 0);
  }, [sources.sheetSale]);

  // Sales Order Heavy: from TotalOutgoing (Sauda Reg) page
  const computedSalesOrderHeavy = useMemo(() => {
    const rows = sources.totalOutgoing?.rows || [];
    return rows.reduce((acc, r) => {
      const bal = (+r.prv || 0) - (+r.db || 0) - (+r.dw || 0);
      return acc + (bal > 0 ? bal : 0);
    }, 0);
  }, [sources.totalOutgoing]);

  const structStockLight = getVal('struct_stock_light', computedStructureStockLight);
  const structStockHeavy = getVal('struct_stock_heavy', computedStructureStockHeavy);
  const totalStructureStock = structStockLight + structStockHeavy;

  const orderOutLightSale = getVal('order_out_light_sale', computedSalesOrderLight);
  const orderOutHeavySale = getVal('order_out_heavy_sale', computedSalesOrderHeavy);
  const totalSales = orderOutLightSale + orderOutHeavySale;

  const totalMetal = lessAfterBurningLoss + totalStructureStock - totalSales;

  // =========================================================================
  // 4. PURE DYNAMIC YESTERDAY INCOMING (Only records matching reportDate)
  // =========================================================================
  const yestIncomingRows = useMemo(() => {
    const map = {};
    (sources.yesterdayIncoming || []).forEach((r) => {
      if (r.date && !isDateMatch(r.date, reportDate)) return;
      const itm = String(r.item || '').trim().toUpperCase();
      if (!itm) return;
      map[itm] = (map[itm] || 0) + (parseFloat(r.rec) || 0);
    });

    return Object.entries(map).map(([size, autoVal]) => ({
      key: `dyn_yi_${norm(size)}`,
      defaultDesc: size,
      auto: autoVal,
    }));
  }, [sources.yesterdayIncoming, reportDate]);

  const totalYestIncoming = useMemo(() => {
    return yestIncomingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [yestIncomingRows, manualOverrides]);

  // =========================================================================
  // 5. PURE DYNAMIC OUTGOING MATERIALS (Only records matching reportDate)
  // =========================================================================
  const outgoingRows = useMemo(() => {
    const map = {};
    (sources.yesterdayOutgoing || []).forEach((r) => {
      if (r.date && !isDateMatch(r.date, reportDate)) return;
      let label = String(r.item || r.spec || 'OUTGOING MATERIAL').trim().toUpperCase();
      map[label] = (map[label] || 0) + (parseFloat(r.qty) || 0);
    });

    return Object.entries(map).map(([label, autoVal]) => ({
      key: `dyn_out_${norm(label)}`,
      defaultDesc: label,
      auto: autoVal,
    }));
  }, [sources.yesterdayOutgoing, reportDate]);

  const totalOutgoingMat = useMemo(() => {
    return outgoingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [outgoingRows, manualOverrides]);

  // =========================================================================
  // 6. PURE DYNAMIC TOTAL STRUCTURE PRODUCTION IN 24HR
  // =========================================================================
  const prodRows = useMemo(() => {
    const map = {};
    const processReps = (reps, defaultPrefix) => {
      (reps || []).forEach((rep) => {
        if (rep.date && !isDateMatch(rep.date, reportDate)) return;
        (rep.fin || []).forEach((f) => {
          const sec = String(f.sec || `${defaultPrefix} PRODUCTION`).trim().toUpperCase();
          const wt = parseFloat(f.wt) || 0;
          const k = `GOOD QUALITY (${sec})`;
          map[k] = (map[k] || 0) + wt;
        });
        (rep.raw || []).forEach((r) => {
          const grp = String(r.grp || '').trim().toUpperCase();
          if (grp && !grp.includes('RAW MATERIAL')) {
            map[grp] = (map[grp] || 0) + (parseFloat(r.wt) || 0);
          }
        });
      });
    };
    processReps(sources.hsmRep?.reps, 'HEAVY');
    processReps(sources.lsmRep?.reps, 'LIGHT');

    return Object.entries(map).map(([label, autoVal]) => ({
      key: `dyn_prod_${norm(label)}`,
      defaultDesc: label,
      auto: autoVal,
    }));
  }, [sources.hsmRep, sources.lsmRep, reportDate]);

  const totalProduction = useMemo(() => {
    return prodRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [prodRows, manualOverrides]);

  // =========================================================================
  // 7. PURE DYNAMIC BALANCE PENDING OUTGOING (Only orders where bal > 0)
  // =========================================================================
  const pendingRows = useMemo(() => {
    const map = {};
    const rows = sources.totalOutgoing?.rows || [];
    rows.forEach((r) => {
      const b = (+r.prv || 0) - (+r.db || 0) - (+r.dw || 0);
      if (b > 0) {
        const desc = String(r.desc || r.sec || r.party || 'PENDING DISPATCH').trim().toUpperCase();
        const lbl = `BALANCE PENDING OUTGOING (${desc})`;
        map[lbl] = (map[lbl] || 0) + b;
      }
    });

    return Object.entries(map).map(([label, autoVal]) => ({
      key: `dyn_pend_${norm(label)}`,
      defaultDesc: label,
      auto: autoVal,
    }));
  }, [sources.totalOutgoing]);

  // Helper to add custom row manually
  const [customUserRows, setCustomUserRows] = useState(() => {
    try {
      const saved = localStorage.getItem('mis_custom_added_rows');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { bs: [], bi: [], yi: [], out: [], prod: [], pend: [] };
  });

  const handleAddRow = (sectionKey) => {
    const newId = `custom_${sectionKey}_${Date.now()}`;
    setCustomUserRows((prev) => {
      const updated = {
        ...prev,
        [sectionKey]: [...(prev[sectionKey] || []), { key: newId, desc: 'NEW ITEM', qty: 0 }],
      };
      localStorage.setItem('mis_custom_added_rows', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveCustomRow = (sectionKey, rowKey) => {
    setCustomUserRows((prev) => {
      const updated = {
        ...prev,
        [sectionKey]: (prev[sectionKey] || []).filter((r) => r.key !== rowKey),
      };
      localStorage.setItem('mis_custom_added_rows', JSON.stringify(updated));
      return updated;
    });
  };

  // Combine dynamic source rows with any user added custom rows
  const allBilletStockRows = useMemo(() => {
    const extra = (customUserRows.bs || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...billetStockRows, ...extra];
  }, [billetStockRows, customUserRows.bs]);

  const allBilletIncomingRows = useMemo(() => {
    const extra = (customUserRows.bi || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...billetIncomingRows, ...extra];
  }, [billetIncomingRows, customUserRows.bi]);

  const allYestIncomingRows = useMemo(() => {
    const extra = (customUserRows.yi || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...yestIncomingRows, ...extra];
  }, [yestIncomingRows, customUserRows.yi]);

  const allOutgoingRows = useMemo(() => {
    const extra = (customUserRows.out || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...outgoingRows, ...extra];
  }, [outgoingRows, customUserRows.out]);

  const allProdRows = useMemo(() => {
    const extra = (customUserRows.prod || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...prodRows, ...extra];
  }, [prodRows, customUserRows.prod]);

  const allPendingRows = useMemo(() => {
    const extra = (customUserRows.pend || []).map((r) => ({
      key: r.key,
      defaultDesc: r.desc,
      auto: r.qty,
      isCustom: true,
    }));
    return [...pendingRows, ...extra];
  }, [pendingRows, customUserRows.pend]);

  // Recalculate totals including custom rows
  const grandTotalBilletStock = useMemo(() => {
    return allBilletStockRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [allBilletStockRows, manualOverrides]);

  const grandTotalBilletIncoming = useMemo(() => {
    return allBilletIncomingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [allBilletIncomingRows, manualOverrides]);

  const grandTotalBilletsStockAndIncoming = grandTotalBilletStock + grandTotalBilletIncoming;
  const grandBurningLoss = grandTotalBilletsStockAndIncoming * 0.06;
  const grandLessAfterBurning = grandTotalBilletsStockAndIncoming - grandBurningLoss;
  const grandTotalMetal = grandLessAfterBurning + totalStructureStock - totalSales;

  const grandTotalYestIncoming = useMemo(() => {
    return allYestIncomingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [allYestIncomingRows, manualOverrides]);

  const grandTotalOutgoingMat = useMemo(() => {
    return allOutgoingRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [allOutgoingRows, manualOverrides]);

  const grandTotalProduction = useMemo(() => {
    return allProdRows.reduce((acc, itm) => acc + getVal(itm.key, itm.auto), 0);
  }, [allProdRows, manualOverrides]);

  // Format date DD-MM-YYYY
  const formatDateDDMMYYYY = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return isoStr;
  };

  // Export Excel
  const handleExportExcel = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showToast('XLSX library not loaded.');
      return;
    }
    const wb = XLSX.utils.book_new();

    const rows = [
      ['HINDUSTAN DHAATU REPORT (BILLET)', '', formatDateDDMMYYYY(reportDate)],
      ['', 'SIZE', 'QTY'],
      ['BILLETS STOCK', '', ''],
      ...allBilletStockRows.map((r) => ['', getDesc(r.key, r.defaultDesc), +f3(getVal(r.key, r.auto))]),
      ['TOTAL', '', +f3(grandTotalBilletStock)],
      ['BILLETS INCOMING', '', ''],
      ...allBilletIncomingRows.map((r) => ['', getDesc(r.key, r.defaultDesc), +f3(getVal(r.key, r.auto))]),
      ['TOTAL', '', +f3(grandTotalBilletIncoming)],
      ['TOTAL BILLETS STOCK AND INCOMING', '', +f3(grandTotalBilletsStockAndIncoming)],
      ['BURNING & END CUTTING (@6%)', '', +f3(grandBurningLoss)],
      ['LESS AFTER BURNING LOSS', '', +f3(grandLessAfterBurning)],
      ['STRUCTURE STOCK (LIGHT)', '', +f3(structStockLight)],
      ['STRUCTURE STOCK (HEAVY)', '', +f3(structStockHeavy)],
      ['TOTAL STRUCTURE STOCK (LIGHT + HEAVY)', '', +f3(totalStructureStock)],
      ['ORDER OUT (LIGHT SALE)', '', +f3(orderOutLightSale)],
      ['ORDER OUT (HEAVY SALE)', '', +f3(orderOutHeavySale)],
      ['TOTAL SALES (LIGHT + HEAVY)', '', +f3(totalSales)],
      ['TOTAL METAL', '', +f3(grandTotalMetal)],
      ['', '', ''],
      ['YESTERDAY INCOMING & OUTGOING MATERIALS', '', ''],
      ['', 'SIZE', 'QTY'],
      ['BILLETS INCOMING', '', ''],
      ...allYestIncomingRows.map((r) => ['', getDesc(r.key, r.defaultDesc), +f3(getVal(r.key, r.auto))]),
      ['TOTAL', '', +f3(grandTotalYestIncoming)],
      ['OUTGOING MATERIALS', '', ''],
      ...allOutgoingRows.map((r) => ['', getDesc(r.key, r.defaultDesc), +f3(getVal(r.key, r.auto))]),
      ['TOTAL', '', +f3(grandTotalOutgoingMat)],
      ['TOTAL STRUCTURE PRODUCTION IN 24HR', '', 'QTY'],
      ...allProdRows.map((r) => ['', getDesc(r.key, r.defaultDesc), +f3(getVal(r.key, r.auto))]),
      ['TOTAL', '', +f3(grandTotalProduction)],
      ['BALANCE PENDING OUTGOING', '', ''],
      ...allPendingRows.map((r) => [getDesc(r.key, r.defaultDesc), '', +f3(getVal(r.key, r.auto))]),
      ['NOTE:-', noteText, ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'MIS Sheet');
    XLSX.writeFile(wb, `MIS_Report_${reportDate}.xlsx`);
    showToast('Exported MIS Sheet to Excel!');
  };

  // Export PDF
  const handleExportPDF = () => {
    const element = document.getElementById('mis-pdf-paper-print');
    if (!element) {
      showToast('PDF element not found.');
      return;
    }

    if (window.html2pdf) {
      showToast('Generating PDF...');
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `Hindustan_Dhaatu_Report_${formatDateDDMMYYYY(reportDate)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      window
        .html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          showToast('PDF Downloaded successfully!');
        })
        .catch((err) => {
          console.error(err);
          // Fallback to native print
          window.print();
        });
    } else {
      // Fallback
      window.print();
    }
  };

  const handleClearAllOverrides = () => {
    if (window.confirm('Reset all manual edits and clear overrides?')) {
      setManualOverrides({});
      setCustomDescriptions({});
      setCustomUserRows({ bs: [], bi: [], yi: [], out: [], prod: [], pend: [] });
      setNoteText('');
      localStorage.removeItem('mis_manual_overrides');
      localStorage.removeItem('mis_custom_descriptions');
      localStorage.removeItem('mis_custom_added_rows');
      localStorage.removeItem('mis_note_text');
      showToast('All rows reset to live plant data.');
    }
  };

  return (
    <div className="mis-page-container">
      {/* Toast Notification */}
      {toastMessage && <div className="mis-toast">{toastMessage}</div>}

      {/* Top Action Toolbar */}
      <div className="mis-top-toolbar">
        <div className="mis-toolbar-left">
          <span className="mis-toolbar-badge">100% DYNAMIC MIS</span>
          <span className="mis-toolbar-title">HINDUSTAN DHAATU REPORT (BILLET)</span>
        </div>
        <div className="mis-toolbar-actions">
          <div className="mis-date-picker-wrap">
            <label>Report Date:</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>

          {/* Toggle Edit Mode Button */}
          <button
            type="button"
            className={`mis-btn ${isEditMode ? 'mis-btn-edit-active' : 'mis-btn-edit-inactive'}`}
            onClick={() => setIsEditMode((prev) => !prev)}
            title="Click to toggle edit options on/off"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>{isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}</span>
          </button>

          {/* Export PDF Button */}
          <button className="mis-btn mis-btn-pdf" onClick={handleExportPDF}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>Download PDF</span>
          </button>

          <button className="mis-btn mis-btn-primary" onClick={handleExportExcel}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Excel</span>
          </button>
          <button className="mis-btn mis-btn-outline" onClick={handleClearAllOverrides}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Exact PDF Layout Container */}
      <div id="mis-pdf-paper-print" className={`mis-pdf-paper ${isEditMode ? 'edit-mode-on' : 'edit-mode-off'}`}>
        <table className="mis-pdf-table">
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '32%' }} />
          </colgroup>
          <tbody>
            {/* ========================================================= */}
            {/* MAIN HEADER (DEEP NAVY) */}
            {/* ========================================================= */}
            <tr className="mis-pdf-header-row">
              <td colSpan={2} className="mis-pdf-title-cell">
                HINDUSTAN DHAATU REPORT (BILLET)
              </td>
              <td className="mis-pdf-date-cell">
                {formatDateDDMMYYYY(reportDate)}
              </td>
            </tr>

            {/* SUBHEADER: SIZE | QTY */}
            <tr className="mis-pdf-subth-row">
              <td className="mis-empty-col"></td>
              <td className="mis-th-center">SIZE</td>
              <td className="mis-th-center">QTY</td>
            </tr>

            {/* ========================================================= */}
            {/* 1. DYNAMIC BILLETS STOCK */}
            {/* ========================================================= */}
            {allBilletStockRows.length > 0 ? (
              <>
                {allBilletStockRows.map((item, idx) => (
                  <tr key={item.key}>
                    {idx === 0 && (
                      <td className="mis-category-merged-cell" rowSpan={allBilletStockRows.length}>
                        BILLETS STOCK
                        {isEditMode && (
                          <button
                            type="button"
                            className="mis-add-row-mini-btn"
                            title="Add row to Billets Stock"
                            onClick={() => handleAddRow('bs')}
                          >
                            + Add
                          </button>
                        )}
                      </td>
                    )}
                    <td className="mis-desc-cell">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditMode ? (
                          <input
                            type="text"
                            className="mis-desc-input"
                            value={getDesc(item.key, item.defaultDesc)}
                            onChange={(e) => handleDescChange(item.key, e.target.value)}
                          />
                        ) : (
                          <span>{getDesc(item.key, item.defaultDesc)}</span>
                        )}
                        {isEditMode && item.isCustom && (
                          <span
                            className="mis-del-row-btn"
                            title="Delete row"
                            onClick={() => handleRemoveCustomRow('bs', item.key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mis-qty-cell">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          className="mis-cell-input"
                          value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                          onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{f3(getVal(item.key, item.auto))}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* TOTAL BILLETS STOCK */}
                <tr className="mis-pdf-subtotal-row">
                  <td colSpan={2} className="mis-total-label-cell">
                    TOTAL
                  </td>
                  <td className="mis-qty-cell mis-bold-qty">
                    {f3(grandTotalBilletStock)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="mis-category-merged-cell">
                  BILLETS STOCK
                  {isEditMode && (
                    <button
                      type="button"
                      className="mis-add-row-mini-btn"
                      onClick={() => handleAddRow('bs')}
                    >
                      + Add
                    </button>
                  )}
                </td>
                <td className="mis-desc-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No stock records in Billets Stock page
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 2. DYNAMIC BILLETS INCOMING */}
            {/* ========================================================= */}
            {allBilletIncomingRows.length > 0 ? (
              <>
                {allBilletIncomingRows.map((item, idx) => (
                  <tr key={item.key}>
                    {idx === 0 && (
                      <td className="mis-category-merged-cell" rowSpan={allBilletIncomingRows.length}>
                        BILLETS INCOMING
                        {isEditMode && (
                          <button
                            type="button"
                            className="mis-add-row-mini-btn"
                            title="Add row to Billets Incoming"
                            onClick={() => handleAddRow('bi')}
                          >
                            + Add
                          </button>
                        )}
                      </td>
                    )}
                    <td className="mis-desc-cell">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditMode ? (
                          <input
                            type="text"
                            className="mis-desc-input"
                            value={getDesc(item.key, item.defaultDesc)}
                            onChange={(e) => handleDescChange(item.key, e.target.value)}
                          />
                        ) : (
                          <span>{getDesc(item.key, item.defaultDesc)}</span>
                        )}
                        {isEditMode && item.isCustom && (
                          <span
                            className="mis-del-row-btn"
                            title="Delete row"
                            onClick={() => handleRemoveCustomRow('bi', item.key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mis-qty-cell">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          className="mis-cell-input"
                          value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                          onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{f3(getVal(item.key, item.auto))}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* TOTAL BILLETS INCOMING */}
                <tr className="mis-pdf-subtotal-row">
                  <td colSpan={2} className="mis-total-label-cell">
                    TOTAL
                  </td>
                  <td className="mis-qty-cell mis-bold-qty">
                    {f3(grandTotalBilletIncoming)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="mis-category-merged-cell">
                  BILLETS INCOMING
                  {isEditMode && (
                    <button
                      type="button"
                      className="mis-add-row-mini-btn"
                      onClick={() => handleAddRow('bi')}
                    >
                      + Add
                    </button>
                  )}
                </td>
                <td className="mis-desc-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No pending incoming balance in Material Purchase page
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 3. SUMMARY METAL BALANCE */}
            {/* ========================================================= */}
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_sum_stock_inc', 'TOTAL BILLETS STOCK AND INCOMING')}
                    onChange={(e) => handleDescChange('lbl_sum_stock_inc', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_sum_stock_inc', 'TOTAL BILLETS STOCK AND INCOMING')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(grandTotalBilletsStockAndIncoming)}</td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_burning_cut', 'BURNING & END CUTTING (@6%)')}
                    onChange={(e) => handleDescChange('lbl_burning_cut', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_burning_cut', 'BURNING & END CUTTING (@6%)')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(grandBurningLoss)}</td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_less_burning', 'LESS AFTER BURNING LOSS')}
                    onChange={(e) => handleDescChange('lbl_less_burning', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_less_burning', 'LESS AFTER BURNING LOSS')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(grandLessAfterBurning)}</td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_struct_light', 'STRUCTURE STOCK (LIGHT)')}
                    onChange={(e) => handleDescChange('lbl_struct_light', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_struct_light', 'STRUCTURE STOCK (LIGHT)')}</span>
                )}
              </td>
              <td className="mis-qty-cell">
                {isEditMode ? (
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    className="mis-cell-input"
                    value={manualOverrides['struct_stock_light'] !== undefined ? manualOverrides['struct_stock_light'] : f3(computedStructureStockLight)}
                    onChange={(e) => handleOverrideChange('struct_stock_light', e.target.value)}
                  />
                ) : (
                  <span>{f3(structStockLight)}</span>
                )}
              </td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_struct_heavy', 'STRUCTURE STOCK (HEAVY)')}
                    onChange={(e) => handleDescChange('lbl_struct_heavy', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_struct_heavy', 'STRUCTURE STOCK (HEAVY)')}</span>
                )}
              </td>
              <td className="mis-qty-cell">
                {isEditMode ? (
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    className="mis-cell-input"
                    value={manualOverrides['struct_stock_heavy'] !== undefined ? manualOverrides['struct_stock_heavy'] : f3(computedStructureStockHeavy)}
                    onChange={(e) => handleOverrideChange('struct_stock_heavy', e.target.value)}
                  />
                ) : (
                  <span>{f3(structStockHeavy)}</span>
                )}
              </td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell mis-bold-label">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input mis-bold-label"
                    value={getDesc('lbl_total_struct', 'TOTAL STRUCTURE STOCK (LIGHT + HEAVY)')}
                    onChange={(e) => handleDescChange('lbl_total_struct', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_total_struct', 'TOTAL STRUCTURE STOCK (LIGHT + HEAVY)')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(totalStructureStock)}</td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_order_light', 'ORDER OUT (LIGHT SALE)')}
                    onChange={(e) => handleDescChange('lbl_order_light', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_order_light', 'ORDER OUT (LIGHT SALE)')}</span>
                )}
              </td>
              <td className="mis-qty-cell">
                {isEditMode ? (
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    className="mis-cell-input"
                    value={manualOverrides['order_out_light_sale'] !== undefined ? manualOverrides['order_out_light_sale'] : f3(orderOutLightSale)}
                    onChange={(e) => handleOverrideChange('order_out_light_sale', e.target.value)}
                  />
                ) : (
                  <span>{f3(orderOutLightSale)}</span>
                )}
              </td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_order_heavy', 'ORDER OUT (HEAVY SALE)')}
                    onChange={(e) => handleDescChange('lbl_order_heavy', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_order_heavy', 'ORDER OUT (HEAVY SALE)')}</span>
                )}
              </td>
              <td className="mis-qty-cell">
                {isEditMode ? (
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    className="mis-cell-input"
                    value={manualOverrides['order_out_heavy_sale'] !== undefined ? manualOverrides['order_out_heavy_sale'] : f3(orderOutHeavySale)}
                    onChange={(e) => handleOverrideChange('order_out_heavy_sale', e.target.value)}
                  />
                ) : (
                  <span>{f3(orderOutHeavySale)}</span>
                )}
              </td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell mis-bold-label">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input mis-bold-label"
                    value={getDesc('lbl_total_sales', 'TOTAL SALES (LIGHT + HEAVY)')}
                    onChange={(e) => handleDescChange('lbl_total_sales', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_total_sales', 'TOTAL SALES (LIGHT + HEAVY)')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(totalSales)}</td>
            </tr>
            <tr className="mis-summary-stat-row">
              <td colSpan={2} className="mis-summary-label-cell mis-bold-label">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input mis-bold-label"
                    value={getDesc('lbl_total_metal', 'TOTAL METAL')}
                    onChange={(e) => handleDescChange('lbl_total_metal', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_total_metal', 'TOTAL METAL')}</span>
                )}
              </td>
              <td className="mis-qty-cell mis-bold-qty">{f3(grandTotalMetal)}</td>
            </tr>

            {/* ========================================================= */}
            {/* 4. YESTERDAY INCOMING & OUTGOING MATERIALS HEADER */}
            {/* ========================================================= */}
            <tr className="mis-pdf-section-title-row">
              <td colSpan={3} className="mis-pdf-section-title-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-section-title-input"
                    value={getDesc('lbl_yest_sec_title', 'YESTERDAY INCOMING & OUTGOING MATERIALS')}
                    onChange={(e) => handleDescChange('lbl_yest_sec_title', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_yest_sec_title', 'YESTERDAY INCOMING & OUTGOING MATERIALS')}</span>
                )}
              </td>
            </tr>
            <tr className="mis-pdf-subth-row">
              <td className="mis-empty-col"></td>
              <td className="mis-th-center">SIZE</td>
              <td className="mis-th-center">QTY</td>
            </tr>

            {/* YESTERDAY BILLETS INCOMING */}
            {allYestIncomingRows.length > 0 ? (
              <>
                {allYestIncomingRows.map((item, idx) => (
                  <tr key={item.key}>
                    {idx === 0 && (
                      <td className="mis-category-merged-cell" rowSpan={allYestIncomingRows.length}>
                        BILLETS INCOMING
                        {isEditMode && (
                          <button
                            type="button"
                            className="mis-add-row-mini-btn"
                            title="Add row to Yesterday Incoming"
                            onClick={() => handleAddRow('yi')}
                          >
                            + Add
                          </button>
                        )}
                      </td>
                    )}
                    <td className="mis-desc-cell">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditMode ? (
                          <input
                            type="text"
                            className="mis-desc-input"
                            value={getDesc(item.key, item.defaultDesc)}
                            onChange={(e) => handleDescChange(item.key, e.target.value)}
                          />
                        ) : (
                          <span>{getDesc(item.key, item.defaultDesc)}</span>
                        )}
                        {isEditMode && item.isCustom && (
                          <span
                            className="mis-del-row-btn"
                            title="Delete row"
                            onClick={() => handleRemoveCustomRow('yi', item.key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mis-qty-cell">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          className="mis-cell-input"
                          value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                          onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{f3(getVal(item.key, item.auto))}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* TOTAL YESTERDAY INCOMING */}
                <tr className="mis-pdf-subtotal-row">
                  <td colSpan={2} className="mis-total-label-cell">
                    TOTAL
                  </td>
                  <td className="mis-qty-cell mis-bold-qty">
                    {f3(grandTotalYestIncoming)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="mis-category-merged-cell">
                  BILLETS INCOMING
                  {isEditMode && (
                    <button
                      type="button"
                      className="mis-add-row-mini-btn"
                      onClick={() => handleAddRow('yi')}
                    >
                      + Add
                    </button>
                  )}
                </td>
                <td className="mis-desc-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No incoming records for selected date
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 5. OUTGOING MATERIALS */}
            {/* ========================================================= */}
            {allOutgoingRows.length > 0 ? (
              <>
                {allOutgoingRows.map((item, idx) => (
                  <tr key={item.key}>
                    {idx === 0 && (
                      <td className="mis-category-merged-cell" rowSpan={allOutgoingRows.length}>
                        OUTGOING MATERIALS
                        {isEditMode && (
                          <button
                            type="button"
                            className="mis-add-row-mini-btn"
                            title="Add row to Outgoing Materials"
                            onClick={() => handleAddRow('out')}
                          >
                            + Add
                          </button>
                        )}
                      </td>
                    )}
                    <td className="mis-desc-cell">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditMode ? (
                          <input
                            type="text"
                            className="mis-desc-input"
                            value={getDesc(item.key, item.defaultDesc)}
                            onChange={(e) => handleDescChange(item.key, e.target.value)}
                          />
                        ) : (
                          <span>{getDesc(item.key, item.defaultDesc)}</span>
                        )}
                        {isEditMode && item.isCustom && (
                          <span
                            className="mis-del-row-btn"
                            title="Delete row"
                            onClick={() => handleRemoveCustomRow('out', item.key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mis-qty-cell">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          className="mis-cell-input"
                          value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                          onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{f3(getVal(item.key, item.auto))}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* TOTAL OUTGOING */}
                <tr className="mis-pdf-subtotal-row">
                  <td colSpan={2} className="mis-total-label-cell">
                    TOTAL
                  </td>
                  <td className="mis-qty-cell mis-bold-qty">
                    {f3(grandTotalOutgoingMat)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="mis-category-merged-cell">
                  OUTGOING MATERIALS
                  {isEditMode && (
                    <button
                      type="button"
                      className="mis-add-row-mini-btn"
                      onClick={() => handleAddRow('out')}
                    >
                      + Add
                    </button>
                  )}
                </td>
                <td className="mis-desc-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No outgoing records for selected date
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 6. TOTAL STRUCTURE PRODUCTION IN 24HR */}
            {/* ========================================================= */}
            <tr className="mis-pdf-subth-row">
              <td colSpan={2} className="mis-prod-header-cell">
                {isEditMode ? (
                  <input
                    type="text"
                    className="mis-summary-desc-input"
                    value={getDesc('lbl_prod_sec_title', 'TOTAL STRUCTURE PRODUCTION IN 24HR')}
                    onChange={(e) => handleDescChange('lbl_prod_sec_title', e.target.value)}
                  />
                ) : (
                  <span>{getDesc('lbl_prod_sec_title', 'TOTAL STRUCTURE PRODUCTION IN 24HR')}</span>
                )}
              </td>
              <td className="mis-th-center">
                QTY
                {isEditMode && (
                  <button
                    type="button"
                    className="mis-add-row-mini-btn"
                    title="Add row to Production"
                    onClick={() => handleAddRow('prod')}
                  >
                    + Add
                  </button>
                )}
              </td>
            </tr>
            {allProdRows.length > 0 ? (
              <>
                {allProdRows.map((item) => (
                  <tr key={item.key}>
                    <td colSpan={2} className="mis-prod-item-cell">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isEditMode ? (
                          <input
                            type="text"
                            className="mis-summary-desc-input"
                            value={getDesc(item.key, item.defaultDesc)}
                            onChange={(e) => handleDescChange(item.key, e.target.value)}
                          />
                        ) : (
                          <span>{getDesc(item.key, item.defaultDesc)}</span>
                        )}
                        {isEditMode && item.isCustom && (
                          <span
                            className="mis-del-row-btn"
                            title="Delete row"
                            onClick={() => handleRemoveCustomRow('prod', item.key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mis-qty-cell">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          className="mis-cell-input"
                          value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                          onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{f3(getVal(item.key, item.auto))}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* TOTAL PRODUCTION */}
                <tr className="mis-pdf-subtotal-row">
                  <td colSpan={2} className="mis-total-label-cell">
                    TOTAL
                  </td>
                  <td className="mis-qty-cell mis-bold-qty">
                    {f3(grandTotalProduction)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={2} className="mis-prod-item-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No production records for selected date
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 7. BALANCE PENDING OUTGOING */}
            {/* ========================================================= */}
            {allPendingRows.length > 0 ? (
              allPendingRows.map((item) => (
                <tr key={item.key} className="mis-summary-stat-row">
                  <td colSpan={2} className="mis-pending-label-cell">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          className="mis-summary-desc-input"
                          value={getDesc(item.key, item.defaultDesc)}
                          onChange={(e) => handleDescChange(item.key, e.target.value)}
                        />
                      ) : (
                        <span>{getDesc(item.key, item.defaultDesc)}</span>
                      )}
                      {isEditMode && item.isCustom && (
                        <span
                          className="mis-del-row-btn"
                          title="Delete row"
                          onClick={() => handleRemoveCustomRow('pend', item.key)}
                        >
                          ×
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="mis-qty-cell">
                    {isEditMode ? (
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        className="mis-cell-input"
                        value={manualOverrides[item.key] !== undefined ? manualOverrides[item.key] : f3(item.auto)}
                        onChange={(e) => handleOverrideChange(item.key, e.target.value)}
                      />
                    ) : (
                      <span>{f3(getVal(item.key, item.auto))}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="mis-summary-stat-row">
                <td colSpan={2} className="mis-pending-label-cell" style={{ color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  No pending balance outgoing records
                  {isEditMode && (
                    <button
                      type="button"
                      className="mis-add-row-mini-btn"
                      onClick={() => handleAddRow('pend')}
                    >
                      + Add
                    </button>
                  )}
                </td>
                <td className="mis-qty-cell mis-bold-qty">0.000</td>
              </tr>
            )}

            {/* ========================================================= */}
            {/* 8. NOTE:- */}
            {/* ========================================================= */}
            <tr className="mis-note-pdf-row">
              <td className="mis-note-title-cell">
                NOTE:-
              </td>
              <td colSpan={2} className="mis-note-content-cell">
                {isEditMode ? (
                  <textarea
                    rows={2}
                    className="mis-note-pdf-textarea"
                    placeholder="Enter management notes here..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                ) : (
                  <div style={{ minHeight: '22px', fontSize: '11.5px', whiteSpace: 'pre-wrap' }}>
                    {noteText || ''}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
