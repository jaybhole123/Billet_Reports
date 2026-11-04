import React, { useState, useMemo, useRef, useEffect } from 'react';
import DateNavigator from '../components/DateNavigator';
import './NormalMaterialPurchase.css';

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

function R(date, mat, disp, party, qty, rate, recd, bal, brk, fr, rem, hl) {
  return {
    date: date,
    mat: mat,
    disp: disp,
    party: party,
    qty: qty,
    rate: rate,
    recd: recd,
    bal: bal,
    brk: brk,
    fr: fr,
    rem: rem || '',
    hl: !!hl,
  };
}

function getInitialData() {
  const A = 'Ms.Billet(125*125)';
  const B = 'Ms.Billet(160*160)';
  const C = 'Ms.Billet(200*160)';
  const C2 = 'Ms. Billet (200*160)';
  const D = 'Ms. Billet (125*125)';
  const JB = 'Jai Bhole Traders';
  const NA = 'Nitesh Agrawal';
  const KK = 'Kanuj Khanna';
  const HC = 'Hindustan Coil Ltd.';

  const bl = [];
  bl.push({
    kind: 'NORMAL',
    label: 'Billet 125*125',
    printed: [2844, 1467.03, 1376.97],
    rows: [
      R('19.08.26', A, 'Prakash Ind.', 'T. I. Traders', '300.000', '40000', '293.760', '6.240', NA, 'For', "3-4 Day's Rtgs"),
      R('24.08.26', A, 'Sourabh Rolling Mill / Vraj Iron', JB, '200.000', '41200', '144.720', '55.280', 'Ashok Toshniwal', 'For', "15 Day's", 1),
      R('26.08.26', A, 'Vishwageeta / sourabh Rolling', JB, '200.000', '41500', '186.760', '13.240', NA, 'For', "15 Day's"),
      R('14.10.26', A, 'Maurvi Ispat', 'Four corners ispat', '400.000', '45000', '388.630', '11.370', 'Direct', 'For', "15 Day's"),
      R('21.10.26', A, 'Vishwageeta / Mourvi ispat', JB, '944.000', '45000', '318.350', '625.650', 'Direct', 'For', 'Next Day (600-vishwageeta/144-morvi/200-Dadu supplire)'),
      R('24.10.26', A, 'Ars Trading (Prakash Material)', JB, '200.000', '44700', '134.810', '65.190', NA, 'For', "15 Day's"),
      R('24.10.26', A, 'Ritesh Goyal', JB, '200.000', '44400', '0.000', '200.000', NA, 'For', "15 Day's"),
      R('26.10.26', A, 'Prakash Ind.', JB, '200.000', '44100', '0.000', '200.000', 'Amit Rajpuria', 'For', "15 Day's"),
      R('26.10.26', A, 'Kalindi Ispat', JB, '200.000', '44100', '0.000', '200.000', NA, 'For', "15 Day's"),
    ],
  });
  bl.push({
    kind: 'NORMAL',
    label: 'Billet 160*160',
    printed: [1800, 1240.25, 559.75],
    rows: [
      R('09.09.26', 'Ms.Billet(160*160)/(125*125)', 'Direct', 'Hindustan Iron', '400.000', '42800', '286.000', '114.000', 'Direct', '150', 'next day (6 Mtr)'),
      R('15.10.26', B, 'Direct', HC, '300.000', '44000', '234.170', '65.830', 'Direct', 'For', 'Next Day'),
      R('17.10.26', B, 'Direct', HC, '500.000', '44000', '487.970', '12.030', 'Direct', 'For', 'Next Day'),
      R('17.10.26', B, 'Direct', HC, '500.000', '44000', '169.950', '330.050', 'Direct', 'For', 'Next Day'),
      R('19.10.26', B, 'Direct', HC, '100.000', '44200', '62.160', '37.840', 'Direct', '160', 'Next Day'),
    ],
  });
  bl.push({
    kind: 'NORMAL',
    label: 'Billet 200*160',
    printed: [1400, 441.55, 958.45],
    rows: [
      R('03.10.26', C, 'Direct', 'BR Steel', '350.000', '46450', '343.870', '6.130', NA, '750', 'next day (6 Mtr) (EX PLANT RATE 45700+750)46450 FOR RATE'),
      R('21.10.26', C2, 'BR Steel', 'BR Steel', '200.000', '44800', '0.000', '200.000', KK, 'FOR', 'Next Day'),
      R('21.10.26', C2, 'BR Steel', 'BR Steel', '200.000', '44800', '0.000', '200.000', NA, '700', 'Next Day (Ex plant rate - 44100 + 700 freight  (44800 FOR)'),
      R('21.10.26', C2, 'Direct', 'BR Steel', '150.000', '44900', '0.000', '150.000', KK, '700', 'Next Day (44200+700 Freight) 44900 FOR RATE'),
      R('23.10.26', C2, 'Direct', 'Shri Balaji Steel', '200.000', '44400', '97.680', '102.320', KK, '380', 'Next Day (Ex plant - 44020 +380 Freight pmt)'),
      R('26-10-26', C2, 'Direct', 'Shri Balaji Steel', '300.000', '43700', '0.000', '300.000', KK, 'FOR', 'Next Day 5% Short Lengh (-600)'),
    ],
  });
  bl.push({
    kind: 'TESTED',
    label: 'Billet 125*125(Tested)',
    printed: [375, 301.21, 73.79],
    rows: [
      R('09.09.26', D, 'Direct', 'Hindustan Iron', '175.000', '45500', '110.540', '64.460', 'Direct', '150', 'Next Day'),
      R('19-10-26', D, 'Direct', 'Hindustan Iron', '200.000', '46300', '190.670', '9.330', 'Direct', '160', 'Next Day'),
    ],
  });
  bl.push({
    kind: 'TESTED',
    label: 'Billet 200*160(Tested)',
    printed: [1586, 1257.53, 328.47],
    rows: [
      R('14.07.26', 'Ms.Billet(200*160)', 'Vaswani Industries', JB, '500.000', '40811', '480.490', '19.510', KK, '160', "15 Day's (6.76/3.98 Mtr.)"),
      R('10.08.26', 'Ms.Billet(200*160)', 'Direct', 'Vaswani Industries', '500.000', '40711', '443.240', '56.760', KK, '160', '4 Days(5% Short Lenth)'),
      R('10.08.26', 'Ms.Billet(200*160)', 'Vaswani Industries', JB, '500.000', '41011', '333.800', '166.200', KK, '160', "15 Day's (5% Short Lenth)"),
      R('12.08.26', 'Ms.Billet(200*160)', 'Vaswani Industries', JB, '86.000', '40711', '0.000', '86.000', KK, '160', "15 Day's"),
    ],
  });

  return {
    prev: '26-10-2026',
    asOn: '27-10-2026',
    blocks: bl.map((b) => ({
      kind: b.kind,
      label: b.label,
      rows: b.rows,
      printed: null,
    })),
  };
}

