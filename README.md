# KHDH AUTO V12-RC2 WEBAPP PRO

Hệ thống tự động hóa Kế hoạch bài dạy (KHDH) và Trạm học liệu liên kết (Artifact Hub) dành cho giáo viên Việt Nam, tuân thủ nghiêm ngặt nguyên tắc:

> **Một lần phân tích nguồn → một Lesson Data Pack → sinh toàn bộ KHDH và học liệu liên kết.**

---

## 1. Chuỗi kết nối thực tế
```text
Google Login 
  → Google AI API Key 
    → Backend API 
      → Database 
        → File Storage 
          → Source Parser 
            → Lesson Data Pack 
              → Blueprint 
                → KHDH V12 
                  → NLS Mapping 
                    → PERIOD_MAP 
                      → Slide 
                        → Phiếu học tập 
                          → Trò chơi tương tác 
                            → Video AI 
                              → Manual Refine 
                                → Teacher Preferences 
                                  → Quality QA 
                                    → Canva Adapter 
                                      → Notebook Adapter 
                                        → Mauga.docx 
                                          → Export Hub
```

---

## 2. Bắt đầu nhanh (Quick Start)

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Kiểm tra kiểm thử tự động
npm test
```

Truy cập ứng dụng: Mở giao diện `index.html` trên trình duyệt web hoặc qua máy chủ Express.  
Kiểm tra Health-check: `/api/health/connections`

---

## 3. Danh mục tài liệu chuyển giao
* [RUN_LOCAL.md](./RUN_LOCAL.md): Hướng dẫn chi tiết chạy cục bộ.
* [CONNECTION_SETUP.md](./CONNECTION_SETUP.md): Hướng dẫn cấu hình kết nối.
* [ENV_EXAMPLE.md](./ENV_EXAMPLE.md): Giải thích các biến môi trường.
* [INTEGRATION_TEST_REPORT.md](./INTEGRATION_TEST_REPORT.md): Báo cáo bằng chứng kiểm thử toàn diện.
* [SECURITY_NOTES.md](./SECURITY_NOTES.md): Ghi chú an toàn bảo mật.
* [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md): Báo cáo chi tiết triển khai hệ thống.
* [17_ANTIGRAVITY_EXECUTE_SYNC_CONNECTIONS_V12_RC2.MD](./17_ANTIGRAVITY_EXECUTE_SYNC_CONNECTIONS_V12_RC2.MD): Đặc tả đồng bộ kết nối.
* [18_HUONG_DAN_KET_NOI_V12_RC2.MD](./18_HUONG_DAN_KET_NOI_V12_RC2.MD): Hướng dẫn kết nối tiếng Việt.
