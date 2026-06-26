/* Post Assistant Module - Chinese UI */

var POST_CONFIG = {
  a: { code: 'vAKIOhyPlmw', ver: '1.0.0' },
  b: { code: 'KLsOezRanUZ', ver: '1.1.0' },
  key: '5c406f762ebb2b38aba46d5511ea4ff8'
};

var postResult = '';
var transResult = '';

async function callAI(code, ver, q) {
  var r = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code, version: ver, question: q, apiKey: POST_CONFIG.key })
  });
  var d = await r.json();
  if (d.success && d.data && d.data.content) return d.data.content;
  throw new Error(d.errorMsg || d.error || 'API\u8c03\u7528\u5931\u8d25');
}

function findTerms(text) {
  if (!TERMS || !TERMS.length) return [];
  var found = [], seen = new Set();
  var sorted = Object.entries(ALL_INDEX).map(function(e) {
    return { t: e[0], i: e[1] };
  }).sort(function(a, b) { return b.t.length - a.t.length; });
  for (var k = 0; k < sorted.length; k++) {
    if (seen.has(sorted[k].t)) continue;
    if (text.includes(sorted[k].t)) {
      seen.add(sorted[k].t);
      var idx = sorted[k].i.values().next().value;
      var row = TERMS[idx];
      if (row) found.push({ cn: row[0], jp: row[1], en: row[2], kr: row[3], tw: row[4], vn: row[5], th: row[7] });
    }
  }
  return found;
}

function buildRef(terms) {
  if (!terms.length) return '';
  var s = '\n\n\u3010\u672f\u8bed\u53c2\u8003\u3011\n';
  terms.forEach(function(t) {
    s += t.cn + ' -> \u65e5:' + (t.jp||'-') + ' \u82f1:' + (t.en||'-') + ' \u97e9:' + (t.kr||'-') + ' \u7e41:' + (t.tw||'-') + ' \u8d8a:' + (t.vn||'-') + ' \u6cf0:' + (t.th||'-') + '\n';
  });
  return s;
}

async function generatePost() {
  var input = document.getElementById('pa-input').value.trim();
  if (!input) { alert('\u8bf7\u8f93\u5165\u7d20\u6750\u5185\u5bb9'); return; }
  var btn = document.getElementById('pa-gen-btn');
  var st = document.getElementById('pa-status');
  btn.disabled = true; btn.textContent = '\u23f3 \u751f\u6210\u4e2d...';
  st.textContent = '\u6b63\u5728\u8c03\u7528\u8d34\u6587\u52a9\u624b...'; st.className = 'status loading';
  try {
    var result = await callAI(POST_CONFIG.a.code, POST_CONFIG.a.ver, input);
    document.getElementById('pa-editor').value = result;
    postResult = result;
    st.textContent = '\u2705 \u8d34\u6587\u751f\u6210\u5b8c\u6210\uff01\u53ef\u5728\u4e0b\u65b9\u7f16\u8f91\u4fee\u6539'; st.className = 'status success';
  } catch (e) { st.textContent = '\u274c \u751f\u6210\u5931\u8d25: ' + e.message; st.className = 'status error'; }
  btn.disabled = false; btn.textContent = '\ud83e\udd16 \u751f\u6210\u8d34\u6587';
}

async function translatePost() {
  var post = document.getElementById('pa-editor').value.trim();
  if (!post) { alert('\u8bf7\u5148\u751f\u6210\u6216\u8f93\u5165\u8d34\u6587'); return; }
  var btn = document.getElementById('pa-trans-btn');
  var st = document.getElementById('pa-status');
  btn.disabled = true; btn.textContent = '\u23f3 \u7ffb\u8bd1\u4e2d...';
  st.textContent = '\u6b63\u5728\u63d0\u53d6\u672f\u8bed\u5e76\u7ffb\u8bd1...'; st.className = 'status loading';
  try {
    var terms = findTerms(post);
    var ref = buildRef(terms);
    var q = '\u8bf7\u628a\u4ee5\u4e0b\u8d34\u6587\u7ffb\u8bd1\u6210\u65e5\u8bed\u3001\u82f1\u8bed\u3001\u97e9\u8bed\u3001\u7e41\u4e2d\u3001\u8d8a\u5357\u8bed\u3001\u6cf0\u8bed\uff1a\n' + post + ref;
    var result = await callAI(POST_CONFIG.b.code, POST_CONFIG.b.ver, q);
    transResult = result;
    var html = '<div style="margin:10px 0"><b>\ud83d\udccb \u7ffb\u8bd1\u7ed3\u679c\uff08\u53c2\u8003\u4e86 ' + terms.length + ' \u4e2a\u672f\u8bed\uff09</b></div>';
    html += '<div class="trans-out">' + esc(result).replace(/\n/g, '<br>') + '</div>';
    html += '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">';
    html += '<button class="check-btn" onclick="copyAll()">\ud83d\udccb \u590d\u5236\u5168\u90e8</button>';
    html += '<button class="check-btn" onclick="copyOne(\'jp\')">JP</button>';
    html += '<button class="check-btn" onclick="copyOne(\'en\')">EN</button>';
    html += '<button class="check-btn" onclick="copyOne(\'kr\')">KR</button>';
    html += '<button class="check-btn" onclick="copyOne(\'tw\')">TW</button>';
    html += '<button class="check-btn" onclick="copyOne(\'vn\')">VN</button>';
    html += '<button class="check-btn" onclick="copyOne(\'th\')">TH</button></div>';
    document.getElementById('pa-trans-out').innerHTML = html;
    st.textContent = '\u2705 \u7ffb\u8bd1\u5b8c\u6210\uff01'; st.className = 'status success';
  } catch (e) { st.textContent = '\u274c \u7ffb\u8bd1\u5931\u8d25: ' + e.message; st.className = 'status error'; }
  btn.disabled = false; btn.textContent = '\ud83c\udf10 \u7ffb\u8bd1\u6210 6 \u8bed\u8a00';
}

