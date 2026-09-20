# HƯỚNG DẪN KHỞI CHẠY CỤC BỘ — RUN LOCAL

Dự án: **KHDH AUTO V12-RC2 WEBAPP PRO**  
Phiên bản: `V12-RC2` (Chưa phải Final)

---

## 1. Yêu cầu tiên quyết
* Node.js $\ge$ 18 (Đã kiểm thử trên Node v24.19.0).
* NPM $\ge$ 9.

---

## 2. Cài đặt và Khởi động

### Cách 1: Chế độ Phát triển (Dev Server — Đang khuyến nghị)
```bash
# 1. Cài đặt các thư viện phụ thuộc (nếu chưa cài)
npm install

# 2. Khởi động server phát triển với ts-node
npm run dev
```

### Cách 2: Chế độ Production (Biên dịch TypeScript)
```bash
# 1. Biên dịch TypeScript sang thư mục dist/
npm run build

# 2. Khởi chạy máy chủ biên dịch
npm start
```

---

## 3. Truy cập ứng dụng
* **Giao diện Web:** Mở tệp `index.html` trực tiếp trên trình duyệt hoặc chạy qua máy chủ ứng dụng (`npm start`).
* **Kiểm tra Health-check các kết nối thực tế:** `/api/health/connections`
* **Kiểm tra trạng thái xác thực:** `/api/auth/status`

---

## 4. Chạy kiểm thử tự động (Test Suites)

```bash
# Kiểm tra kiểu dữ liệu TypeScript
npm run typecheck

# Kiểm tra lint mã nguồn
npm run lint

# Chạy Unit Tests
npm run test:unit

# Chạy Integration Tests
npm run test:integration

# Chạy E2E Smoke Tests
npm run test:e2e

# Chạy toàn bộ các bộ test
npm test
```
