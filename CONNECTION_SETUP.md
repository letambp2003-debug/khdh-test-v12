# HƯỚNG DẪN THIẾT LẬP KẾT NỐI — CONNECTION SETUP

Tài liệu mô tả chi tiết cách thiết lập và xác thực các mắt xích kết nối trong hệ thống **KHDH AUTO V12-RC2 WEBAPP PRO**.

---

## 1. Chuỗi mắt xích kết nối

```text
[1. Google OAuth] 
   └── [2. Google AI Key] 
          └── [3. Backend API] 
                 └── [4. Database & Storage] 
                        └── [5. Parsers] 
                               └── [6. LESSON_STATE] 
                                      └── [7. Artifact Hub]
```

---

## 2. Chi tiết từng phân hệ kết nối

### 1. Cơ sở dữ liệu (Database)
* File: `server/db/database.ts`
* Vị trí lưu: `storage/database.json`
* Cấu trúc: Lưu trữ `projects`, `lessons`, `artifacts`, `teacher_preferences`, `audit_logs`.
* Tự động khởi tạo và đảm bảo toàn vẹn dữ liệu khi server khởi động.

### 2. Hệ thống lưu trữ tệp (File Storage)
* File: `server/storage/fileStorage.ts`
* Thư mục upload: `storage/uploads/`
* Thư mục xuất bản: `storage/exports/`
* Quyền đọc ghi được kiểm tra tự động qua health-check.

### 3. Đăng nhập Google (OAuth / Session)
* Giao diện: Nút bấm trên Topbar và Modal chọn tài khoản Google.
* API: `POST /api/auth/login`
* Phiên làm việc được đồng bộ giữa Backend session và Frontend localStorage.

### 4. Khóa Google AI (Gemini) API Key
* Giao diện: Tab **"🔐 Google & API Key"**.
* API: `POST /api/auth/api-key`
* Kiểm tra tính hợp lệ:
  * Nếu key rỗng $\rightarrow$ Báo `DISCONNECTED: Google AI API Key chưa được cấu hình`.
  * Nếu key sai cú pháp $\rightarrow$ Báo `DISCONNECTED: Khóa API không đúng định dạng`.
  * Nếu key hợp lệ $\rightarrow$ Kích hoạt `CONNECTED: Google AI API Key hợp lệ`.

### 5. Bộ bóc tách nguồn (Source Parsers)
* DOCX Parser: Bóc tách text, bảng biểu và mục tiêu từ file `PL1_[mon].docx`.
* PDF Parser: Trích xuất trang, bài tập, hình ảnh và công thức từ `SGK_[mon].pdf`.

---

## 3. Xác thực kết nối qua Health-Check
Truy cập: `GET http://localhost:3000/api/health/connections`

Ví dụ phản hồi JSON:
```json
{
  "overall_status": "HEALTHY",
  "connections": {
    "database": { "connected": true, "status": "CONNECTED" },
    "file_storage": { "connected": true, "status": "CONNECTED" },
    "google_auth": { "connected": true, "status": "CONNECTED" },
    "gemini_api": { "connected": true, "status": "CONNECTED" },
    "source_parsers": { "connected": true, "status": "CONNECTED" },
    "lesson_state": { "connected": true, "status": "CONNECTED" }
  }
}
```