function sums(rows) {
  const o = { qty: 0, recd: 0, bal: 0 };
  rows.forEach((r) => {
    o.qty += num(r.qty);
    o.recd += num(r.recd);
    o.bal += num(r.bal);
  });
  return o;
}

function rowBad(r) {
  return has(r.qty) && has(r.bal) && Math.abs(num(r.bal) - (num(r.qty) - num(r.recd))) > 0.002;
}

function dstr(iso) {
  if (!iso) return '';
  const a = iso.split('-');
  return a[2] + '.' + a[1] + '.' + a[0].slice(2);
}

function diso(s) {
  const m = /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})$/.exec(String(s).trim());
  if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  const p = (n) => ('0' + n).slice(-2);
  return y + '-' + p(m[2]) + '-' + p(m[1]);
}

function labelFor(mat, kind) {
  const m = /\((\d+)\s*\*\s*(\d+)\)/.exec(mat);
  return m
    ? 'Billet ' + m[1] + '*' + m[2] + (kind === 'TESTED' ? '(Tested)' : '')
    : cv(mat) || 'Block';
}

export default function NormalMaterialPurchase() {
  const [purchaseState, setPurchaseState] = useState(() => {
    try {
      const isCleared = localStorage.getItem('nmp_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('material_purchase');
        localStorage.setItem('nmp_cleared_v1', 'true');
        return {
          date: new Date().toISOString().slice(0, 10),
          blocks: [],
        };
      }
      const saved = localStorage.getItem('material_purchase');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.blocks) return parsed;
      }
    } catch {}
    return {
      date: new Date().toISOString().slice(0, 10),
      blocks: [],
    };
  });

  const [searchQ, setSearchQ] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);
  const [message, setMessage] = useState({ text: '', isErr: false });
  const [isDragOver, setIsDragOver] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curCoord, setCurCoord] = useState({ b: -1, r: -1 });
  const [formErr, setFormErr] = useState('');
  const [autoBal, setAutoBal] = useState(true);
  const [formFields, setFormFields] = useState({
    date: '',
    mat: '',
    disp: '',
    party: '',
    qty: '',
    rate: '',
    recd: '',
    bal: '',
    brk: '',
    fr: '',
    rem: '',
    hl: false,
    blk: '0',
    kind: 'NORMAL',
    lbl: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const origDateRef = useRef('');
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
      purchaseState.blocks.length &&
      !window.confirm('Abhi ka data hat kar image ka data aayega. Aage badhun?')
    ) {
      return;
    }

    const PROMPT_PURCHASE =
      'Ye ek steel billets ki "NORMAL / TESTED MATERIAL PURCHASE" sheet ki image hai. Poori table upar se neeche tak exactly extract karo, koi row mat chhodo.\n' +
      'Columns: DATE, MATERIAL, DISPATCH FROM, PARTY NAME, QTY. IN MT., RATE, QTY RECD. TILL DATE, BALANCE IN MT., Brokers, Freight, Remark\'s.\n' +
      'Output SIRF valid JSON: {"prev":"26-10-2026","asOn":"27-10-2026","blocks":[{"kind":"NORMAL","label":"Billet 125*125","rows":[["date","material","dispatch","party","qty","rate","recd","balance","broker","freight","remark",0]]}]}';

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
                    { type: 'text', text: PROMPT_PURCHASE },
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
              kind: /tested/i.test(b.kind) ? 'TESTED' : 'NORMAL',
              label: cv(b.label) || 'Block',
              printed: null,
              rows: b.rows.map((a) => ({
                date: cv(a[0]),
                mat: cv(a[1]),
                disp: cv(a[2]),
                party: cv(a[3]),
                qty: cv(a[4]),
                rate: cv(a[5]),
                recd: cv(a[6]),
                bal: cv(a[7]),
                brk: cv(a[8]),
                fr: cv(a[9]),
                rem: cv(a[10]),
                hl: +a[11] === 1,
              })),
            }));

            updateState({
              prev: cv(parsed.prev) || purchaseState.prev,
              asOn: cv(parsed.asOn) || purchaseState.asOn,
              blocks: newBl,
            });
            showMsg('Image se purchase data safalta-poorvak load ho gaya.');
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
      localStorage.setItem('material_purchase', JSON.stringify(data));
    } catch {}
  };

  const updateState = (updater) => {
    setPurchaseState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(next);
      return next;
    });
  };

  // KPI Calculations
  const grandTotal = { qty: 0, recd: 0, bal: 0 };
  let totalRows = 0;
  purchaseState.blocks.forEach((bl) => {
    totalRows += bl.rows.length;
    const s = sums(bl.rows);
    grandTotal.qty += s.qty;
    grandTotal.recd += s.recd;
    grandTotal.bal += s.bal;
  });

  // Filtered rows
  const passFilter = (r) => {
    const q = searchQ.trim().toLowerCase();
    if (onlyPending && !(num(r.bal) > 0.0005)) return false;
    if (!q) return true;
    const text = [r.date, r.mat, r.disp, r.party, r.brk, r.fr, r.rem, r.qty, r.rate]
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  };

  // Open Form Modal
  const openForm = (bi, ri) => {
    setCurCoord({ b: bi, r: ri });
    setFormErr('');

    const r = ri >= 0 && purchaseState.blocks[bi] ? purchaseState.blocks[bi].rows[ri] : null;
    origDateRef.current = r ? r.date : '';

    let initDate = '';
    let initMat = '';
    let initParty = '';
    if (!r) {
      const d = new Date();
      const p = (n) => ('0' + n).slice(-2);
      initDate = p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2);
      const bl = purchaseState.blocks[bi];
      if (bl && bl.rows.length) {
        initMat = bl.rows[bl.rows.length - 1].mat;
        initParty = bl.rows[bl.rows.length - 1].party;
      }
    }

    const v = r || {
      date: initDate,
      mat: initMat,
      disp: '',
      party: initParty,
      qty: '',
      rate: '',
      recd: '',
      bal: '',
      brk: '',
      fr: '',
      rem: '',
      hl: false,
    };

    const targetBlk = bi >= 0 && purchaseState.blocks[bi] ? String(bi) : purchaseState.blocks.length ? '0' : 'new';
    const isAuto = r ? !has(r.bal) || Math.abs(num(r.bal) - (num(r.qty) - num(r.recd))) < 0.0005 : true;

    setAutoBal(isAuto);
    setFormFields({
      date: diso(v.date),
      mat: v.mat,
      disp: v.disp,
      party: v.party,
      qty: v.qty,
      rate: v.rate,
      recd: v.recd,
      bal: v.bal,
      brk: v.brk,
      fr: v.fr,
      rem: v.rem,
      hl: !!v.hl,
      blk: targetBlk,
      kind: 'NORMAL',
      lbl: '',
    });

    setIsModalOpen(true);
  };

  const handleFormFieldChange = (field, value) => {
    setFormFields((prev) => {
      const updated = { ...prev, [field]: value };
      if (autoBal && (field === 'qty' || field === 'recd')) {
        const q = num(updated.qty);
        const r = num(updated.recd);
        updated.bal = has(updated.qty) || has(updated.recd) ? f3(q - r) : '';
      }
      return updated;
    });
  };

  const saveForm = () => {
    if (!formFields.party.trim() && !formFields.mat.trim()) {
      setFormErr('Party Name ya Material bharein.');
      return false;
    }

    const badField = ['qty', 'rate', 'recd', 'bal'].find(
      (k) => has(formFields[k]) && isNaN(parseFloat(String(formFields[k]).replace(/,/g, '')))
    );
    if (badField) {
      setFormErr('Kripya sirf sankhya (numbers) likhein.');
      return false;
    }

    const date = formFields.date ? dstr(formFields.date) : origDateRef.current;
    let rate = formFields.rate.trim();
    if (rate !== '') {
      const n = num(rate);
      rate = Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : String(n);
    }

    const row = {
      date: date,
      mat: formFields.mat.trim(),
      disp: formFields.disp.trim(),
      party: formFields.party.trim(),
      qty: has(formFields.qty) ? f3(num(formFields.qty)) : '',
      rate: rate,
      recd: has(formFields.recd) ? f3(num(formFields.recd)) : '',
      bal: has(formFields.bal) ? f3(num(formFields.bal)) : '',
      brk: formFields.brk.trim(),
      fr: formFields.fr.trim(),
      rem: formFields.rem.trim(),
      hl: formFields.hl,
    };

    const sel = formFields.blk;
    let target = sel === 'new' || isNaN(+sel) ? -1 : +sel;

    updateState((prev) => {
      const newBlocks = (prev.blocks || []).map((b) => ({ ...b, rows: [...(b.rows || [])] }));

      if (target < 0 || !newBlocks[target]) {
        const kind = formFields.kind || 'NORMAL';
        newBlocks.push({
          kind: kind,
          label: formFields.lbl.trim() || labelFor(row.mat, kind),
          rows: [],
          printed: null,
        });
        target = newBlocks.length - 1;
      }

      if (curCoord.r >= 0 && curCoord.b >= 0 && newBlocks[curCoord.b]) {
        const oldB = newBlocks[curCoord.b];
        if (target === curCoord.b) {
          oldB.rows[curCoord.r] = row;
          oldB.printed = null;
        } else {
          oldB.rows.splice(curCoord.r, 1);
          oldB.printed = null;
          if (newBlocks[target]) {
            newBlocks[target].rows.push(row);
            newBlocks[target].printed = null;
          }
        }
      } else {
        if (newBlocks[target]) {
          newBlocks[target].rows.push(row);
          newBlocks[target].printed = null;
        }
      }

      const filtered = newBlocks.filter((b) => b && b.rows && b.rows.length > 0);
      return { ...prev, blocks: filtered };
    });

    showMsg('Entry safalta-poorvak save ho gayi.');
    return true;
  };

  const handleDeleteRow = (bi, ri) => {
    const row = purchaseState.blocks[bi]?.rows[ri];
    if (!row) return;
    if (!window.confirm(`Ye row delete karein?\n${row.date}  ${row.party}  ${row.qty}`)) return;

    updateState((prev) => {
      const newBlocks = prev.blocks.map((b) => ({ ...b, rows: [...b.rows] }));
      newBlocks[bi].rows.splice(ri, 1);
      newBlocks[bi].printed = null;
      const filtered = newBlocks.filter((b) => b.rows.length > 0);
      return { ...prev, blocks: filtered };
    });

    showMsg('Row delete ho gayi.');
  };

  const handleEditBlockLabel = (bi) => {
    const bl = purchaseState.blocks[bi];
    if (!bl) return;
    const n = window.prompt('Block ka naam (Total row me dikhega):', bl.label);
    if (n && n.trim()) {
      updateState((prev) => {
        const newBlocks = prev.blocks.map((b, idx) => (idx === bi ? { ...b, label: n.trim(), printed: null } : b));
        return { ...prev, blocks: newBlocks };
      });
      showMsg('Block ka naam badal diya gaya.');
    }
  };

  const handleDeleteBlock = (bi) => {
    const bl = purchaseState.blocks[bi];
    if (!bl) return;
    if (window.confirm(`"${bl.label}" ka poora block (${bl.rows.length} rows) delete karein?`)) {
      updateState((prev) => {
        const newBlocks = prev.blocks.filter((_, idx) => idx !== bi);
        return { ...prev, blocks: newBlocks };
      });
      showMsg('Block hata diya gaya.');
    }
  };

  // Excel Read
  const handleReadExcel = (file) => {
    if (!file) return;
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('Excel library load nahi hui.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });

        // Basic import logic
        let M = null;
        const blocks = [];
        let cur = null;
        let count = 0;

        for (let k = 0; k < aoa.length; k++) {
          const row = aoa[k];
          if (!row || !row.some(has)) continue;
          const first = norm(row[0]);
          if (first === 'date' && row.some((c) => /material/.test(norm(c)))) {
            M = {};
            row.forEach((c, i) => {
              const n = norm(c);
              if (n === 'date') M.date = i;
              else if (/material/.test(n)) M.mat = i;
              else if (/dispatch/.test(n)) M.disp = i;
              else if (/party/.test(n)) M.party = i;
              else if (/recd|received/.test(n)) M.recd = i;
              else if (/balance/.test(n)) M.bal = i;
              else if (/^qty/.test(n)) M.qty = i;
              else if (n === 'rate') M.rate = i;
              else if (/broker/.test(n)) M.brk = i;
              else if (/freight/.test(n)) M.fr = i;
              else if (/remark/.test(n)) M.rem = i;
            });
            cur = null;
            continue;
          }
          if (!M) continue;
          const party = cv(row[M.party]);
          const qtyVal = row[M.qty];
          if (!party && !has(qtyVal)) continue;

          const mat = cv(row[M.mat]);
          if (!cur) {
            cur = { kind: 'NORMAL', label: labelFor(mat, 'NORMAL'), rows: [], printed: null };
            blocks.push(cur);
          }

          cur.rows.push({
            date: cv(row[M.date == null ? 0 : M.date]),
            mat: mat,
            disp: cv(row[M.disp]),
            party: party,
            qty: has(qtyVal) ? f3(num(qtyVal)) : '',
            rate: cv(row[M.rate]),
            recd: has(row[M.recd]) ? f3(num(row[M.recd])) : '',
            bal: has(row[M.bal]) ? f3(num(row[M.bal])) : '',
            brk: cv(row[M.brk]),
            fr: cv(row[M.fr]),
            rem: cv(row[M.rem]),
            hl: false,
          });
          count++;
        }

        if (count) {
          updateState((prev) => ({ ...prev, blocks: blocks.filter((b) => b.rows.length) }));
          showMsg(`${file.name}: ${count} rows load ho gayin.`);
        } else {
          showMsg('Excel me valid data nahi mila.', true);
        }
      } catch (err) {
        showMsg('File error: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Autocomplete Datalist items
  const uniqueLists = useMemo(() => {
    const matSet = new Set();
    const dispSet = new Set();
    const partySet = new Set();
    const brkSet = new Set();

    purchaseState.blocks.forEach((b) => {
      b.rows.forEach((r) => {
        if (r.mat) matSet.add(r.mat);
        if (r.disp) dispSet.add(r.disp);
        if (r.party) partySet.add(r.party);
        if (r.brk) brkSet.add(r.brk);
      });
    });

    return {
      mat: Array.from(matSet).sort(),
      disp: Array.from(dispSet).sort(),
      party: Array.from(partySet).sort(),
      brk: Array.from(brkSet).sort(),
    };
  }, [purchaseState]);

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
  }, [isModalOpen, purchaseState]);

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
        showMsg('Kripya valid Excel ya Image file drop karein.', true);
      }
    }
  };

  return (
    <div
      className={`nmp-page-container ${isDragOver ? 'global-drag-active' : ''}`}
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
      {/* Top Page Header */}
      <div className="nmp-page-header">
        <div>
          <h2>Material Purchase (Billets)</h2>
          <p>Normal &amp; tested raw material procurement, dispatch tracking aur balance records</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="nmp-kpi-grid">
        <div className="nmp-kpi-card highlight">
          <div className="nmp-kpi-label">Kul Rows &amp; Blocks</div>
          <div className="nmp-kpi-value">{totalRows} Rows</div>
          <div className="nmp-kpi-sub">{purchaseState.blocks.length} Material Groups</div>
        </div>

        <div className="nmp-kpi-card">
          <div className="nmp-kpi-label">Total Purchase [Mt]</div>
          <div className="nmp-kpi-value">{f3(grandTotal.qty)}</div>
          <div className="nmp-kpi-sub">Total Ordered Quantity</div>
        </div>

        <div className="nmp-kpi-card success">
          <div className="nmp-kpi-label">Qty Received [Mt]</div>
          <div className="nmp-kpi-value">{f3(grandTotal.recd)}</div>
          <div className="nmp-kpi-sub">Delivered till date</div>
        </div>

        <div className="nmp-kpi-card warning">
          <div className="nmp-kpi-label">Pending Balance [Mt]</div>
          <div className="nmp-kpi-value">{f3(grandTotal.bal)}</div>
          <div className="nmp-kpi-sub">Remaining Procurement</div>
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

      {/* Actions Toolbar in a Single Clean Row */}
      <div className="nmp-toolbar-card">
        <div className="nmp-toolbar-left">
          <button
            type="button"
            className="nmp-btn pri"
            onClick={() => openForm(purchaseState.blocks.length ? purchaseState.blocks.length - 1 : -1, -1)}
          >
            + New Entry
          </button>

          <button
            type="button"
            className="nmp-btn danger-outline"
            onClick={() => {
              if (window.confirm('Saara purchase data hata dein?')) {
                updateState({ ...purchaseState, blocks: [] });
                showMsg('Clear All Data');
              }
            }}
          >
            Clear Data
          </button>
        </div>

        <div className="nmp-toolbar-left">
          <DateNavigator
            value={purchaseState.date || new Date().toISOString().slice(0, 10)}
            onChange={(d) => updateState({ ...purchaseState, date: d, asOn: d })}
          />

          <div className="nmp-search-box">
            <span className="nmp-search-icon">🔍</span>
            <input
              type="search"
              placeholder="Party, broker, material, remark..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>

          <label className="nmp-checkbox-label">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />
            Sirf Pending (Balance &gt; 0)
          </label>
        </div>
      </div>

      {/* Status Alert Banner */}
      {message.text && (
        <div>
          <div className={`nmp-status-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="nmp-table-card">
        <div
          className={`nmp-scroll-wrap ${isDragOver ? 'over' : ''}`}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleReadExcel(e.dataTransfer.files[0]);
            }
          }}
        >
          <table className="nmp-table-main" id="nmp-data-table">
            <tbody>
              {purchaseState.blocks.length > 0 ? (
                purchaseState.blocks.map((bl, bi) => {
                  const prevKind = bi > 0 ? purchaseState.blocks[bi - 1].kind : null;
                  const isNewKind = bl.kind !== prevKind;
                  const s = sums(bl.rows);
                  const visibleRows = bl.rows.filter(passFilter);

                  return (
                    <React.Fragment key={bi}>
                      {/* Band Header if section type changes */}
                      {isNewKind && (
                        <tr className="band">
                          {bl.kind === 'NORMAL' && bi === 0 ? (
                            <>
                              <td colSpan={2} className="s">
                                Previous Date:
                                <br />
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  className="nmp-date-editable"
                                  onBlur={(e) =>
                                    updateState({ ...purchaseState, prev: e.target.textContent })
                                  }
                                >
                                  {purchaseState.prev}
                                </span>
                              </td>
                              <td colSpan={4}>NORMAL MATERIAL PURCHASE</td>
                              <td colSpan={2} className="s">
                                As On Date:
                                <br />
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  className="nmp-date-editable"
                                  onBlur={(e) =>
                                    updateState({ ...purchaseState, asOn: e.target.textContent })
                                  }
                                >
                                  {purchaseState.asOn}
                                </span>
                              </td>
                              <td colSpan={3} />
                              <td className="act" />
                            </>
                          ) : (
                            <>
                              <td colSpan={2} />
                              <td colSpan={4}>
                                {bl.kind === 'TESTED' ? 'TESTED' : 'NORMAL'} MATERIAL PURCHASE
                              </td>
                              <td colSpan={6} />
                            </>
                          )}
                        </tr>
                      )}

                      {/* Column Header Row */}
                      <tr className="hdr">
                        <th style={{ width: '85px' }}>DATE</th>
                        <th style={{ minWidth: '160px' }}>
                          MATERIAL {bl.kind === 'TESTED' ? 'TESTED' : 'NORMAL'}
                        </th>
                        <th style={{ minWidth: '150px' }}>DISPATCH FROM</th>
                        <th style={{ minWidth: '160px' }}>PARTY NAME</th>
                        <th style={{ width: '90px' }}>QTY. IN MT.</th>
                        <th style={{ width: '80px' }}>RATE</th>
                        <th style={{ width: '95px' }}>QTY RECD. TILL DATE</th>
                        <th style={{ width: '95px' }}>BALANCE IN MT.</th>
                        <th style={{ width: '120px' }}>Brokers</th>
                        <th style={{ width: '75px' }}>Freight</th>
                        <th style={{ minWidth: '180px' }}>Remark's</th>
                        <th className="act" style={{ width: '85px' }}>
                          Action
                        </th>
                      </tr>

                      {/* Row Entries */}
                      {visibleRows.map((r, ri) => {
                        const origIdx = bl.rows.indexOf(r);
                        const isBad = rowBad(r);
                        return (
                          <tr
                            key={ri}
                            className={`d ${isBad ? 'chk' : ''}`}
                            title={isBad ? 'Balance ≠ Qty − Qty Recd' : undefined}
                          >
                            <td className="c">{r.date}</td>
                            <td>{r.mat}</td>
                            <td className="w">{r.disp}</td>
                            <td style={{ fontWeight: 600 }}>{r.party}</td>
                            <td className={`n ${r.hl ? 'hl' : ''}`}>{r.qty}</td>
                            <td className="n">{r.rate}</td>
                            <td className="r">{r.recd}</td>
                            <td className="r" style={{ fontWeight: 600, color: num(r.bal) > 0 ? '#b91c1c' : '#15803d' }}>
                              {r.bal}
                            </td>
                            <td className="c">{r.brk}</td>
                            <td className="fr">{r.fr}</td>
                            <td className="rem">{r.rem}</td>
                            <td className="act">
                              <div className="nmp-act-group">
                                <button
                                  type="button"
                                  className="nmp-icon-btn"
                                  title="Row Update Karein"
                                  onClick={() => openForm(bi, origIdx)}
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="nmp-icon-btn del"
                                  title="Row Delete Karein"
                                  onClick={() => handleDeleteRow(bi, origIdx)}
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Subtotal Row */}
                      <tr className="tot">
                        <td />
                        <td style={{ fontWeight: 700 }}>TOTAL M.S. BILLET PURCHASE</td>
                        <td />
                        <td className="lb">{bl.label}</td>
                        <td className="q n">{f3(s.qty)}</td>
                        <td />
                        <td className="g r">{f3(s.recd)}</td>
                        <td className="b r">{f3(s.bal)}</td>
                        <td />
                        <td />
                        <td className="rem" />
                        <td className="act">
                          <div className="nmp-tot-act-group">
                            <button
                              type="button"
                              className="nmp-sub-btn add-row"
                              title="Nayi row jodein"
                              onClick={() => openForm(bi, -1)}
                            >
                              + Row
                            </button>
                            <button
                              type="button"
                              className="nmp-sub-btn"
                              title="Block ka naam badlein"
                              onClick={() => handleEditBlockLabel(bi)}
                            >
                              Naam
                            </button>
                            <button
                              type="button"
                              className="nmp-sub-btn"
                              style={{ color: '#dc2626' }}
                              title="Block delete karein"
                              onClick={() => handleDeleteBlock(bi)}
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Small visual separator */}
                      <tr className="sep">
                        <td colSpan={12} />
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal Dialog */}
      {isModalOpen && (
        <div className="nmp-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="nmp-modal-box" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="nmp-modal-hd">
              <span>{curCoord.r >= 0 ? '✏️ Row Update Karein' : '➕ Add New Entry'}</span>
              <button
                type="button"
                className="nmp-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="nmp-modal-bd">
              <div className="nmp-grid">
                <div className="w2">
                  <label htmlFor="f_blk">Block</label>
                  <select
                    id="f_blk"
                    value={formFields.blk}
                    onChange={(e) => handleFormFieldChange('blk', e.target.value)}
                  >
                    {purchaseState.blocks.map((b, i) => (
                      <option key={i} value={String(i)}>
                        {b.kind === 'TESTED' ? 'Tested' : 'Normal'} • {b.label} ({b.rows.length} rows)
                      </option>
                    ))}
                    <option value="new">+ Naya Block (Nayi Total Row)</option>
                  </select>
                </div>
              </div>

              {/* If creating a new block */}
              {formFields.blk === 'new' && (
                <div className="nb-box">
                  <div className="nmp-grid" style={{ marginBottom: 0 }}>
                    <div>
                      <label htmlFor="f_kind">Type</label>
                      <select
                        id="f_kind"
                        value={formFields.kind}
                        onChange={(e) => handleFormFieldChange('kind', e.target.value)}
                      >
                        <option value="NORMAL">Normal Material Purchase</option>
                        <option value="TESTED">Tested Material Purchase</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="f_lbl">Total Row Ka Naam</label>
                      <input
                        type="text"
                        id="f_lbl"
                        placeholder="e.g. Billet 125*125"
                        value={formFields.lbl}
                        onChange={(e) => handleFormFieldChange('lbl', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="nmp-grid">
                <div>
                  <label htmlFor="f_date">Date</label>
                  <input
                    type="date"
                    id="f_date"
                    value={formFields.date}
                    onChange={(e) => handleFormFieldChange('date', e.target.value)}
                  />
                </div>
                <div className="w2">
                  <label htmlFor="f_mat">Material</label>
                  <input
                    type="text"
                    id="f_mat"
                    list="l_mat"
                    autoComplete="off"
                    placeholder="Ms.Billet(125*125)"
                    value={formFields.mat}
                    onChange={(e) => handleFormFieldChange('mat', e.target.value)}
                  />
                  <datalist id="l_mat">
                    {uniqueLists.mat.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <div className="w2">
                  <label htmlFor="f_disp">Dispatch From</label>
                  <input
                    type="text"
                    id="f_disp"
                    list="l_disp"
                    autoComplete="off"
                    value={formFields.disp}
                    onChange={(e) => handleFormFieldChange('disp', e.target.value)}
                  />
                  <datalist id="l_disp">
                    {uniqueLists.disp.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                <div className="w2">
                  <label htmlFor="f_party">Party Name</label>
                  <input
                    type="text"
                    id="f_party"
                    list="l_party"
                    autoComplete="off"
                    value={formFields.party}
                    onChange={(e) => handleFormFieldChange('party', e.target.value)}
                  />
                  <datalist id="l_party">
                    {uniqueLists.party.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="f_qty">Qty in Mt.</label>
                  <input
                    type="text"
                    className="num"
                    id="f_qty"
                    inputMode="decimal"
                    value={formFields.qty}
                    onChange={(e) => handleFormFieldChange('qty', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_rate">Rate</label>
                  <input
                    type="text"
                    className="num"
                    id="f_rate"
                    inputMode="decimal"
                    value={formFields.rate}
                    onChange={(e) => handleFormFieldChange('rate', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_recd">Qty Recd. Till Date</label>
                  <input
                    type="text"
                    className="num"
                    id="f_recd"
                    inputMode="decimal"
                    value={formFields.recd}
                    onChange={(e) => handleFormFieldChange('recd', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_bal">
                    Balance in Mt.{' '}
                    <span style={{ fontWeight: 400, marginLeft: '6px' }}>
                      <input
                        type="checkbox"
                        id="a_bal"
                        checked={autoBal}
                        onChange={(e) => setAutoBal(e.target.checked)}
                      />{' '}
                      auto = Qty − Recd
                    </span>
                  </label>
                  <input
                    type="text"
                    className="num"
                    id="f_bal"
                    inputMode="decimal"
                    readOnly={autoBal}
                    value={formFields.bal}
                    onChange={(e) => handleFormFieldChange('bal', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_brk">Broker</label>
                  <input
                    type="text"
                    id="f_brk"
                    list="l_brk"
                    autoComplete="off"
                    value={formFields.brk}
                    onChange={(e) => handleFormFieldChange('brk', e.target.value)}
                  />
                  <datalist id="l_brk">
                    {uniqueLists.brk.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="f_fr">Freight</label>
                  <input
                    type="text"
                    id="f_fr"
                    list="l_fr"
                    autoComplete="off"
                    placeholder="For ya 700"
                    value={formFields.fr}
                    onChange={(e) => handleFormFieldChange('fr', e.target.value)}
                  />
                  <datalist id="l_fr">
                    <option value="For" />
                    <option value="Direct" />
                  </datalist>
                </div>
                <div className="w2">
                  <label htmlFor="f_rem">Remark</label>
                  <input
                    type="text"
                    id="f_rem"
                    autoComplete="off"
                    placeholder="15 Day's"
                    value={formFields.rem}
                    onChange={(e) => handleFormFieldChange('rem', e.target.value)}
                  />
                </div>
              </div>

              <label className="ck">
                <input
                  type="checkbox"
                  checked={formFields.hl}
                  onChange={(e) => handleFormFieldChange('hl', e.target.checked)}
                />
                Qty cell ko yellow highlight karein
              </label>
            </div>

            <div className="nmp-modal-ft">
              {formErr && <div className="nmp-error-msg">⚠️ {formErr}</div>}
              {curCoord.r < 0 && (
                <button
                  type="button"
                  className="nmp-btn"
                  onClick={() => {
                    if (saveForm()) openForm(curCoord.b, -1);
                  }}
                >
                  Save &amp; Agli Entry
                </button>
              )}
              <button
                type="button"
                className="nmp-btn pri"
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
