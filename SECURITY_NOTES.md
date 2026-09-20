# GHI CHÚ BẢO MẬT HỆ THỐNG — SECURITY NOTES

Áp dụng cho: **KHDH AUTO V12-RC2 WEBAPP PRO**

---

## 1. Nguyên tắc bảo vệ API Key
* **Không ghi vào source code:** Khóa Google AI API Key tuyệt đối không được gán cứng vào mã nguồn.
* **Không lưu vào git:** Các file `.env`, `.env.local` đã được cấu hình trong `.gitignore`.
* **Không log ra console/file:** Server không bao giờ in giá trị đầy đủ của API key ra log. Mọi hàm hiển thị hoặc API phản hồi đều che giấu (mask) key ở dạng `AIzaSy...****`.
* **Không đưa vào Prompt:** Khóa API không bao giờ được nối vào ngữ cảnh (context/prompt) gửi tới mô hình AI.

---

## 2. Bảo mật tải tệp nguồn (Upload Sanitize)
* **Giới hạn kích thước:** File upload qua `multer` bị giới hạn tối đa 50MB.
* **Định dạng cho phép:** Chỉ chấp nhận `.docx` (PL1, KHDH cũ, Mauga) và `.pdf` (SGK).
* **Khử trùng tên file:** Tên file được làm sạch ký tự đặc biệt (`safeFilename`) và lưu trữ tách biệt trong thư mục `storage/uploads/`.
* **Không cho phép thực thi macro:** Hệ thống không thực thi bất kỳ macro nào nhúng trong tệp Word.

---

## 3. Quản lý phiên làm việc (Google OAuth Session)
* Phiên làm việc của giáo viên được quản lý qua token / session chuẩn OAuth 2.0.
* Tách biệt hoàn toàn mã định danh người dùng Google (`user_id`) với Google AI API Key.
* Cho phép giáo viên đăng xuất để hủy phiên làm việc bất cứ lúc nào.
