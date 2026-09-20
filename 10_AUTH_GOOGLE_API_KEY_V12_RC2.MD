# ĐĂNG NHẬP GOOGLE + GOOGLE API KEY

## 1. Bắt buộc
Người dùng phải:
1. đăng nhập bằng Google;
2. nhập Google/Gemini API key;
3. API key được kiểm tra trước khi bật nút phân tích nguồn.

## 2. Login
Dùng OAuth/OIDC tiêu chuẩn.
Ưu tiên luồng đơn giản:
`Continue with Google`.

Không cần tạo mật khẩu riêng nếu không có lý do.

## 3. API Key
UI:

```text
Google AI API Key
[••••••••••••••••]
[KIỂM TRA KẾT NỐI]
```

Trạng thái:

```text
NOT_CONFIGURED
VALIDATING
VALID
INVALID
QUOTA_ERROR
```

## 4. Bảo mật
- không log API key;
- không ghi key vào source code;
- không đưa key vào prompt;
- không hiển thị full key sau khi lưu;
- mã hóa khi lưu persistent;
- cho phép xóa/thay key;
- tách OAuth token khỏi Gemini API key;
- production dùng server-side proxy để tránh lộ key trong browser/network.

## 5. Local development
- hỗ trợ session local;
- không commit key vào repository;
- không hard-code key người dùng trong `.env`.

## 6. Gating
Không có API key hợp lệ:
- vẫn cho xem UI;
- vẫn cho quản lý file;
- disable `PHÂN TÍCH`, `SOẠN`, `TẠO HỌC LIỆU`.
