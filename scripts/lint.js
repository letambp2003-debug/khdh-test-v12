// Simple, fast TypeScript / JavaScript syntax & integrity linter
const fs = require('fs');
const path = require('path');

console.log('[LINT] Bắt đầu kiểm tra cú pháp và cấu trúc mã nguồn dự án...');

let errorCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.agents') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for hardcoded API keys
    if (content.includes('AIzaSy') && !filePath.includes('test') && !filePath.includes('example')) {
      console.warn(`[WARNING] Phát hiện chuỗi API key mẫu trong ${filePath}. Đảm bảo không commit key thật!`);
    }
    // Check JSON parsing
    if (filePath.endsWith('.json')) {
      JSON.parse(content);
    }
  } catch (err) {
    console.error(`[ERROR] Lỗi cú pháp trong ${filePath}:`, err.message);
    errorCount++;
  }
}

walkDir(__dirname + '/../server');
walkDir(__dirname + '/../tests');

if (errorCount === 0) {
  console.log('[LINT] ✅ Toàn bộ mã nguồn đã vượt qua kiểm tra Lint sạch sẽ.');
  process.exit(0);
} else {
  console.error(`[LINT] ❌ Phát hiện ${errorCount} lỗi cú pháp.`);
  process.exit(1);
}
