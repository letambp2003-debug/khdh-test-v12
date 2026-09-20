# 17 — ANTIGRAVITY EXECUTE SYNC CONNECTIONS V12-RC2

## 1. Mục tiêu
Thiết lập và xác thực toàn bộ các liên kết thực tế giữa các phân hệ của KHDH AUTO V12-RC2 WEBAPP PRO.
Không cho phép hiển thị trạng thái ảo hoặc giả lập `CONNECTED` / `PASS` khi chưa có kết nối thật.

## 2. Chuỗi kết nối bắt buộc
```text
Google Login (OAuth / Session)
→ Google AI API Key (Gemini Connection Ping)
→ Backend API (Express / REST API)
→ Database (SQLite / Atomic Typed Store)
→ File Storage (Local disk storage: uploads / exports)
→ Source Parser (PL1 DOCX & SGK PDF extractors)
→ Lesson Data Pack (Canonical Single Source of Truth)
→ Blueprint & KHDH Form V12
→ NLS Mapping (Chỉ báo -> Hoạt động -> Minh chứng)
→ PERIOD_MAP (15–20 slide/tiết)
→ Artifact Hub (Phiếu học tập, 16 loại Game Native, Video AI <=24 từ)
→ Delta Regeneration (Dependency Graph & STALE tagging)
→ Teacher Preferences (Lưu quy tắc theo Scope)
→ Quality QA (100-pt Scorecard & Blocking Gate)
→ Export Hub (DOCX, Canva, NotebookLM, Game HTML)
```

## 3. Quy tắc Health-check
Endpoint `/api/health/connections` phải trả về kết quả kiểm tra từng kết nối:
1. `database`: Kiểm tra quyền đọc/ghi schema.
2. `storage`: Kiểm tra quyền ghi file vào thư mục upload.
3. `auth`: Trạng thái phiên người dùng.
4. `gemini_api`: Gửi ping kiểm tra key thật; nếu chưa cấu hình trả về chính xác:
   `DISCONNECTED: Google AI API Key chưa được cấu hình`.
5. `parsers`: Kiểm tra parser DOCX và PDF sẵn sàng.

## 4. Quản lý trạng thái phụ thuộc (Dependency Graph)
- Mọi module chia sẻ cùng một `LESSON_STATE`.
- Khi Activity $B_i$ bị sửa đổi, truy vết toàn bộ artifact phụ thuộc $B_i$ và đánh dấu `STALE`.
- Không tự ý chạy lại KHDH từ đầu khi chỉ sửa artifact.
