# 18 — HƯỚNG DẪN KẾT NỐI VÀ VẬN HÀNH HỆ THỐNG V12-RC2

Tài liệu này hướng dẫn chi tiết quy trình thiết lập, kết nối và vận hành hệ thống KHDH AUTO V12-RC2 WEBAPP PRO.

---

## 1. Yêu cầu môi trường
* **Node.js**: $\ge$ v18.0.0 (Hiện tại khuyến nghị: Node.js v20+ hoặc v24+).
* **NPM**: $\ge$ v9.0.0.
* **Trình duyệt**: Chrome, Edge, Firefox hoặc Safari phiên bản mới.

---

## 2. Các bước cấu hình kết nối

### Bước 1: Khởi động máy chủ cục bộ (Backend + Frontend)
```bash
npm install
npm run dev # hoặc npm start
```
Máy chủ sẽ chạy tại: `http://localhost:3000`.

### Bước 2: Xác thực tài khoản Google
1. Mở giao diện `http://localhost:3000`.
2. Bấm vào nút **"🔴 Google: Chưa đăng nhập"** trên thanh Topbar hoặc vào tab **"🔐 Google & API Key"**.
3. Chọn tài khoản giáo viên để hoàn tất xác thực OAuth session.

### Bước 3: Cấu hình Google AI (Gemini) API Key
1. Lấy API Key từ [Google AI Studio](https://aistudio.google.com/).
2. Nhập key vào ô **Gemini API Key** tại tab **"🔐 Google & API Key"** (hoặc khai báo trong `.env`: `GEMINI_API_KEY=...`).
3. Bấm nút **"⚡ Kiểm tra kết nối Key"**.
   - Nếu key hợp lệ: Hệ thống hiển thị `🔵 API: VALID`.
   - Nếu chưa cấu hình: Trạng thái hiển thị `DISCONNECTED: Google AI API Key chưa được cấu hình`.

### Bước 4: Nạp nguồn dữ liệu (4 Slots)
* Slot 1: `PL1_[mon].docx` (Bắt buộc).
* Slot 2: `SGK_[mon].pdf` (Bắt buộc).
* Slot 3: `KHDH cũ` (Tùy chọn: dùng khi nâng cấp).
* Slot 4: `FORM tổ bộ môn / Mauga.docx` (Tùy chọn: dùng để bóc tách form mẫu Word của trường).

---

## 3. Kiểm tra sức khỏe kết nối (Health-check)
Truy cập endpoint:
`http://localhost:3000/api/health/connections`

Hệ thống sẽ trả về JSON chi tiết tình trạng của từng phân hệ: Database, File Storage, Auth, Gemini API Key và Parsers.
