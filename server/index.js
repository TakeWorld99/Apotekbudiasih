import http from 'http';
import fs from 'fs';
import path from 'path';
import { createApiMiddleware } from './api.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const apiMiddleware = createApiMiddleware();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // 1. Tangani request API via middleware
  apiMiddleware(req, res, () => {
    // 2. Jika bukan rute /api/, sajikan file statis dari dist/
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = url.pathname;

    let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

    // Periksa apakah file ada di dist
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      return fs.createReadStream(filePath).pipe(res);
    }

    // SPA fallback: sajikan dist/index.html untuk rute frontend
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return fs.createReadStream(indexPath).pipe(res);
    }

    // Jika dist belum dibuild
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>Apotek Budi Asih Production Server</h1><p>Frontend belum dibuild. Jalankan <code>npm run build</code> terlebih dahulu.</p>');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🏥 APOTEK BUDI ASIH - PRODUCTION SERVER BERJALAN`);
  console.log(`🚀 Akses Aplikasi: http://localhost:${PORT}`);
  console.log(`📦 Status API: Terhubung ke PostgreSQL (DBeaver Ready)`);
  console.log(`======================================================\n`);
});
