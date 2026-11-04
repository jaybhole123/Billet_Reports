import React, { useState, useMemo, useRef, useEffect } from 'react';
import DateNavigator from '../components/DateNavigator';
import './LsmFinishStock.css';

function num(s) {
  const v = parseFloat(String(s == null ? '' : s).replace(/,/g, ''));
  return isNaN(v) ? 0 : v;
}

function has(s) {
  return String(s == null ? '' : s).trim() !== '';
}

function f3(v) {
  return (Math.round(v * 1000) / 1000).toFixed(3);
}

function norm(x) {
  return String(x == null ? '' : x).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cv(x) {
  return x == null ? '' : String(x).trim();
}

const NC = 7;
const CN = [
  '12mtr',
  '18Ft. (5.500Mtr)',
  '20 Ft. (6.100 Mtr)',
  '21 Ft. (6.400 Mtr)',
  '22 Ft. (6.705 Mtr)',
  'Random 12-13.5 Ft.',
  'DEFECTIVE',
];

const CN_SHORT = ['12mtr', '18Ft', '20 Ft', '21 Ft', '22 Ft', 'Random', 'Defective'];

function R(sl, sec, cls, o, rem) {
  const v = [];
  for (let i = 0; i < NC; i++) v.push(o && o[i] != null ? o[i] : '');
  return { sl: sl, sec: sec, cls: cls, v: v, rem: rem || '' };
}

function getInitialData() {
  const B = [];
  B.push({
    mixed: '275.000',
    printed: 1096,
    rows: [
      R('1', 'MSA 25X25X3 (KAY 2)', 'b', { 2: '4.000', 4: '21.000' }),
      R('2', 'MSA 25X25X5 (KAY 2)', 'b', { 2: '213.000', 4: '5.000' }),
      R('3', 'MSA 30X30X3 (KAY2)', 'b'),
      R('4', 'MSA 32X32X5(KAY2)', 'b'),
      R('5', 'MSA 35X35X5 (KAY 2)', 'b', { 2: '45.000' }),
      R('6', 'MSA 35X35X4 (KAY 2)', 'b', { 2: '57.000' }),
      R('7', 'MSA 40X40X4 (KAY 2)', 'b'),
      R('8', 'MSA 40X40X5 (KAY 2)', 'b', { 1: '14.000', 2: '144.000', 4: '16.000' }),
      R('9', 'MSA 40X40X6 (KAY 2)', 'b', { 1: '2.000', 2: '29.000', 3: '5.000' }),
      R('10', 'MSA 50X50X4 (KAY 2)', 'b', { 1: '2.000', 2: '5.000' }),
      R('11', 'MSA 50X50X5 (KAY 2)', 'b', { 1: '3.000', 2: '140.000', 4: '47.000' }),
      R('12', 'MSA 50X50X6 (KAY 2)', 'b', { 1: '8.000', 2: '5.000', 4: '17.000' }),
      R('13', 'MSA 45X45X4 (KAY 2)', 'b', { 2: '20.000' }),
      R('14', 'MSA 25X25X3', 'b', { 2: '19.000' }),
    ],
  });

  B.push({
    mixed: null,
    printed: 318.4,
    rows: [
      R('14', 'MS ROUND 12MM', 'r', { 2: '6.000', 4: '7.000', 6: '6.000' }),
      R('15', 'MS ROUND 16MM', 'r', { 0: '2.400', 1: '5.000', 4: '4.000' }),
      R('16', 'MS ROUND 20MM', 'r', { 2: '33.000', 4: '5.000' }),
      R('17', 'MS ROUND 25MM', 'r', { 1: '2.000', 2: '90.000' }),
      R('18', 'MS ROUND 32MM', 'r', { 2: '28.000', 4: '40.000' }),
      R('19', 'MS ROUND 40MM', 'r', { 1: '38.000', 2: '52.000' }),
    ],
  });

  B.push({
    mixed: null,
    printed: 130,
    rows: [
      R('20', 'MS ROUND 16MM (TESTED)', 'g', { 0: '10.000' }),
      R('21', 'MS ROUND 20MM (TESTED)', 'g', { 2: '35.000' }),
      R('22', 'MS FLAT 65X10 (TESTED)', 'g', { 2: '56.000' }),
      R('', 'MS FLAT 65X6 (TESTED)', 'g', { 2: '17.000' }),
      R('23', 'MS FLAT 50X8 (TESTED)', 'g', { 2: '2.000' }),
      R('24', 'MS FLAT 50X6 (TESTED)', 'g', { 2: '10.000' }),
      R('25', 'MS FLAT 40X6 (TESTED)', 'g'),
    ],
  });

  B.push({
    mixed: '383.000',
    printed: 596,
    rows: [
      R('26', 'MS FLAT 65X12 (KAMDHENU)', 'p', { 4: '2.000' }),
      R('27', 'MS FLAT 65X10 (KAMDHENU)', 'p', { 1: '10.000', 4: '1.000' }),
      R('28', 'MS FLAT 65X8 (KAMDHENU)', 'p', { 1: '22.000', 4: '40.000' }),
      R('29', 'MS FLAT 65X6 (KAMDHENU)', 'p', { 1: '3.000' }),
      R('32', 'MS FLAT 40X12 (KAMDHENU)', 'p', { 2: '74.000', 4: '6.000' }),
      R('33', 'MS FLAT 40X10 (KAMDHENU)', 'p', { 4: '19.000' }),
      R('34', 'MS FLAT 40X8 (KAMDHENU)', 'p', { 4: '7.000' }),
      R('35', 'MS FLAT 40X6 (KAMDHENU)', 'p', { 2: '5.000', 4: '24.000' }),
      R('36', 'MS FLAT 40X5 (KAMDHENU)', 'p'),
    ],
  });

  B.push({
    mixed: null,
    printed: 492,
    rows: [
      R('37', 'MS FLAT 65X12 (W.E.)', 'gr', { 2: '21.000' }),
      R('38', 'MS FLAT 65X10 (W.E.)', 'gr', { 2: '52.000' }),
      R('39', 'MS FLAT 65X8 (W.E.)', 'gr', { 1: '4.000', 2: '2.000', 4: '16.000' }),
      R('40', 'MS FLAT 65X6 (W.E.)', 'gr', { 1: '4.000', 2: '70.000' }),
      R('41', 'MS FLAT 50X12 (W.E)', 'gr', { 1: '1.500', 2: '12.000' }),
      R('42', 'MS FLAT 50X10 (W.E)', 'gr'),
      R('43', 'MS FLAT 50X8 (W.E)', 'gr', { 2: '8.000', 4: '10.000' }),
      R('44', 'MS FLAT 50X6 (W.E)', 'gr', { 1: '6.000', 4: '40.000' }),
      R('45', 'MS FLAT 50X5 (W.E)', 'gr', { 2: '1.500' }),
      R('46', 'MS FLAT 32X5 (W.E)', 'gr', { 2: '50.000', 4: '52.000' }),
      R('47', 'MS FLAT 25X5 (W.E)', 'gr', { 2: '9.000', 4: '20.000' }),
      R('48', 'MS FLAT 40X10 (W.E)', 'gr', { 1: '2.000', 2: '24.000' }),
      R('49', 'MS FLAT 40X8 (W.E)', 'gr', { 4: '22.000' }),
      R('50', 'MS FLAT 40X6 (W.E)', 'gr', { 2: '43.000' }),
      R('51', 'MS FLAT 40X5 (W.E)', 'gr'),
      R('52', 'SQ BAR 16MM', 'gr', { 2: '10.000' }),
      R('53', 'SQ BAR 20MM', 'gr', { 2: '12.000' }),
    ],
  });

  return {
    date: '27-10-2026',
    less: '16.500',
    gprinted: { total: 2632.4, fin: 2648.9 },
    blocks: B.map((b) => ({ rows: b.rows, mixed: b.mixed, printed: b.printed })),
  };
}

function rowTot(r) {
  let t = 0;
  r.v.forEach((x) => {
    t += num(x);
  });
  return t;
}

function blkSum(b) {
  let t = has(b.mixed) ? num(b.mixed) : 0;
  b.rows.forEach((r) => {
    t += rowTot(r);
  });
  return t;
}

export default function LsmFinishStock() {
  const [stockState, setStockState] = useState(() => {
    try {
      const isCleared = localStorage.getItem('lsmstock_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('lsm_finish_stock_v2');
        localStorage.setItem('lsmstock_cleared_v1', 'true');
        return {
          date: new Date().toISOString().slice(0, 10),
          blocks: [],
        };
      }
      const saved = localStorage.getItem('lsm_finish_stock_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.blocks) {
          if (parsed.date === '27.10') parsed.date = '27-10-2026';
          return parsed;
        }
      }
    } catch {}
    return {
      date: new Date().toISOString().slice(0, 10),
      blocks: [],
    };
  });

  const [message, setMessage] = useState({ text: '', isErr: false });
  const [isDragOver, setIsDragOver] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curCoord, setCurCoord] = useState({ b: -1, r: -1 });
  const [formErr, setFormErr] = useState('');
  const [formFields, setFormFields] = useState({
    sl: '',
    sec: '',
    cls: 'b',
    v: new Array(NC).fill(''),
    rem: '',
    blk: '0',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const xFileRef = useRef(null);
  const iFileRef = useRef(null);

  const getKey = (force) => {
    let k = null;
    try {
      k = localStorage.getItem('anthropic_key');
    } catch {}
    if (!k || force) {
      k = window.prompt('Anthropic API key daalein (sk-ant-...):', k || '');
      if (!k) return null;
      k = k.trim();
      try {
        localStorage.setItem('anthropic_key', k);
      } catch {}
    }
    return k;
  };

  const handleReadImage = (file) => {
    if (!file || file.type.indexOf('image') !== 0) {
      showMsg('Sirf image file select karein.', true);
      return;
    }
    const key = getKey();
    if (!key) {
      showMsg('API key ke bina image nahi padh sakte.', true);
      return;
    }
    if (
      stockState.blocks.length &&
      !window.confirm('Abhi ka data hat kar image ka data aayega. Aage badhun?')
    ) {
      return;
    }

    const PROMPT_LSM =
      'Ye ek steel mill ki "LSM FINISH STOCK" sheet ki image hai. Poori table upar se neeche tak exactly extract karo, koi row mat chhodo.\n' +
      'Columns: SL./No., SECTION, 12mtr, 18Ft, 20 Ft, 21 Ft, 22 Ft, Random, DEFECTIVE, TOTAL.\n' +
      'Output SIRF valid JSON: {"blocks":[{"rows":[["1","MSA 25X25X3 (KAY 2)","","","4.000","","21.000","","","25.000"]],"mixed":"275.000","sub":"1096.000"}],"grand":"2632.400","less":"16.500","final":"2648.900"}';

    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = async () => {
        try {
          setIsAnalyzing(true);
          showMsg('Claude image padh raha hai... (1-2 minute lag sakte hain)');

          const max = 3200;
          const sc = Math.min(1, max / Math.max(im.width, im.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(im.width * sc);
          canvas.height = Math.round(im.height * sc);
          canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
          const b64 = canvas.toDataURL('image/png').split(',')[1];

          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 16000,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
                    { type: 'text', text: PROMPT_LSM },
                  ],
                },
              ],
            }),
          });

          const d = await res.json();
          setIsAnalyzing(false);
          if (!res.ok) throw new Error((d.error && d.error.message) || `API error ${res.status}`);

          const txt = d.content
            .map((x) => x.text || '')
            .join('')
            .replace(/```json|```/g, '')
            .trim();
          const parsed = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));

          if (parsed && parsed.blocks) {
            const newBl = parsed.blocks.map((b) => ({
              mixed: has(b.mixed) ? f3(num(b.mixed)) : null,
              printed: has(b.sub) ? num(b.sub) : null,
              rows: b.rows.map((a) => {
                const v = [];
                for (let i = 0; i < NC; i++) v.push(has(a[2 + i]) ? f3(num(a[2 + i])) : '');
                const sec = cv(a[1]);
                const s = sec.toLowerCase();
                const cls = /tested/.test(s) ? 'g' : /kamdhenu/.test(s) ? 'p' : /w\.?e/.test(s) ? 'gr' : /round/.test(s) ? 'r' : 'b';
                return {
                  sl: cv(a[0]),
                  sec: sec,
                  cls: cls,
                  v: v,
                  rem: '',
                };
              }),
            }));

            updateState({
              date: stockState.date,
              less: has(parsed.less) ? f3(num(parsed.less)) : stockState.less,
              blocks: newBl,
            });

            showMsg('Image se LSM stock data safalta-poorvak load ho gaya.');
          }
        } catch (err) {
          setIsAnalyzing(false);
          showMsg('Error: ' + err.message, true);
        }
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  };

  const showMsg = (text, isErr = false) => {
    setMessage({ text, isErr });
  };

  const persist = (data) => {
    try {
      localStorage.setItem('lsm_finish_stock_v2', JSON.stringify(data));
    } catch {}
  };

  const updateState = (updater) => {
    setStockState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(next);
      return next;
    });
  };

  // KPI Calculations
  let grandTotal = 0;
  let totalRows = 0;
  const colTotals = new Array(NC).fill(0);

  stockState.blocks.forEach((bl) => {
    totalRows += bl.rows.length;
    grandTotal += blkSum(bl);
    bl.rows.forEach((r) => {
      for (let c = 0; c < NC; c++) {
        colTotals[c] += num(r.v[c]);
      }
    });
  });

  const totalWithoutStrapping = num(stockState.less);
  const finalStock = grandTotal + totalWithoutStrapping;

  // Helper to calculate next serial number
  const getNextSl = () => {
    let max = 0;
    stockState.blocks.forEach((bl) => {
      bl.rows.forEach((r) => {
        const val = parseInt(r.sl, 10);
        if (!isNaN(val) && val > max) max = val;
      });
    });
    return String(max + 1);
  };

  // Open Form
  const openForm = (bi, ri) => {
    setCurCoord({ b: bi, r: ri });
    setFormErr('');

    const r = ri >= 0 && stockState.blocks[bi] ? stockState.blocks[bi].rows[ri] : null;
    const bl = stockState.blocks[bi];
    const lastRow = bl && bl.rows.length ? bl.rows[bl.rows.length - 1] : null;

    setFormFields({
      sl: r ? r.sl : getNextSl(),
      sec: r ? r.sec : '',
      cls: r ? r.cls : lastRow ? lastRow.cls : 'b',
      v: r ? [...r.v] : new Array(NC).fill(''),
      rem: r ? r.rem : '',
      blk: bi >= 0 && bl ? String(bi) : stockState.blocks.length ? '0' : 'new',
    });

    setIsModalOpen(true);
  };

  const handleFormFieldChange = (field, val) => {
    setFormFields((prev) => ({ ...prev, [field]: val }));
  };

  const handleSizeValChange = (idx, val) => {
    setFormFields((prev) => {
      const nextV = [...prev.v];
      nextV[idx] = val;
      return { ...prev, v: nextV };
    });
  };

  const currentModalRowTotal = useMemo(() => {
    return formFields.v.reduce((acc, curr) => acc + num(curr), 0);
  }, [formFields.v]);

  const saveForm = () => {
    const sec = formFields.sec.trim();
    if (!sec) {
      setFormErr('Section ka naam likhein.');
      return false;
    }

    const cleanV = [];
    for (let i = 0; i < NC; i++) {
      const raw = String(formFields.v[i] || '').trim();
      if (raw === '') {
        cleanV.push('');
        continue;
      }
      const n = parseFloat(raw.replace(/,/g, ''));
      if (isNaN(n)) {
        setFormErr(`"${CN[i]}" me kripya sirf sankhya (numbers) likhein.`);
        return false;
      }
      cleanV.push(f3(n));
    }

    const row = {
      sl: formFields.sl.trim(),
      sec: sec,
      cls: formFields.cls,
      v: cleanV,
      rem: formFields.rem.trim(),
    };

    const sel = formFields.blk;
    let target = sel === 'new' || isNaN(+sel) ? -1 : +sel;

    updateState((prev) => {
      const newBlocks = (prev.blocks || []).map((b) => ({ ...b, rows: [...(b.rows || [])] }));

      if (target < 0 || !newBlocks[target]) {
        newBlocks.push({ rows: [], mixed: null, printed: null });
        target = newBlocks.length - 1;
      }

      if (curCoord.r >= 0 && curCoord.b >= 0 && newBlocks[curCoord.b]) {
        const oldB = newBlocks[curCoord.b];
        if (target === curCoord.b) {
          oldB.rows[curCoord.r] = row;
        } else {
          oldB.rows.splice(curCoord.r, 1);
          if (newBlocks[target]) {
            newBlocks[target].rows.push(row);
          }
        }
      } else {
        if (newBlocks[target]) {
          newBlocks[target].rows.push(row);
        }
      }

      const filtered = newBlocks.filter((b) => b && (b.rows.length > 0 || has(b.mixed)));
      return { ...prev, blocks: filtered };
    });

    showMsg('Entry safalta-poorvak save ho gayi.');
    return true;
  };

  const handleDeleteRow = (bi, ri) => {
    const row = stockState.blocks[bi]?.rows[ri];
    if (!row) return;
    if (!window.confirm(`Ye row delete karein?\n${row.sl}  ${row.sec}`)) return;

    updateState((prev) => {
      const newBlocks = prev.blocks.map((b) => ({ ...b, rows: [...b.rows] }));
      newBlocks[bi].rows.splice(ri, 1);
      const filtered = newBlocks.filter((b) => b.rows.length > 0 || has(b.mixed));
      return { ...prev, blocks: filtered };
    });

    showMsg('Row delete ho gayi.');
  };

  const handleSetMixedValue = (bi) => {
    const bl = stockState.blocks[bi];
    if (!bl) return;
    const v = window.prompt('Mixed Random Size ki value (Mt):', bl.mixed || '');
    if (v === null) return;
    if (v.trim() === '') {
      updateState((prev) => {
        const nextB = prev.blocks.map((b, i) => (i === bi ? { ...b, mixed: null } : b));
        return { ...prev, blocks: nextB };
      });
    } else if (isNaN(parseFloat(v))) {
      showMsg('Sirf sankhya (number) likhein.', true);
    } else {
      updateState((prev) => {
        const nextB = prev.blocks.map((b, i) => (i === bi ? { ...b, mixed: f3(num(v)) } : b));
        return { ...prev, blocks: nextB };
      });
      showMsg('Mixed Random Size value update ho gayi.');
    }
  };

  const handleDeleteBlock = (bi) => {
    const bl = stockState.blocks[bi];
    if (!bl) return;
    if (window.confirm(`Ye poora block (${bl.rows.length} rows) delete karein?`)) {
      updateState((prev) => {
        const nextB = prev.blocks.filter((_, i) => i !== bi);
        return { ...prev, blocks: nextB };
      });
      showMsg('Block hata diya gaya.');
    }
  };

  // Autocomplete unique sections
  const allSections = useMemo(() => {
    const set = new Set();
    stockState.blocks.forEach((b) => {
      b.rows.forEach((r) => {
        if (r.sec) set.add(r.sec);
      });
    });
    return Array.from(set).sort();
  }, [stockState]);

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
          showMsg('Excel parse ho raha hai...');
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
  }, [isModalOpen, stockState]);

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
        showMsg('Excel file upload ho gayi.');
      } else {
        showMsg('Kripya valid Excel ya Image file drop karein.', true);
      }
    }
  };

  return (
    <div
      className={`lsm-page-container ${isDragOver ? 'global-drag-active' : ''}`}
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
            <span>Drop Excel (.xlsx, .xls) ya Image yahan load karne ke liye</span>
          </div>
        </div>
      )}
      {/* Top Header */}
      <div className="lsm-page-header">
        <div>
          <h2>LSM Finish Stock</h2>
          <p>Section-wise finish goods inventory, bundle lengths &amp; defectives summary</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="lsm-kpi-grid">
        <div className="lsm-kpi-card highlight">
          <div className="lsm-kpi-label">Kul Sections &amp; Rows</div>
          <div className="lsm-kpi-value">{totalRows} Rows</div>
          <div className="lsm-kpi-sub">{stockState.blocks.length} Product Blocks</div>
        </div>

        <div className="lsm-kpi-card">
          <div className="lsm-kpi-label">Sub-Total Stock [Mt]</div>
          <div className="lsm-kpi-value">{f3(grandTotal)}</div>
          <div className="lsm-kpi-sub">Bundled Sections Total</div>
        </div>

        <div className="lsm-kpi-card accent">
          <div className="lsm-kpi-label">Without Strapping [Mt]</div>
          <div className="lsm-kpi-value">{f3(totalWithoutStrapping)}</div>
          <div className="lsm-kpi-sub">Loose / Unpacked Stock</div>
        </div>

        <div className="lsm-kpi-card success">
          <div className="lsm-kpi-label">Final Net Stock [Mt]</div>
          <div className="lsm-kpi-value">{f3(finalStock)}</div>
          <div className="lsm-kpi-sub">Grand Total LSM Stock</div>
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
            accept=".xlsx,.xls,.xlsm,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                showMsg('Excel parse ho raha hai...');
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

      {/* Single Line Clean Toolbar */}
      <div className="lsm-toolbar-card">
        <div className="lsm-toolbar-group">
          <button
            type="button"
            className="lsm-btn pri"
            onClick={() => openForm(stockState.blocks.length ? stockState.blocks.length - 1 : -1, -1)}
          >
            + New Entry
          </button>

          <button
            type="button"
            className="lsm-btn danger-outline"
            onClick={() => {
              if (window.confirm('Saara LSM data hata dein?')) {
                updateState({ ...stockState, blocks: [] });
                showMsg('Clear All Data');
              }
            }}
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Status banner */}
      {message.text && (
        <div>
          <div className={`lsm-msg-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="lsm-table-card">
        <div className="lsm-table-title-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="lsm-title-tag">LSM</span>
            <span className="lsm-table-title">LSM FINISH STOCK REPORT</span>
          </div>

          <DateNavigator
            value={stockState.date || new Date().toISOString().slice(0, 10)}
            onChange={(d) => updateState({ ...stockState, date: d })}
          />
        </div>

        <div className="lsm-scroll-wrap">
          <table className="lsm-table-main" id="lsm-data-table">
            <thead>
              <tr>
                <th style={{ width: '55px' }}>SL./No.</th>
                <th style={{ minWidth: '220px', textAlign: 'left' }}>SECTION</th>
                <th style={{ width: '75px' }}>12mtr</th>
                <th style={{ width: '85px' }}>18Ft. (5.5M)</th>
                <th style={{ width: '85px' }}>20 Ft. (6.1M)</th>
                <th style={{ width: '85px' }}>21 Ft. (6.4M)</th>
                <th style={{ width: '85px' }}>22 Ft. (6.7M)</th>
                <th style={{ width: '95px' }}>Random 12-13.5Ft</th>
                <th style={{ width: '85px' }}>DEFECTIVE</th>
                <th style={{ width: '95px' }}>TOTAL</th>
                <th style={{ minWidth: '130px', textAlign: 'left' }}>Remarks</th>
                <th style={{ width: '85px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockState.blocks.length > 0 ? (
                stockState.blocks.map((bl, bi) => {
                  const s = blkSum(bl);
                  return (
                    <React.Fragment key={bi}>
                      {bl.rows.map((r, ri) => {
                        const tot = rowTot(r);
                        return (
                          <tr key={ri} className={`d ${r.cls || 'b'}`}>
                            <td className="c">{r.sl}</td>
                            <td className="s">{r.sec}</td>
                            {r.v.map((val, ci) => (
                              <td key={ci} className="n">
                                {val}
                              </td>
                            ))}
                            <td className="n tt">{f3(tot)}</td>
                            <td className="rem">{r.rem}</td>
                            <td className="act">
                              <div className="lsm-act-group">
                                <button
                                  type="button"
                                  className="lsm-icon-btn"
                                  title="Row Update Karein"
                                  onClick={() => openForm(bi, ri)}
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="lsm-icon-btn del"
                                  title="Row Delete Karein"
                                  onClick={() => handleDeleteRow(bi, ri)}
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Mixed Random Size if present */}
                      {has(bl.mixed) && (
                        <tr className="mix">
                          <td />
                          <td />
                          <td className="lb" colSpan={6}>
                            MIXED RANDOM SIZE
                          </td>
                          <td />
                          <td className="n">{f3(num(bl.mixed))}</td>
                          <td />
                          <td className="act">
                            <div className="lsm-act-group">
                              <button
                                type="button"
                                className="lsm-icon-btn"
                                title="Value Badlein"
                                onClick={() => handleSetMixedValue(bi)}
                              >
                                ✎
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Sub Total Row */}
                      <tr className="sub">
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <td className="lb">Sub Total</td>
                        <td className="v">{f3(s)}</td>
                        <td className="rem" />
                        <td className="act">
                          <div className="lsm-sub-act-group">
                            <button
                              type="button"
                              className="lsm-sub-btn add-row"
                              title="Nayi row jodein"
                              onClick={() => openForm(bi, -1)}
                            >
                              + Row
                            </button>
                            <button
                              type="button"
                              className="lsm-sub-btn"
                              title="Mixed Random Size add/edit karein"
                              onClick={() => handleSetMixedValue(bi)}
                            >
                              Mixed
                            </button>
                            <button
                              type="button"
                              className="lsm-sub-btn"
                              style={{ color: '#dc2626' }}
                              title="Block delete karein"
                              onClick={() => handleDeleteBlock(bi)}
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No records found. Click "+ New Entry" or upload a file to begin.
                  </td>
                </tr>
              )}

              {/* Column Summary Row */}
              {stockState.blocks.length > 0 && (
                <>
                  <tr className="col">
                    <td />
                    <td style={{ fontWeight: 700 }}>COLUMNS SUM</td>
                    {colTotals.map((ct, idx) => (
                      <td key={idx} className="n">
                        {f3(ct)}
                      </td>
                    ))}
                    <td className="n v" title="Saare columns ka jod (Mixed Size chhodkar)">
                      {f3(colTotals.reduce((a, b) => a + b, 0))}
                    </td>
                    <td />
                    <td className="act" />
                  </tr>

                  {/* Grand Total Row */}
                  <tr className="gt">
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td className="lb">TOTAL</td>
                    <td className="v">{f3(grandTotal)}</td>
                    <td className="rem" />
                    <td className="act" />
                  </tr>

                  {/* Strapping / Special Adjustment Row */}
                  <tr className="less">
                    <td className="c">54</td>
                    <td colSpan={8}>
                      STOCK WITH OUT STRAPPING &amp; WITH OUT PACKING &amp; REJECTION QTY =
                    </td>
                    <td className="v">
                      <input
                        style={{
                          width: '90px',
                          textAlign: 'right',
                          fontWeight: 700,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontFamily: 'inherit',
                          fontSize: '13.5px',
                        }}
                        value={stockState.less || ''}
                        onChange={(e) => updateState({ ...stockState, less: e.target.value })}
                      />
                    </td>
                    <td />
                    <td className="act" />
                  </tr>

                  {/* Final Net Stock Row */}
                  <tr className="fin">
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td style={{ fontWeight: 800, textAlign: 'right' }}>FINAL STOCK</td>
                    <td className="v">{f3(finalStock)}</td>
                    <td className="rem" />
                    <td className="act" />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal Dialog */}
      {isModalOpen && (
        <div className="lsm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="lsm-modal-box" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="lsm-modal-hd">
              <span>{curCoord.r >= 0 ? '✏️ Row Update Karein' : '➕ New Section Row Entry'}</span>
              <button
                type="button"
                className="lsm-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="lsm-modal-bd">
              <div className="lsm-top-grid" style={{ gridTemplateColumns: '1fr 140px' }}>
                <div>
                  <label htmlFor="f_sec">Section</label>
                  <input
                    type="text"
                    id="f_sec"
                    list="lsm-sections"
                    autoComplete="off"
                    placeholder="MS FLAT 65X10 (KAMDHENU)"
                    value={formFields.sec}
                    onChange={(e) => handleFormFieldChange('sec', e.target.value)}
                  />
                  <datalist id="lsm-sections">
                    {allSections.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="f_blk">Block</label>
                  <select
                    id="f_blk"
                    value={formFields.blk}
                    onChange={(e) => handleFormFieldChange('blk', e.target.value)}
                  >
                    {stockState.blocks.map((b, i) => {
                      const r0 = b.rows[0] || {};
                      return (
                        <option key={i} value={String(i)}>
                          Block {i + 1}: {r0.sec || 'Section'} ({b.rows.length} rows)
                        </option>
                      );
                    })}
                    <option value="new">+ Naya Block (Naya Sub Total)</option>
                  </select>
                </div>
              </div>

              {/* Bundle Size Quantities Grid */}
              <div className="lsm-sizes-grid">
                {CN_SHORT.map((colName, idx) => (
                  <div key={idx}>
                    <label htmlFor={`f_size_${idx}`}>{colName}</label>
                    <input
                      type="text"
                      id={`f_size_${idx}`}
                      inputMode="decimal"
                      value={formFields.v[idx] || ''}
                      onChange={(e) => handleSizeValChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="lsm-bottom-grid">
                <div>
                  <label htmlFor="f_rem">Remarks</label>
                  <input
                    type="text"
                    id="f_rem"
                    autoComplete="off"
                    value={formFields.rem}
                    onChange={(e) => handleFormFieldChange('rem', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_cls">Row ka Rang / Group</label>
                  <select
                    id="f_cls"
                    value={formFields.cls}
                    onChange={(e) => handleFormFieldChange('cls', e.target.value)}
                  >
                    <option value="b">Neela (MSA)</option>
                    <option value="r">Grey-Neela (Round)</option>
                    <option value="g">Hara (Tested)</option>
                    <option value="p">Gulabi (Kamdhenu)</option>
                    <option value="gr">Grey (W.E.)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lsm-modal-ft">
              <div className="lsm-modal-tot-display">
                Row Total: <b>{f3(currentModalRowTotal)}</b>
              </div>
              {formErr && <div className="lsm-error-msg">⚠️ {formErr}</div>}
              {curCoord.r < 0 && (
                <button
                  type="button"
                  className="lsm-btn"
                  onClick={() => {
                    if (saveForm()) openForm(curCoord.b, -1);
                  }}
                >
                  Save &amp; Agli Entry
                </button>
              )}
              <button
                type="button"
                className="lsm-btn pri"
                onClick={() => {
                  if (saveForm()) setIsModalOpen(false);
                }}
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