function proofreadTranslation() {
  if (!transResult) { alert('\u8bf7\u5148\u7ffb\u8bd1'); return; }
  var text = transResult;
  var html = '<div style="margin:10px 0"><b>\ud83d\udd0d \u6821\u5bf9\u7ed3\u679c</b></div>';
  var totalOk = 0, totalWarn = 0;
  var detail = '<table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #eee">\u672f\u8bed</th><th style="text-align:left;padding:6px;border-bottom:2px solid #eee">\u6807\u51c6\u7ffb\u8bd1</th><th style="text-align:left;padding:6px;border-bottom:2px solid #eee">\u7ffb\u8bd1\u4e2d\u662f\u5426\u627e\u5230</th><th style="text-align:left;padding:6px;border-bottom:2px solid #eee">\u72b6\u6001</th></tr>';
  var allTerms = findTerms(document.getElementById('pa-editor').value.trim());
  allTerms.forEach(function(t) {
    var langs = { jp: t.jp, en: t.en, kr: t.kr, tw: t.tw, vn: t.vn, th: t.th };
    Object.entries(langs).forEach(function(e) {
      if (!e[1]) return;
      var parts = e[1].split(' | ');
      parts.forEach(function(standard) {
        standard = standard.trim();
        if (!standard || standard === '-') return;
        var found = text.includes(standard);
        if (found) { totalOk++; } else { totalWarn++; }
        detail += '<tr><td style="padding:4px 6px;border-bottom:1px solid #f5f5f5">' + esc(t.cn) + '</td>';
        detail += '<td style="padding:4px 6px;border-bottom:1px solid #f5f5f5">' + esc(standard) + '</td>';
        detail += '<td style="padding:4px 6px;border-bottom:1px solid #f5f5f5">' + (found ? '\u2705' : '\u274c \u672a\u627e\u5230') + '</td>';
        detail += '<td style="padding:4px 6px;border-bottom:1px solid #f5f5f5;color:' + (found ? '#28a745' : '#e74c3c') + '">' + (found ? 'OK' : '\u4e0d\u5339\u914d') + '</td></tr>';
      });
    });
  });
  detail += '</table>';
  html += '<div style="margin-bottom:10px">\u2705 ' + totalOk + ' \u4e2a\u672f\u8bed\u6b63\u786e\uff0c\u274c ' + totalWarn + ' \u4e2a\u672f\u8bed\u672a\u5339\u914d</div>';
  html += detail;
  document.getElementById('pa-proof-out').innerHTML = html;
  document.getElementById('pa-status').textContent = '\u2705 \u6821\u5bf9\u5b8c\u6210\uff01' + totalOk + ' \u4e2a\u6b63\u786e\uff0c' + totalWarn + ' \u4e2a\u8b66\u544a';
  document.getElementById('pa-status').className = 'status success';
}

function copyAll() {
  navigator.clipboard.writeText(transResult);
  alert('\u5df2\u590d\u5236\u5168\u90e8\u7ffb\u8bd1\uff01');
}

function copyOne(lang) {
  var map = { jp: '\u65e5\u672c\u8a9e', en: 'English', kr: '\ud55c\uad6d\uc5b4', tw: '\u7e41\u9ad4\u4e2d\u6587', vn: 'Ti\u1ebfng Vi\u1ec7t', th: '\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22' };
  var name = map[lang];
  if (!name) return;
  var lines = transResult.split('---');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].includes(name)) {
      var content = lines[i + 1] ? lines[i + 1].trim() : lines[i].replace(/.*?[\u65e5\u672c\u8a9eEnglish\ud55c\uad6d\uc5b4\u7e41\u9ad4\u4e2d\u6587Ti\u1ebfng Vi\u1ec7t\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22]*/g, '').trim();
      navigator.clipboard.writeText(content);
      alert('\u5df2\u590d\u5236 ' + name + '\uff01');
      return;
    }
  }
  alert('\u672a\u627e\u5230 ' + name + ' \u90e8\u5206');
}
