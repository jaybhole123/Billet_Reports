import React, { useState, useEffect, useRef } from 'react';
import DateNavigator from '../components/DateNavigator';
import './BilletsStock.css';

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

function pcs(x) {
  return has(x) ? String(Math.round(num(x))) : '';
}

function qty(x) {
  return has(x) ? f3(num(x)) : '';
}

function colorFor(size) {
  return /\(\s*t\s*\)/i.test(size) ? 'g' : /\(\s*(ms|ht|mht)\s*\)/i.test(size) ? 'y' : '';
}

function R(sr, size, len, v, rem, cls, conv) {
  return {
    sr: sr,
    size: size,
    len: len,
    opP: v[0],
    opQ: v[1],
    rcP: v[2],
    rcQ: v[3],
    tot: v[4],
    coP: v[5],
    coQ: v[6],
    clP: v[7],
    clQ: v[8],
    rem: rem || '',
    cls: cls || '',
    conv: !!conv,
  };
}

function sm(p, q) {
  return [p, q, '', '', q, '', '', p, q];
}

function Sr(sr, size, len, p, q, cls) {
  return R(sr, size, len, sm(p, q), '', cls);
}

function getInitialData() {
  const B = [];
  B.push([
    R('1', '125X125', '6.000', ['319', '237.878', '261', '190.800', '282.294', '', '', '381', '282.294'], '199=1.500*4'),
    Sr('', '125X125', '3.350', '30', '12.975'),
    Sr('', '125X125', '3.000', '2', '0.726'),
    Sr('', '125X125', '2.650', '29', '9.714'),
    Sr('', '125X125', '2.000', '551', '127.748'),
    R('', '125X125', '1.500', ['554', '101.881', '796', '146.384', '248.265', '590', '108.501', '760', '139.764'], '', '', true),
    Sr('', '125X125', '1.5-2.5', '10', '3.530'),
  ]);
  B.push([
    Sr('', '125X125 (T)', '6.000', '48', '35.150', 'g'),
    Sr('', '125X125 (T)', '1.500', '2', '0.368', 'g'),
    Sr('', '125X125 (T)', '2.000', '7', '1.716', 'g'),
    Sr('', '125X125 (MS)', '6.000', '28', '20.597', 'y'),
    Sr('', '125X125 (MS)', '1.500', '4', '0.736', 'y'),
    Sr('', '125X125 (MS)', '2.000', '3', '0.736', 'y'),
    Sr('', '125X125 (HT)', '6.000', '30', '22.068', 'y'),
    Sr('', '125X125 (HT)', '2.000', '8', '1.962', 'y'),
  ]);
  const n1 = '160X160 (N)';
  B.push([
    R('3', n1, '6.000', ['204', '247.262', '', '', '193.931', '', '', '160', '193.931'], '44=3.300+2.700'),
    R('', n1, '3.500', ['179', '124.044', '', '', '124.044', '40', '27.860', '139', '96.184']),
    R('', n1, '3.300', ['4', '2.667', '44', '28.895', '31.562', '', '', '48', '31.562'], '', '', true),
    Sr('', n1, '3.250', '80', '51.740'),
    Sr('', n1, '3.100', '297', '185.340'),
    Sr('', n1, '3.000', '78', '46.614'),
    R('', n1, '2.900', ['', '', '29', '16.736', '16.736', '29', '16.736', '0', '0.000'], '', '', true),
    R('', n1, '2.700', ['', '', '44', '23.641', '23.641', '', '', '44', '23.641'], '', '', true),
    Sr('', n1, '2.640', '84', '44.333'),
    R('', n1, '2.500', ['1', '0.607', '6', '2.876', '3.483', '7', '3.483', '0', '0.000'], '', '', true),
    Sr('', n1, '2.400', '264', '126.778'),
    Sr('', n1, '2.300', '92', '42.320'),
    Sr('', n1, '2.150', '106', '45.748'),
    Sr('', n1, '2.000', '7', '9.154'),
    Sr('', n1, '1.700', '84', '29.407'),
    Sr('', n1, '1.600', '45', '14.412'),
    R('', n1, '5.0-7.0', ['443', '519.288', '68', '81.870', '601.158', '', '', '511', '601.158'], '', 'gr'),
    R('', n1, '2.5-3.5', ['1032', '680.370', '61', '43.390', '704.943', '', '', '1093', '704.944'], '', 'gr'),
    R('', n1, '6.0-10.0', ['0', '0.000', '', '', '0.000', '', '', '0', '0.000'], '', 'gr'),
  ]);
  B.push([
    Sr('4', '160X160(T)', '6.000', '64', '77.184', 'g'),
    Sr('', '160X160(T)', '3.150', '1', '0.633', 'g'),
    Sr('', '160X160(T)', '2.150', '4', '1.729', 'g'),
  ]);
  const n2 = '160X200 (N)';
  B.push([
    Sr('5', n2, '7.000', '189', '334.848'),
    R('', n2, '6.800', ['171', '293.920', '163', '275.080', '569.000', '', '', '334', '569.000']),
    Sr('', n2, '6.000', '2', '3.010'),
    Sr('', n2, '5.500', '2', '2.760'),
    R('', n2, '4.000', ['411', '412.644', '', '', '412.644', '302', '303.208', '109', '109.436']),
    Sr('', n2, '5.200', '7', '9.136'),
    Sr('', n2, '3.000', '5', '3.740'),
    Sr('', n2, '2.700', '2', '1.355'),
    Sr('', n2, '2.500', '2', '1.230'),
    Sr('', n2, '2.200', '9', '4.970'),
    R('', n2, '2.000', ['19', '9.538', '', '', '9.538', '6', '3.012', '13', '6.526']),
    Sr('', n2, '1.400', '52', '18.273'),
    Sr('', n2, '1.100', '26', '7.179'),
    Sr('', n2, '1.8-1.9', '31', '14.392'),
    Sr('', n2, '1.5-1.6', '29', '11.144'),
    Sr('', n2, '1.3-1.5', '53', '18.624'),
    Sr('', n2, '1.2-1.3', '42', '15.395'),
  ]);
  B.push([
    R('', '200X160 (T)', '6.800', ['9', '15.361', '', '', '0.000', '', '', '0', '0.000'], '9=3.400*2', 'g'),
    R('', '200X160 (T)', '5.900', ['46', '68.121', '', '', '39.985', '', '', '27', '39.985'], '19=3.400+2.500', 'g'),
    R('', '200X160 (T)', '3.400', ['', '', '37', '31.576', '31.576', '', '', '37', '31.576'], '', 'g', true),
    R('', '200X160 (T)', '2.500', ['32', '20.080', '19', '11.921', '32.001', '', '', '51', '32.001'], '', 'g', true),
    R('', '160X200 (N)', '7.000', sm('11', '19.323'), 'High S%', 'y'),
  ]);
  B.push([
    Sr('6', '200X200', '12.000', '12', '45.216'),
    Sr('', '200X200', '6.000', '5', '9.420'),
    Sr('', '200X200', '4.000', '4', '5.024'),
    Sr('', '200X200', '3.800', '11', '13.125'),
    Sr('', '200X200', '2.700', '11', '9.326'),
    Sr('', '200X200', '2.100', '2', '1.319'),
  ]);
  B.push([
    Sr('7', '200X200 (MS)', '6.000', '30', '56.520', 'y'),
    Sr('', '200X200 (MS)', '3.000', '6', '5.652', 'y'),
    Sr('', '200X200 (HT)', '6.000', '28', '52.752', 'y'),
    Sr('', '200X200 (HT)', '3.000', '10', '9.420', 'y'),
  ]);
  B.push([
    Sr('8', '200X250', '1.530', '4', '2.402'),
    Sr('', '200X250', '3.000', '1', '1.178'),
  ]);

  return {
    date: '26-10-2026',
    blocks: B.map((r) => ({ rows: r, printed: null })),
    gprinted: null,
  };
}

