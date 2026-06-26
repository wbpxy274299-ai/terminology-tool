/* 修复版 app.js - 替换 src/js/app.js */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.style.background = '#f0f0f0';
        t.style.color = '#333';
      });
      tab.classList.add('active');
      tab.style.background = '#fff';
      tab.style.color = '#764ba2';
      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }

  const batchFile = document.getElementById('batch-file');
  if (batchFile) {
    batchFile.addEventListener('change', function (e) {
      if (e.target.files[0]) handleBatchCheck(e.target.files[0]);
    });
  }

  if (typeof initUpdateModule === 'function') {
    try { initUpdateModule(); } catch(e) {}
  }

  if (typeof loadData === 'function') {
    try { loadData(); } catch(e) {}
  }
});
