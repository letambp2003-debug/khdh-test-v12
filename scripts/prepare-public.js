const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const srcHtml = path.resolve(rootDir, 'index.html');
const destHtml = path.resolve(publicDir, 'index.html');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy index.html to public/index.html
if (fs.existsSync(srcHtml)) {
  fs.copyFileSync(srcHtml, destHtml);
  console.log('[BUILD] ✅ Đã đồng bộ index.html sang thư mục public/index.html cho Vercel.');
} else {
  console.error('[BUILD] ⚠️ Không tìm thấy tệp index.html tại thư mục gốc.');
}
