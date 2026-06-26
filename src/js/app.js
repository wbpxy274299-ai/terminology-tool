/* ========================================
   游戏术语校对工具 - 主入口 / 事件绑定
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Tab 切换逻辑
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有激活状态
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.style.background = '#f0f0f0';
        t.style.color = '#333';
      });
      
      // 激活当前点击的 Tab
      tab.classList.add('active');
      tab.style.background = '#fff';
      tab.style.color = '#764ba2';

      // 显示对应的面板
      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      
      const panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  // 2. 搜索回车触发（安全保护：如果页面上没有搜索框就不执行）
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });
  }

  // 3. 批量校对文件上传（安全保护：如果页面上没有批量上传组件就不执行）
  const batchFile = document.getElementById('batch-file');
  if (batchFile) {
    batchFile.addEventListener('change', function (e) {
      if (e.target.files[0]) handleBatchCheck(e.target.files[0]);
    });
  }

  // 4. 初始化更新模块（安全保护）
  if (typeof initUpdateModule === 'function') {
    initUpdateModule();
  }

  // 5. 加载数据（安全保护）
  if (typeof loadData === 'function') {
    loadData();
  }

});
