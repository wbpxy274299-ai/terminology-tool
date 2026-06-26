/**
 * 术语校对工具 - 服务器部署版
 * 功能：1) 托管网站静态文件  2) 中转 AI 接口请求（解决 CORS）
 * 部署到阿里云服务器后，浏览器访问这个服务器，服务器再去调 idealab
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const AI_STUDIO_BASE = "https://idealab.alibaba-inc.com/api/aiapp/run";

// API 密钥（写在服务器端，前端看不到）
const AI_STUDIO_AK = "5c406f762ebb2b38aba46d5511ea4ff8";

// 助手配置
const ASSISTANTS = {
  a: { code: 'vAKIOhyPlmw', ver: '1.0.4' },
  b: { code: 'KLsOezRanUZ', ver: '1.1.0' }
};

// MIME 类型
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// ===== 静态文件服务 =====
function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      // 大文件（terms.json 41MB）加缓存
      const headers = { 'Content-Type': contentType };
      if (ext === '.json' || ext === '.css' || ext === '.js') {
        headers['Cache-Control'] = 'public, max-age=3600';
      }
      res.writeHead(200, headers);
      res.end(content);
    }
  });
}

// ===== AI 接口中转 =====
function handleAIProxy(req, res, body) {
  try {
    const data = JSON.parse(body);
    const assistantType = data.assistant || 'a'; // 'a' 或 'b'
    const question = data.question || '';

    const assistant = ASSISTANTS[assistantType];
    if (!assistant) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, errorMsg: '未知的助手类型' }));
      return;
    }

    const apiUrl = `${AI_STUDIO_BASE}/${assistant.code}/${assistant.ver}`;
    const payload = JSON.stringify({
      empId: '000000',
      question: question,
      sessionId: 'proxy-' + Date.now(),
      stream: false,
      keepConnection: true
    });

    const parsedUrl = new URL(apiUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'X-AK': AI_STUDIO_AK,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    console.log(`[${new Date().toLocaleString()}] AI请求: 助手${assistantType} -> ${assistant.code}`);

    const apiReq = https.request(options, (apiRes) => {
      let result = '';
      apiRes.on('data', (chunk) => { result += chunk; });
      apiRes.on('end', () => {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(result);
        console.log(`[${new Date().toLocaleString()}] AI响应完成: 助手${assistantType}`);
      });
    });

    // 超时设置 60 秒（AI 生成有时较慢）
    apiReq.setTimeout(60000, () => {
      apiReq.destroy();
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, errorMsg: 'AI 接口超时（60秒）' }));
      console.log(`[${new Date().toLocaleString()}] AI超时: 助手${assistantType}`);
    });

    apiReq.on('error', (e) => {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ success: false, errorMsg: '代理请求失败: ' + e.message }));
      console.log(`[${new Date().toLocaleString()}] AI错误: 助手${assistantType} - ${e.message}`);
    });

    apiReq.write(payload);
    apiReq.end();

  } catch (e) {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ success: false, errorMsg: e.message }));
  }
}

// ===== 健康检查 =====
function handleHealth(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    time: new Date().toLocaleString(),
    uptime: process.uptime() + 's'
  }));
}

// ===== 主路由 =====
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // API: AI 中转
  if (pathname === '/api/ai' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => handleAIProxy(req, res, body));
    return;
  }

  // API: 健康检查
  if (pathname === '/api/health') {
    handleHealth(res);
    return;
  }

  // 静态文件
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  // 安全检查：防止目录穿越
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  serveStatic(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('  术语校对工具 - 服务器已启动');
  console.log('  端口: ' + PORT);
  console.log('  访问: http://你的服务器IP:' + PORT);
  console.log('  AI中转: POST /api/ai');
  console.log('  健康检查: GET /api/health');
  console.log('========================================');
});