function sumRows(rows) {
  const o = { opQ: 0, rcQ: 0, tot: 0, coQ: 0, clQ: 0 };
  rows.forEach((r) => {
    o.opQ += num(r.opQ);
    if (!r.conv) o.rcQ += num(r.rcQ);
    o.tot += num(r.tot);
    o.coQ += num(r.coQ);
    o.clQ += num(r.clQ);
  });
  return o;
}

function rowBad(r) {
  return has(r.clQ) && has(r.tot) && Math.abs(num(r.clQ) - (num(r.tot) - num(r.coQ))) > 0.0025;
}

const PROMPT =
  'Ye ek steel mill ki "BILLETS STOCK - LSM And MSM" sheet ki image hai. Poori table ko upar se neeche tak exactly extract karo, koi row mat chhodo.\n' +
  'Columns (left se right): Sr.No., Billets Size [mm] (jaise 125X125, 160X160 (N), 125X125 (T), 200X200 (MS)), Length [Mtr] (jaise 6.000 ya range 2.5-3.5), Opening Pcs, Opening Qty, Receiving Pcs, Receiving Qty, Total [Mt], Consumed Pcs, Consumed Qty, Closing Pcs, Closing Qty, Remarks.\n' +
  'Rows "blocks" me hoti hain: har block ke end me ek bold Sub Total row hoti hai (usme Opening Qty, Total aur Closing Qty ke bade bold numbers). Sub Total row ko data row mat banao, uske numbers block ke "sub" me do. Sr.No. sirf block/group ki pehli row me likha hota hai, baaki rows me khali "".\n' +
  'Row ka rang batao: "" = safed, "g" = hara, "y" = peela, "gr" = grey.\n' +
  'conv: Remarks me jaise "199=1.500*4" ya "44=3.300+2.700" likha ho to uska matlab billets kat kar chhoti length bani hain. Wo chhoti lengths ki Receiving entries (jaise 1.500, 3.300, 2.700 wali) conversion hain, unke liye conv=1. Asli purchase/receipt wali Receiving ke liye conv=0.\n' +
  'Har cell ki value image jaisi hi string me likho (3 decimals jaise 282.294), khali cell = "". Kuch andaaza mat lagao.\n' +
  'Neeche last "TOTAL" row ke numbers "grand" me do: [opening qty, receiving qty, total, consumed qty, closing qty].\n' +
  'Output SIRF valid JSON, koi extra text ya backticks nahi: {"blocks":[{"rows":[["sr","size","len","opP","opQ","rcP","rcQ","tot","coP","coQ","clP","clQ","remarks",0,""]],"sub":["opQ","tot","clQ"]}],"grand":["","","","",""]}. Har row me bilkul 15 items: 13 text values, phir conv (0 ya 1), phir rang.';

