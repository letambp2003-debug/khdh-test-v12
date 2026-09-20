# GIẢI THÍCH BIẾN MÔI TRƯỜNG — ENV_EXAMPLE.MD

Tài liệu này giải thích các biến môi trường được sử dụng trong file `.env` của hệ thống **KHDH AUTO V12-RC2 WEBAPP PRO**.

---

## 1. Danh sách biến môi trường

```ini
# Cổng máy chủ HTTP
PORT=3000

# Môi trường chạy ứng dụng: 'development' hoặc 'production'
NODE_ENV=development

# Khóa Google AI (Gemini) API Key
# Bắt buộc để phân tích bài học và sinh học liệu liên kết
# Lấy miễn phí tại: https://aistudio.google.com/
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here

# Đường dẫn lưu trữ tệp tin nguồn do người dùng tải lên (PL1, SGK, KHDH cũ, Mauga.docx)
STORAGE_DIR=./storage/uploads

# Đường dẫn lưu trữ các tệp tin xuất bản (Word DOCX, Canva Prompt, NotebookLM MD, Game HTML)
EXPORTS_DIR=./storage/exports

# Đường dẫn tệp cơ sở dữ liệu Typed JSON / SQLite
DB_PATH=./storage/database.json

# Chuỗi bí mật mã hóa phiên làm việc của Google OAuth
SESSION_SECRET=khdh_v12_rc2_secure_session_secret_key
```

---

## 2. Lưu ý an toàn bảo mật
* Tuyệt đối không commit file `.env` lên kho mã nguồn (git).
* Không chia sẻ file `.env` chứa `GEMINI_API_KEY` thật ra bên ngoài.
