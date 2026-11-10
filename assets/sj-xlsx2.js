/* Sparkling · styled .xlsx writer v2 (no dependencies). Logo image, several sections on one sheet, brand purples.
   window.SJXLSX2.build({ logo: ArrayBuffer|null, title, subtitle, lines:[string], sheet, sections:[{title, sub, columns:[{h,w,t,sum}], rows:[[...]], totalLabel}], footer:[string] }) -> Blob */
(function () {
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  var crc32 = function (b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  var enc = new TextEncoder();
  var bytes = function (d) { return d instanceof Uint8Array ? d : d instanceof ArrayBuffer ? new Uint8Array(d) : enc.encode(String(d)); };
  function zip(files) {
    var parts = [], cen = [], off = 0;
    files.forEach(function (f) { var name = enc.encode(f.name), data = bytes(f.data), crc = crc32(data);
      var lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(8, 0, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      var ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
      cen.push(new Uint8Array(ch.buffer), name); off += 30 + name.length + data.length; });
    var cs = cen.reduce(function (a, b) { return a + b.length; }, 0); var end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cs, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(cen, [new Uint8Array(end.buffer)]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  var X = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var col = function (n) { var s = ''; n++; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

  /* styles: fonts 0 body · 1 title · 2 sub · 3 header(white) · 4 link · 5 section · 6 total · 7 eyebrow · 8 big total */
  var FONTS = ['<font><sz val="10"/><color rgb="FF181320"/><name val="Arial"/></font>', '<font><b/><sz val="20"/><color rgb="FF261D3D"/><name val="Arial"/></font>', '<font><sz val="10"/><color rgb="FF5B5470"/><name val="Arial"/></font>', '<font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>', '<font><u/><sz val="10"/><color rgb="FF3F2A57"/><name val="Arial"/></font>', '<font><b/><sz val="11"/><color rgb="FF261D3D"/><name val="Arial"/></font>', '<font><b/><sz val="10"/><color rgb="FF261D3D"/><name val="Arial"/></font>', '<font><b/><sz val="8"/><color rgb="FF6D497E"/><name val="Arial"/></font>', '<font><b/><sz val="14"/><color rgb="FF261D3D"/><name val="Arial"/></font>', '<font><sz val="10"/><color rgb="FF9B2335"/><name val="Arial"/></font>', '<font><b/><sz val="10"/><color rgb="FF1E7A46"/><name val="Arial"/></font>'];
  var FILLS = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>', '<fill><patternFill patternType="solid"><fgColor rgb="FF261D3D"/><bgColor indexed="64"/></patternFill></fill>', '<fill><patternFill patternType="solid"><fgColor rgb="FFF7F4FA"/><bgColor indexed="64"/></patternFill></fill>', '<fill><patternFill patternType="solid"><fgColor rgb="FFE7DDF0"/><bgColor indexed="64"/></patternFill></fill>', '<fill><patternFill patternType="solid"><fgColor rgb="FF181320"/><bgColor indexed="64"/></patternFill></fill>'];
  var BORDERS = ['<border><left/><right/><top/><bottom/><diagonal/></border>', '<border><left/><right/><top/><bottom style="thin"><color rgb="FFE7E2EC"/></bottom><diagonal/></border>', '<border><left/><right/><top style="medium"><color rgb="FF261D3D"/></top><bottom/><diagonal/></border>', '<border><left/><right/><top/><bottom style="medium"><color rgb="FF6D497E"/></bottom><diagonal/></border>'];
  var NUMF = { num: 164, money: 165, ppc: 166, pct: 167, int: 1 };
  var XF = []; var xf = function (o) { XF.push(o); return XF.length - 1; };
  var S = {};
  S.body = xf({}); S.title = xf({ f: 1 }); S.sub = xf({ f: 2 }); S.head = xf({ f: 3, fill: 2, al: 'center', wrap: 1 }); S.section = xf({ f: 5, b: 3, al: 'left' }); S.eyebrow = xf({ f: 7 });
  S.sumLbl = xf({ f: 2, fill: 3, b: 1 }); S.sumVal = xf({ f: 6, fill: 3, b: 1, al: 'right' }); S.sumMoney = xf({ f: 6, fill: 3, b: 1, al: 'right', n: 165 }); S.bigLbl = xf({ f: 6, fill: 4, b: 2 }); S.bigVal = xf({ f: 8, fill: 4, b: 2, al: 'right', n: 165 });
  var KINDS = ['text', 'ctext', 'num', 'int', 'money', 'ppc', 'pct', 'link', 'id', 'in', 'hold', 'bad', 'wrap'];
  var CELL = {}; KINDS.forEach(function (k) { CELL[k] = [0, 3].map(function (fill) { var al = /num|int|money|ppc|pct/.test(k) ? 'right' : /ctext|in|hold/.test(k) ? 'center' : 'left'; var f = k === 'link' ? 4 : k === 'in' ? 10 : k === 'bad' || k === 'hold' ? 9 : k === 'id' ? 6 : 0; return xf({ f: f, fill: fill, b: 1, al: al, n: NUMF[k] || 0, wrap: k === 'wrap' ? 1 : 0 }); }); });
  S.tot = xf({ f: 6, fill: 4, b: 2 }); S.totNum = xf({ f: 6, fill: 4, b: 2, n: 164, al: 'right' }); S.totMoney = xf({ f: 6, fill: 4, b: 2, n: 165, al: 'right' }); S.totInt = xf({ f: 6, fill: 4, b: 2, n: 1, al: 'right' });
  function stylesXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="4"><numFmt numFmtId="164" formatCode="0.00"/><numFmt numFmtId="165" formatCode="&quot;$&quot;#,##0.00"/><numFmt numFmtId="166" formatCode="&quot;$&quot;#,##0&quot;/CT&quot;"/><numFmt numFmtId="167" formatCode="0.00&quot;%&quot;"/></numFmts>' +
      '<fonts count="' + FONTS.length + '">' + FONTS.join('') + '</fonts><fills count="' + FILLS.length + '">' + FILLS.join('') + '</fills><borders count="' + BORDERS.length + '">' + BORDERS.join('') + '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="' + XF.length + '">' +
      XF.map(function (o) { return '<xf numFmtId="' + (o.n || 0) + '" fontId="' + (o.f || 0) + '" fillId="' + (o.fill || 0) + '" borderId="' + (o.b || 0) + '" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="' + (o.al || 'left') + '" vertical="center"' + (o.wrap ? ' wrapText="1"' : '') + '/></xf>'; }).join('') +
      '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  }
  var str = function (ref, s, v) { return '<c r="' + ref + '" s="' + s + '" t="inlineStr"><is><t xml:space="preserve">' + X(v) + '</t></is></c>'; };
  var num = function (ref, s, v) { return '<c r="' + ref + '" s="' + s + '"><v>' + (+v) + '</v></c>'; };

  function build(o) {
    var NC = Math.max.apply(null, [8].concat(o.sections.map(function (s) { return s.columns.length; })));
    var rows = [], merges = [], R = 1; var widths = []; var H = {};
    var add = function (xml, ht) { rows.push('<row r="' + R + '"' + (ht ? ' ht="' + ht + '" customHeight="1"' : '') + '>' + xml + '</row>'); R++; };
    var blank = function (n) { for (var i = 0; i < (n || 1); i++) add('', 6); };
    /* header block: logo lives in A1:B4 (drawing), text from column C */
    var logoRows = o.logo ? 4 : 0;
    if (o.logo) { add('', 22); add(str('C' + R, S.title, o.title), 30); merges.push('C' + (R - 1) + ':' + col(NC - 1) + (R - 1)); add(str('C' + R, S.sub, o.subtitle), 16); merges.push('C' + (R - 1) + ':' + col(NC - 1) + (R - 1)); add('', 10); }
    else { add(str('A' + R, S.title, o.title), 30); merges.push('A' + (R - 1) + ':' + col(NC - 1) + (R - 1)); add(str('A' + R, S.sub, o.subtitle), 16); merges.push('A' + (R - 1) + ':' + col(NC - 1) + (R - 1)); }
    (o.lines || []).forEach(function (l) { add(str('A' + R, S.sub, l), 15); merges.push('A' + (R - 1) + ':' + col(NC - 1) + (R - 1)); });
    blank();
    /* summary block (two columns: label · value) */
    if (o.summary && o.summary.length) {
      add(str('A' + R, S.eyebrow, 'ORDER SUMMARY'), 14);
      o.summary.forEach(function (s) { var big = !!s.big; var lblS = big ? S.bigLbl : S.sumLbl, valS = big ? S.bigVal : (s.money ? S.sumMoney : S.sumVal);
        var xml = str('A' + R, lblS, s.k); for (var c = 1; c < 3; c++) xml += '<c r="' + col(c) + R + '" s="' + lblS + '"/>'; xml += (typeof s.v === 'number' ? num('D' + R, valS, s.v) : str('D' + R, valS, s.v)); for (var c2 = 4; c2 < 6; c2++) xml += '<c r="' + col(c2) + R + '" s="' + valS + '"/>'; merges.push('A' + R + ':C' + R); merges.push('D' + R + ':F' + R); add(xml, big ? 26 : 18); });
      blank();
    }
    var firstHead = null;
    o.sections.forEach(function (sec) {
      if (!sec.rows.length) return; var C = sec.columns;
      add(str('A' + R, S.section, sec.title.toUpperCase() + (sec.sub ? '   ·   ' + sec.sub : '')) + C.slice(1).map(function (c, i) { return '<c r="' + col(i + 1) + R + '" s="' + S.section + '"/>'; }).join(''), 24);
      add(C.map(function (c, i) { return str(col(i) + R, S.head, c.h); }).join(''), 26); if (!firstHead) firstHead = R - 1;
      var first = R;
      sec.rows.forEach(function (r, ri) { var b = ri % 2; var tall = r.some(function (v, ci) { return (C[ci].t === 'wrap') && String(v || '').length > 70; }); var xml = r.map(function (v, ci) { var t = C[ci].t || 'text', ref = col(ci) + R;
          if (v == null || v === '') return '<c r="' + ref + '" s="' + (CELL[t] || CELL.text)[b] + '"/>';
          if (t === 'avail') { var k = /in stock/i.test(v) ? 'in' : /no longer|sold/i.test(v) ? 'bad' : 'hold'; return str(ref, CELL[k][b], v); }
          if (t === 'link') return '<c r="' + ref + '" s="' + CELL.link[b] + '" t="str"><f>HYPERLINK("' + X(v.url) + '","' + X(v.label) + '")</f><v>' + X(v.label) + '</v></c>';
          if (/^(num|int|money|ppc|pct)$/.test(t) && typeof v === 'number') return num(ref, CELL[t][b], v);
          return str(ref, (CELL[t] || CELL.text)[b], v); }).join(''); add(xml, tall ? 44 : 18); });
      var last = R - 1;
      add(C.map(function (c, i) { var ref = col(i) + R, L = col(i);
        if (i === 0) return '<c r="' + ref + '" s="' + S.tot + '" t="str"><f>"' + X(sec.totalLabel || 'Total') + ' · "&amp;SUBTOTAL(103,' + L + first + ':' + L + last + ')&amp;" ' + X(sec.unit || 'lines') + '"</f><v></v></c>';
        if (c.sum === 'num') return '<c r="' + ref + '" s="' + S.totNum + '"><f>SUBTOTAL(109,' + L + first + ':' + L + last + ')</f></c>';
        if (c.sum === 'int') return '<c r="' + ref + '" s="' + S.totInt + '"><f>SUBTOTAL(109,' + L + first + ':' + L + last + ')</f></c>';
        if (c.sum === 'money') return '<c r="' + ref + '" s="' + S.totMoney + '"><f>SUBTOTAL(109,' + L + first + ':' + L + last + ')</f></c>';
        return '<c r="' + ref + '" s="' + S.tot + '"/>'; }).join(''), 22);
      C.forEach(function (c, i) { widths[i] = Math.max(widths[i] || 0, c.w || 12); });
      blank(2);
    });
    (o.footer || []).forEach(function (l) { add(str('A' + R, S.sub, l), 15); merges.push('A' + (R - 1) + ':' + col(NC - 1) + (R - 1)); });
    for (var i = 0; i < NC; i++) if (!widths[i]) widths[i] = 12; if (o.logo) { widths[0] = Math.max(widths[0], 14); widths[1] = Math.max(widths[1], 14); }
    var lastCol = col(NC - 1);
    var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetPr><tabColor rgb="FF261D3D"/><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:' + lastCol + (R - 1) + '"/>' +
      '<sheetViews><sheetView workbookViewId="0" showGridLines="0" zoomScale="110"' + (firstHead ? ' tabSelected="1"' : '') + '/></sheetViews><sheetFormatPr defaultRowHeight="15"/>' +
      '<cols>' + widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols>' +
      '<sheetData>' + rows.join('') + '</sheetData>' + (merges.length ? '<mergeCells count="' + merges.length + '">' + merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>' : '') +
      '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>' + (o.logo ? '<drawing r:id="rId1"/>' : '') + '</worksheet>';
    var sn = X((o.sheet || 'Selection').slice(0, 31));
    var files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + (o.logo ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : '') + '</Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + sn + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: stylesXml() },
      { name: 'xl/worksheets/sheet1.xml', data: sheet }];
    if (o.logo) {
      /* logo: columns A–B, rows 1–4 · 781×248 px source → about 190×60 px */
      files.push({ name: 'xl/worksheets/_rels/sheet1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>' });
      files.push({ name: 'xl/drawings/_rels/drawing1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>' });
      files.push({ name: 'xl/drawings/drawing1.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>76200</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>76200</xdr:rowOff></xdr:from><xdr:ext cx="' + Math.round(190 * 9525) + '" cy="' + Math.round(60 * 9525) + '"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="Sparkling Jewelry"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + Math.round(190 * 9525) + '" cy="' + Math.round(60 * 9525) + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>' });
      files.push({ name: 'xl/media/image1.png', data: o.logo });
    }
    return zip(files);
  }
  window.SJXLSX2 = { build: build };
})();