export default function BilletsStock() {
  const [stockState, setStockState] = useState(() => {
    try {
      const isCleared = localStorage.getItem('billets_cleared_v1');
      if (!isCleared) {
        localStorage.removeItem('billets_stock');
        localStorage.setItem('billets_cleared_v1', 'true');
        return {
          date: new Date().toISOString().slice(0, 10),
          blocks: [],
          gprinted: null,
        };
      }
      const saved = localStorage.getItem('billets_stock');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.blocks) {
          if (parsed.date === '26.10') parsed.date = '26-10-2026';
          return parsed;
        }
      }
    } catch {}
    return {
      date: new Date().toISOString().slice(0, 10),
      blocks: [],
      gprinted: null,
    };
  });

  const [message, setMessage] = useState({ text: '', isErr: false });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curCoord, setCurCoord] = useState({ b: -1, r: -1 });
  const [formFields, setFormFields] = useState({
    sr: '',
    size: '',
    len: '',
    opP: '',
    opQ: '',
    rcP: '',
    rcQ: '',
    tot: '',
    coP: '',
    coQ: '',
    clP: '',
    clQ: '',
    rem: '',
    cls: '',
    conv: false,
    blk: '0',
  });
  const [autoTot, setAutoTot] = useState(true);
  const [autoClP, setAutoClP] = useState(true);
  const [autoClQ, setAutoClQ] = useState(true);
  const [formErr, setFormErr] = useState('');

  const xFileRef = useRef(null);
  const iFileRef = useRef(null);

  const showMsg = (text, isErr = false) => {
    setMessage({ text, isErr });
  };

  const persist = (data) => {
    try {
      localStorage.setItem('billets_stock', JSON.stringify(data));
    } catch {}
  };

  const updateState = (updater) => {
    setStockState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(next);
      return next;
    });
  };

  const grandTotal = { opQ: 0, rcQ: 0, tot: 0, coQ: 0, clQ: 0 };
  let totalRowCount = 0;
  const blockSums = stockState.blocks.map((bl) => {
    totalRowCount += bl.rows.length;
    const s = sumRows(bl.rows);
    grandTotal.opQ += s.opQ;
    grandTotal.rcQ += s.rcQ;
    grandTotal.tot += s.tot;
    grandTotal.coQ += s.coQ;
    grandTotal.clQ += s.clQ;
    return s;
  });

  const openForm = (bi, ri) => {
    setCurCoord({ b: bi, r: ri });
    setFormErr('');

    const row = ri >= 0 && stockState.blocks[bi] ? stockState.blocks[bi].rows[ri] : null;

    let targetBlock = '0';
    if (bi >= 0 && stockState.blocks[bi]) {
      targetBlock = String(bi);
    } else if (stockState.blocks.length) {
      targetBlock = String(stockState.blocks.length - 1);
    } else {
      targetBlock = 'new';
    }

    if (row) {
      const mt = f3(num(row.opQ) + num(row.rcQ));
      const mp = String(Math.round(num(row.opP) + num(row.rcP) - num(row.coP)));
      const mq = f3(num(row.tot) - num(row.coQ));

      setAutoTot(!has(row.tot) || Math.abs(num(row.tot) - num(mt)) < 0.0005);
      setAutoClP(!has(row.clP) || num(row.clP) === num(mp));
      setAutoClQ(!has(row.clQ) || Math.abs(num(row.clQ) - num(mq)) < 0.0005);

      setFormFields({
        sr: row.sr || '',
        size: row.size || '',
        len: row.len || '',
        opP: row.opP || '',
        opQ: row.opQ || '',
        rcP: row.rcP || '',
        rcQ: row.rcQ || '',
        tot: row.tot || '',
        coP: row.coP || '',
        coQ: row.coQ || '',
        clP: row.clP || '',
        clQ: row.clQ || '',
        rem: row.rem || '',
        cls: row.cls || '',
        conv: !!row.conv,
        blk: targetBlock,
      });
    } else {
      setAutoTot(true);
      setAutoClP(true);
      setAutoClQ(true);

      let initialSize = '';
      let initialCls = '';
      if (bi >= 0 && stockState.blocks[bi] && stockState.blocks[bi].rows.length) {
        const last = stockState.blocks[bi].rows[stockState.blocks[bi].rows.length - 1];
        initialSize = last.size;
        initialCls = last.cls;
      }

      setFormFields({
        sr: '',
        size: initialSize,
        len: '',
        opP: '',
        opQ: '',
        rcP: '',
        rcQ: '',
        tot: '',
        coP: '',
        coQ: '',
        clP: '',
        clQ: '',
        rem: '',
        cls: initialCls,
        conv: false,
        blk: targetBlock,
      });
    }

    setIsModalOpen(true);
  };

  const handleFormFieldChange = (field, value) => {
    setFormFields((prev) => {
      const updated = { ...prev, [field]: value };
      const hasAny = (...args) => args.some((k) => has(updated[k]));

      if (autoTot) {
        updated.tot = hasAny('opQ', 'rcQ') ? f3(num(updated.opQ) + num(updated.rcQ)) : '';
      }
      if (autoClP) {
        updated.clP = hasAny('opP', 'rcP', 'coP')
          ? String(Math.round(num(updated.opP) + num(updated.rcP) - num(updated.coP)))
          : '';
      }
      if (autoClQ) {
        updated.clQ = hasAny('tot', 'coQ') ? f3(num(updated.tot) - num(updated.coQ)) : '';
      }

      return updated;
    });
  };

  const validateAndGetRow = () => {
    const size = formFields.size.trim();
    if (!size) {
      setFormErr('Billets Size likho.');
      return null;
    }

    const badField = ['opP', 'rcP', 'coP', 'clP', 'opQ', 'rcQ', 'tot', 'coQ', 'clQ'].find(
      (k) => has(formFields[k]) && isNaN(parseFloat(String(formFields[k]).replace(/,/g, '')))
    );

    if (badField) {
      setFormErr('Kripya sirf sankhya (numbers) likhein.');
      return null;
    }

    let len = formFields.len.trim();
    if (/^\d+(\.\d+)?$/.test(len)) len = f3(num(len));

    return {
      sr: '',
      size: size,
      len: len,
      opP: has(formFields.opP) ? String(Math.round(num(formFields.opP))) : '',
      opQ: has(formFields.opQ) ? f3(num(formFields.opQ)) : '',
      rcP: has(formFields.rcP) ? String(Math.round(num(formFields.rcP))) : '',
      rcQ: has(formFields.rcQ) ? f3(num(formFields.rcQ)) : '',
      tot: has(formFields.tot) ? f3(num(formFields.tot)) : '',
      coP: has(formFields.coP) ? String(Math.round(num(formFields.coP))) : '',
      coQ: has(formFields.coQ) ? f3(num(formFields.coQ)) : '',
      clP: has(formFields.clP) ? String(Math.round(num(formFields.clP))) : '',
      clQ: has(formFields.clQ) ? f3(num(formFields.clQ)) : '',
      rem: formFields.rem.trim(),
      cls: formFields.cls,
      conv: !!formFields.conv,
    };
  };

  const saveForm = () => {
    const row = validateAndGetRow();
    if (!row) return false;

    const sel = formFields.blk;
    const target = sel === 'new' ? -1 : +sel;

    updateState((prev) => {
      const newBlocks = prev.blocks.map((b) => ({ ...b, rows: [...b.rows] }));

      if (curCoord.r >= 0) {
        const oldB = newBlocks[curCoord.b];
        if (target === curCoord.b) {
          oldB.rows[curCoord.r] = row;
          oldB.printed = null;
        } else {
          oldB.rows.splice(curCoord.r, 1);
          oldB.printed = null;
          if (target < 0) {
            newBlocks.push({ rows: [row], printed: null });
          } else {
            newBlocks[target].rows.push(row);
            newBlocks[target].printed = null;
          }
        }
      } else {
        const blk = target < 0 ? null : newBlocks[target];
        if (
          blk &&
          blk.rows.some(
            (r) => norm(r.size) === norm(row.size) && norm(r.len) === norm(row.len)
          ) &&
          !window.confirm(`Is block me "${row.size}  ${row.len}" pehle se hai. Phir bhi jodein?`)
        ) {
          return prev;
        }
        if (blk) {
          blk.rows.push(row);
          blk.printed = null;
        } else {
          newBlocks.push({ rows: [row], printed: null });
        }
      }

      const filtered = newBlocks.filter((b) => b.rows.length > 0);
      return { ...prev, blocks: filtered, gprinted: null };
    });

    showMsg('Entry safalta-poorvak save ho gayi.');
    return true;
  };

  const handleDeleteRow = (bi, ri) => {
    const row = stockState.blocks[bi]?.rows[ri];
    if (!row) return;
    if (!window.confirm(`Ye row delete karein?\n${row.size}  ${row.len}`)) return;

    updateState((prev) => {
      const newBlocks = prev.blocks.map((b) => ({ ...b, rows: [...b.rows] }));
      newBlocks[bi].rows.splice(ri, 1);
      newBlocks[bi].printed = null;
      const filtered = newBlocks.filter((b) => b.rows.length > 0);
      return { ...prev, blocks: filtered, gprinted: null };
    });

    showMsg('Row delete ho gayi.');
  };

  const handleExportTemplate = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      showMsg('Excel library load nahi hui.', true);
      return;
    }

    const HEAD = [
      'Sr.No.',
      'Billets Size [mm]',
      'Length [Mtr]',
      'Opening Pcs',
      'Opening Qty [Mt]',
      'Receiving Pcs',
      'Receiving Qty [Mt]',
      'Total [Mt]',
      'Consumed Pcs',
      'Consumed Qty [Mt]',
      'Closing Pcs',
      'Closing Qty [Mt]',
      'Remarks',
      'Block',
      'Color',
      'Conversion',
    ];

    const CN = { '': '', g: 'Green', y: 'Yellow', gr: 'Grey' };
    const out = [HEAD];

    stockState.blocks.forEach((b, bi) => {
      b.rows.forEach((r) => {
        const N = (x) => (has(x) ? num(x) : '');
        out.push([
          r.sr,
          r.size,
          r.len,
          N(r.opP),
          N(r.opQ),
          N(r.rcP),
          N(r.rcQ),
          N(r.tot),
          N(r.coP),
          N(r.coQ),
          N(r.clP),
          N(r.clQ),
          r.rem,
          bi + 1,
          CN[r.cls] || '',
          r.conv ? 'Y' : '',
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(out);
    ws['!cols'] = [
      { wch: 7 },
      { wch: 18 },
      { wch: 12 },
      ...new Array(9).fill({ wch: 12 }),
      { wch: 22 },
      { wch: 7 },
      { wch: 9 },
      { wch: 11 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Billets');
    XLSX.writeFile(wb, 'Billets-Stock.xlsx');
  };

  const handleExportSheetHtml = () => {
    const t = document.getElementById('billets-data-table');
    if (!t) return;
    const c = t.cloneNode(true);
    c.querySelectorAll('.act').forEach((x) => x.remove());
    const html = `<html><head><meta charset="utf-8"></head><body><table border="1">${c.innerHTML}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Billets-Stock-sheet.xls';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
  };

  const importAOA = (aoa) => {
    let hi = -1;
    let L = -1;
    for (let i = 0; i < Math.min(15, aoa.length) && hi < 0; i++) {
      for (let c = 0; c < aoa[i].length; c++) {
        if (/length/.test(norm(aoa[i][c]))) {
          hi = i;
          L = c;
          break;
        }
      }
    }
    if (hi < 0) {
      throw new Error('Header row nahi mili. "Length [Mtr]" column hona chahiye.');
    }

    const H = aoa[hi];
    const findCol = (rx) => {
      for (let c = 0; c < H.length; c++) if (rx.test(norm(H[c]))) return c;
      return -1;
    };

    let szC = findCol(/size/);
    if (szC < 0) szC = L - 1;
    let srC = findCol(/^(sr|sno|srno)/);
    if (srC < 0) srC = szC - 1;

    let remC = -1;
    for (let d = Math.max(0, hi - 2); d <= Math.min(aoa.length - 1, hi + 1) && remC < 0; d++) {
      for (let c2 = 0; c2 < aoa[d].length; c2++) {
        if (/remark/.test(norm(aoa[d][c2]))) {
          remC = c2;
          break;
        }
      }
    }
    if (remC < 0) remC = L + 10;

    const blkC = findCol(/^block$/);
    const colC = findCol(/^colou?r$/);
    const cnvC = findCol(/^conversion$/);

    const blocks = [];
    let curB = null;
    const keyMap = {};
    let count = 0;

    const endB = () => {
      curB = null;
    };

    for (let k = hi + 1; k < aoa.length; k++) {
      const row = aoa[k];
      if (!row || !row.some((x) => has(x))) continue;
      const sr = cv(row[srC]);
      let size = cv(row[szC]);
      const len = row[L];

      if (/total/i.test(sr + ' ' + size)) {
        endB();
        continue;
      }
      if (!has(size) && !has(len)) {
        endB();
        continue;
      }
      if (!has(size) && blocks.length && curB) {
        size = curB.rows[curB.rows.length - 1].size;
      }
      if (has(sr) && curB && curB.rows.length) endB();

      const key = blkC > -1 && has(row[blkC]) ? 'b' + row[blkC] : null;
      if (key) {
        if (!keyMap[key]) {
          keyMap[key] = { rows: [], printed: null };
          blocks.push(keyMap[key]);
        }
        curB = keyMap[key];
      } else if (!curB) {
        curB = { rows: [], printed: null };
        blocks.push(curB);
      }

      const l = typeof len === 'number' ? f3(len) : cv(len);
      const cname = colC > -1 ? cv(row[colC]).toLowerCase() : '';
      const cls = cname
        ? /gr(e|a)y|^gr$/.test(cname)
          ? 'gr'
          : /green|^g$/.test(cname)
          ? 'g'
          : /yellow|^y$/.test(cname)
          ? 'y'
          : ''
        : colorFor(size);

      curB.rows.push({
        sr: sr,
        size: size,
        len: l,
        opP: pcs(row[L + 1]),
        opQ: qty(row[L + 2]),
        rcP: pcs(row[L + 3]),
        rcQ: qty(row[L + 4]),
        tot: qty(row[L + 5]),
        coP: pcs(row[L + 6]),
        coQ: qty(row[L + 7]),
        clP: pcs(row[L + 8]),
        clQ: qty(row[L + 9]),
        rem: remC > -1 ? cv(row[remC]) : '',
        cls: cls,
        conv: cnvC > -1 && /^(y|yes|1|true)$/i.test(cv(row[cnvC])),
      });
      count++;
    }

    if (!count) throw new Error('File me koi data row nahi mili.');
    return { blocks, count };
  };

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
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        let res = null;
        let lastErr = null;
        for (let i = 0; i < wb.SheetNames.length && !res; i++) {
          try {
            res = importAOA(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]], { header: 1, defval: '', raw: true }));
          } catch (err) {
            lastErr = err;
          }
        }
        if (!res) throw lastErr;
        if (
          stockState.blocks.length &&
          !window.confirm('Abhi ka data hat kar file ka data aayega. Aage badhun?')
        ) {
          return;
        }

        updateState({
          date: stockState.date,
          blocks: res.blocks,
          gprinted: null,
        });

        showMsg(`${file.name}: ${res.count} rows, ${res.blocks.length} blocks safalta-poorvak load hue.`);
      } catch (err) {
        showMsg(err.message, true);
      }
    };
    reader.onerror = () => showMsg('File open nahi ho saki.', true);
    reader.readAsArrayBuffer(file);
  };

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

  const applyImageResult = (j) => {
    if (!j || !j.blocks || !j.blocks.length) throw new Error('Image se rows nahi mili.');
    const bl = j.blocks.map((b) => ({
      rows: b.rows.map((a) => {
        const size = cv(a[1]);
        const cls = a[14] != null && /^(g|y|gr)$/.test(a[14]) ? a[14] : colorFor(size);
        return {
          sr: cv(a[0]),
          size: size,
          len: cv(a[2]),
          opP: pcs(a[3]),
          opQ: qty(a[4]),
          rcP: pcs(a[5]),
          rcQ: qty(a[6]),
          tot: qty(a[7]),
          coP: pcs(a[8]),
          coQ: qty(a[9]),
          clP: pcs(a[10]),
          clQ: qty(a[11]),
          rem: cv(a[12]),
          cls: cls,
          conv: +a[13] === 1,
        };
      }),
      printed:
        b.sub && b.sub.length >= 3
          ? { opQ: qty(b.sub[0]), tot: qty(b.sub[1]), clQ: qty(b.sub[2]) }
          : null,
    }));

    const gprinted =
      j.grand && j.grand.length >= 5
        ? {
            opQ: qty(j.grand[0]),
            rcQ: qty(j.grand[1]),
            tot: qty(j.grand[2]),
            coQ: qty(j.grand[3]),
            clQ: qty(j.grand[4]),
          }
        : null;

    updateState({
      date: stockState.date,
      blocks: bl,
      gprinted,
    });

    let rowCount = 0;
    let badB = 0;
    let badR = 0;
    bl.forEach((b) => {
      rowCount += b.rows.length;
      b.rows.forEach((r) => {
        if (rowBad(r)) badR++;
      });
      if (b.printed) {
        const s = sumRows(b.rows);
        if (['opQ', 'tot', 'clQ'].some((k) => has(b.printed[k]) && Math.abs(num(b.printed[k]) - s[k]) > 0.002)) {
          badB++;
        }
      }
    });

    let m = `${rowCount} rows, ${bl.length} blocks mili. `;
    m += badB ? `${badB} block ka Sub Total image se match nahi karta (⚠), ` : 'Saare Sub Total image se match hain. ';
    m += badR ? `${badR} rows laal hain, kripya check karein.` : 'Row checks theek hain.';
    showMsg(m, badB > 0 || badR > 0);
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
      !window.confirm('Abhi ka saara data hat kar image ka data aayega. Aage badhun?')
    ) {
      return;
    }

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
                    { type: 'text', text: PROMPT },
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
          applyImageResult(JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1)));
        } catch (err) {
          setIsAnalyzing(false);
          showMsg('Error: ' + err.message, true);
        }
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  };

  const handlePasteImage = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('na');
      const items = await navigator.clipboard.read();
      for (let i = 0; i < items.length; i++) {
        const t = items[i].types.find((x) => x.indexOf('image/') === 0);
        if (t) {
          const b = await items[i].getType(t);
          handleReadImage(new File([b], 'pasted.png', { type: t }));
          return;
        }
      }
      showMsg('Clipboard me image nahi hai. Pehle copy karein (Win+Shift+S).', true);
    } catch {
      showMsg('Page par click karke seedha Ctrl+V dabayein.', true);
    }
  };

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
        handleReadExcel(file);
      } else {
        showMsg('Kripya valid Excel (.xlsx, .xls) ya Image file drop karein.', true);
      }
    }
  };

  const allSizes = Array.from(
    new Set(
      stockState.blocks.flatMap((b) => b.rows.map((r) => r.size)).filter(Boolean)
    )
  );

  return (
    <div
      className={`billets-stock-page ${isDragOver ? 'global-drag-active' : ''}`}
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
      <div className="blt-page-header">
        <div>
          <h2>Billets Stock (LSM &amp; MSM)</h2>
          <p>Section-wise opening stock, receiving, cutting conversions &amp; closing balance</p>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="blt-kpi-grid">
        <div className="blt-kpi-card highlight">
          <div className="blt-kpi-label">Kul Rows &amp; Blocks</div>
          <div className="blt-kpi-value">{totalRowCount} Rows</div>
          <div className="blt-kpi-sub">{stockState.blocks.length} Sections / Blocks</div>
        </div>

        <div className="blt-kpi-card">
          <div className="blt-kpi-label">Opening Qty [Mt]</div>
          <div className="blt-kpi-value">{f3(grandTotal.opQ)}</div>
          <div className="blt-kpi-sub">Total Opening Tonnage</div>
        </div>

        <div className="blt-kpi-card success">
          <div className="blt-kpi-label">Receiving [Mt]</div>
          <div className="blt-kpi-value">{f3(grandTotal.rcQ)}</div>
          <div className="blt-kpi-sub">Net Direct Receipts</div>
        </div>

        <div className="blt-kpi-card">
          <div className="blt-kpi-label">Total Stock [Mt]</div>
          <div className="blt-kpi-value">{f3(grandTotal.tot)}</div>
          <div className="blt-kpi-sub">Cumulative Available</div>
        </div>

        <div className="blt-kpi-card accent">
          <div className="blt-kpi-label">Consumed [Mt]</div>
          <div className="blt-kpi-value">{f3(grandTotal.coQ)}</div>
          <div className="blt-kpi-sub">Mill Consumption</div>
        </div>

        <div className="blt-kpi-card highlight">
          <div className="blt-kpi-label">Closing Stock [Mt]</div>
          <div className="blt-kpi-value">{f3(grandTotal.clQ)}</div>
          <div className="blt-kpi-sub">Current Closing Balance</div>
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

      {/* Action Toolbar */}
      <div className="blt-toolbar-card">
        <div className="blt-toolbar-group">
          <button
            type="button"
            className="blt-btn pri"
            onClick={() => openForm(stockState.blocks.length - 1, -1)}
          >
            + New Entry
          </button>

          <button
            type="button"
            className="blt-btn danger-outline"
            onClick={() => {
              if (window.confirm('Saara data hata dein?')) {
                updateState({ ...stockState, blocks: [], gprinted: null });
                showMsg('Saara data hata diya.');
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
          <div className={`blt-msg-badge ${message.isErr ? 'err' : ''}`}>
            <span>{message.isErr ? '⚠️' : '✓'}</span>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Stock Table Card */}
      <div className="blt-table-card">
        <div className="blt-table-title-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="blt-badge-plant">BLT</span>
            <span className="blt-table-heading">BILLETS STOCK - LSM And MSM</span>
          </div>

          <DateNavigator
            value={stockState.date || new Date().toISOString().slice(0, 10)}
            onChange={(d) => updateState({ ...stockState, date: d })}
          />
        </div>

        <div
          className={`blt-scroll-wrap ${isDragOver ? 'over' : ''}`}
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
              const f = e.dataTransfer.files[0];
              if (f.type.indexOf('image') === 0) handleReadImage(f);
              else handleReadExcel(f);
            }
          }}
        >
          <table className="blt-table-main" id="billets-data-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: '48px' }}>
                  Sr.No.
                </th>
                <th rowSpan={2} style={{ minWidth: '140px' }}>
                  Billets Size [mm]
                </th>
                <th rowSpan={2} style={{ width: '80px' }}>
                  Length [Mtr]
                </th>
                <th colSpan={2}>Opening Stock</th>
                <th colSpan={2}>Receiving</th>
                <th rowSpan={2} style={{ width: '85px' }}>
                  Total [Mt]
                </th>
                <th colSpan={2}>Consumed Qty</th>
                <th colSpan={2}>Closing Stock</th>
                <th rowSpan={2} style={{ minWidth: '130px' }}>
                  Remarks
                </th>
                <th rowSpan={2} className="act" style={{ width: '85px' }}>
                  Actions
                </th>
              </tr>
              <tr>
                <th style={{ width: '55px' }}>Pcs</th>
                <th style={{ width: '80px' }}>Qty [Mt]</th>
                <th style={{ width: '55px' }}>Pcs</th>
                <th style={{ width: '80px' }}>Qty [Mt]</th>
                <th style={{ width: '55px' }}>Pcs</th>
                <th style={{ width: '80px' }}>Qty [Mt]</th>
                <th style={{ width: '55px' }}>Pcs</th>
                <th style={{ width: '80px' }}>Qty [Mt]</th>
              </tr>
            </thead>
            <tbody>
              {stockState.blocks.length > 0 ? (
                stockState.blocks.map((bl, bi) => {
                  const s = blockSums[bi];
                  return (
                    <React.Fragment key={bi}>
                      {bl.rows.map((r, ri) => {
                        const isBad = rowBad(r);
                        return (
                          <tr
                            key={ri}
                            className={`d ${r.cls || ''} ${isBad ? 'chk' : ''}`}
                            title={isBad ? 'Closing Qty ≠ Total − Consumed Qty' : undefined}
                          >
                            <td className="c">{ri === 0 ? bi + 1 : ''}</td>
                            <td style={{ fontWeight: 600 }}>{r.size}</td>
                            <td className="c">{r.len}</td>
                            <td className="n">{r.opP}</td>
                            <td className="n">{r.opQ}</td>
                            <td className="n">{r.rcP}</td>
                            <td className={`n ${r.conv && has(r.rcQ) ? 'cv' : ''}`}>{r.rcQ}</td>
                            <td className="n">{r.tot}</td>
                            <td className="n">{r.coP}</td>
                            <td className="n">{r.coQ}</td>
                            <td className="n">{r.clP}</td>
                            <td className="n">{r.clQ}</td>
                            <td className="rem">{r.rem}</td>
                            <td className="act">
                              <div className="blt-act-group">
                                <button
                                  type="button"
                                  className="blt-icon-btn"
                                  title="Row Update Karein"
                                  aria-label="Update"
                                  onClick={() => openForm(bi, ri)}
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="blt-icon-btn del-btn"
                                  title="Row Delete Karein"
                                  aria-label="Delete"
                                  onClick={() => handleDeleteRow(bi, ri)}
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Sub Total Row */}
                      <tr className="sub">
                        <td />
                        <td style={{ fontWeight: 700 }}>Sub Total</td>
                        <td />
                        <td />
                        <td className="n">{f3(s.opQ)}</td>
                        <td />
                        <td className="n">{f3(s.rcQ)}</td>
                        <td className="n">{f3(s.tot)}</td>
                        <td />
                        <td className="n">{f3(s.coQ)}</td>
                        <td />
                        <td className="n">{f3(s.clQ)}</td>
                        <td className="rem">
                          {bl.printed && (
                            <span
                              className={`blt-tag-pill ${
                                ['opQ', 'tot', 'clQ'].every(
                                  (k) => !has(bl.printed[k]) || Math.abs(num(bl.printed[k]) - s[k]) <= 0.002
                                )
                                  ? 'ok'
                                  : 'no'
                              }`}
                            >
                              {['opQ', 'tot', 'clQ'].every(
                                (k) => !has(bl.printed[k]) || Math.abs(num(bl.printed[k]) - s[k]) <= 0.002
                              )
                                ? '✓ Image match'
                                : '⚠ Diff'}
                            </span>
                          )}
                        </td>
                        <td className="act">
                          <button
                            type="button"
                            className="blt-btn-add-sub"
                            onClick={() => openForm(bi, -1)}
                          >
                            + Row
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No records found. Click "+ New Entry" or upload a file to begin.
                  </td>
                </tr>
              )}

              {/* Grand Total Row */}
              {stockState.blocks.length > 0 && (
                <tr className="grand">
                  <td />
                  <td style={{ fontWeight: 800 }}>GRAND TOTAL</td>
                  <td />
                  <td />
                  <td className="n">{f3(grandTotal.opQ)}</td>
                  <td />
                  <td className="n">{f3(grandTotal.rcQ)}</td>
                  <td className="n">{f3(grandTotal.tot)}</td>
                  <td />
                  <td className="n">{f3(grandTotal.coQ)}</td>
                  <td />
                  <td className="n">{f3(grandTotal.clQ)}</td>
                  <td className="rem" />
                  <td className="act" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal Form */}
      {isModalOpen && (
        <div className="blt-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="blt-modal-card" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-hd">
              <span>{curCoord.r >= 0 ? '✏️ Row Update Karein' : '➕ Add New Entry'}</span>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-bd">
              <div className="grid-row grid-3">
                <div>
                  <label htmlFor="f_size">Billets Size [mm]</label>
                  <input
                    type="text"
                    id="f_size"
                    list="blt-sizes-list"
                    autoComplete="off"
                    placeholder="160X160 (N)"
                    value={formFields.size}
                    onChange={(e) => handleFormFieldChange('size', e.target.value)}
                  />
                  <datalist id="blt-sizes-list">
                    {allSizes.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="f_len">Length [Mtr]</label>
                  <input
                    type="text"
                    id="f_len"
                    autoComplete="off"
                    placeholder="6.000 ya 2.5-3.5"
                    value={formFields.len}
                    onChange={(e) => handleFormFieldChange('len', e.target.value)}
                  />
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
                          Block {i + 1}: {r0.sr ? `Sr ${r0.sr} • ` : ''}
                          {r0.size} ({b.rows.length} rows)
                        </option>
                      );
                    })}
                    <option value="new">+ Naya block (Alag Sub Total)</option>
                  </select>
                </div>
              </div>

              {/* Opening Stock */}
              <fieldset>
                <legend>Opening Stock</legend>
                <div className="pair-grid">
                  <div>
                    <label htmlFor="f_opP">Pcs</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_opP"
                      inputMode="numeric"
                      value={formFields.opP}
                      onChange={(e) => handleFormFieldChange('opP', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="f_opQ">Qty [Mt]</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_opQ"
                      inputMode="decimal"
                      value={formFields.opQ}
                      onChange={(e) => handleFormFieldChange('opQ', e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Receiving */}
              <fieldset>
                <legend>Receiving</legend>
                <div className="pair-grid">
                  <div>
                    <label htmlFor="f_rcP">Pcs</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_rcP"
                      inputMode="numeric"
                      value={formFields.rcP}
                      onChange={(e) => handleFormFieldChange('rcP', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="f_rcQ">Qty [Mt]</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_rcQ"
                      inputMode="decimal"
                      value={formFields.rcQ}
                      onChange={(e) => handleFormFieldChange('rcQ', e.target.value)}
                    />
                  </div>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formFields.conv}
                    onChange={(e) => handleFormFieldChange('conv', e.target.checked)}
                  />
                  Ye receiving billets kaatne se bani hai (conversion), Total me nahi judegi
                </label>
              </fieldset>

              {/* Total */}
              <fieldset>
                <legend>Total</legend>
                <div>
                  <label htmlFor="f_tot">
                    Total [Mt]{' '}
                    <span className="auto-toggle-badge">
                      <input
                        type="checkbox"
                        checked={autoTot}
                        onChange={(e) => setAutoTot(e.target.checked)}
                      />
                      auto = Opening Qty + Receiving Qty
                    </span>
                  </label>
                  <input
                    type="text"
                    className="num-field"
                    id="f_tot"
                    inputMode="decimal"
                    readOnly={autoTot}
                    value={formFields.tot}
                    onChange={(e) => handleFormFieldChange('tot', e.target.value)}
                  />
                </div>
              </fieldset>

              {/* Consumed */}
              <fieldset>
                <legend>Consumed</legend>
                <div className="pair-grid">
                  <div>
                    <label htmlFor="f_coP">Pcs</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_coP"
                      inputMode="numeric"
                      value={formFields.coP}
                      onChange={(e) => handleFormFieldChange('coP', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="f_coQ">Qty [Mt]</label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_coQ"
                      inputMode="decimal"
                      value={formFields.coQ}
                      onChange={(e) => handleFormFieldChange('coQ', e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Closing Stock */}
              <fieldset>
                <legend>Closing Stock</legend>
                <div className="pair-grid">
                  <div>
                    <label htmlFor="f_clP">
                      Pcs{' '}
                      <span className="auto-toggle-badge">
                        <input
                          type="checkbox"
                          checked={autoClP}
                          onChange={(e) => setAutoClP(e.target.checked)}
                        />
                        auto
                      </span>
                    </label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_clP"
                      inputMode="numeric"
                      readOnly={autoClP}
                      value={formFields.clP}
                      onChange={(e) => handleFormFieldChange('clP', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="f_clQ">
                      Qty [Mt]{' '}
                      <span className="auto-toggle-badge">
                        <input
                          type="checkbox"
                          checked={autoClQ}
                          onChange={(e) => setAutoClQ(e.target.checked)}
                        />
                        auto = Total − Consumed
                      </span>
                    </label>
                    <input
                      type="text"
                      className="num-field"
                      id="f_clQ"
                      inputMode="decimal"
                      readOnly={autoClQ}
                      value={formFields.clQ}
                      onChange={(e) => handleFormFieldChange('clQ', e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Remarks & Color */}
              <div className="grid-row grid-2">
                <div>
                  <label htmlFor="f_rem">Remarks</label>
                  <input
                    type="text"
                    id="f_rem"
                    autoComplete="off"
                    placeholder="jaise 199=1.500*4"
                    value={formFields.rem}
                    onChange={(e) => handleFormFieldChange('rem', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f_cls">Row ka Rang</label>
                  <select
                    id="f_cls"
                    value={formFields.cls}
                    onChange={(e) => handleFormFieldChange('cls', e.target.value)}
                  >
                    <option value="">Normal (safed)</option>
                    <option value="g">Hara (T)</option>
                    <option value="y">Peela (MS / HT)</option>
                    <option value="gr">Grey (random)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-ft">
              {formErr && <div className="modal-error-message">⚠️ {formErr}</div>}
              {curCoord.r < 0 && (
                <button
                  type="button"
                  className="blt-btn"
                  onClick={() => {
                    if (saveForm()) openForm(curCoord.b, -1);
                  }}
                >
                  Save &amp; Agli Entry
                </button>
              )}
              <button
                type="button"
                className="blt-btn pri"
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
