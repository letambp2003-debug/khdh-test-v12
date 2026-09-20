---
name: token-optimizer
description: Áp dụng cho mọi yêu cầu viết code, chỉnh sửa file, refactor hoặc trao đổi kỹ thuật trong dự án edu-quiz. Chuẩn hóa quy trình làm việc (tiếng Việt, lint một lần, không tự build/deploy), tối ưu token, và nắm hiện trạng dự án (React + Vite + MUI + Firebase + Gemini) để thêm feature nhất quán.
---

# HƯỚNG DẪN TỐI ƯU TOKEN & QUY CHUẨN LÀM VIỆC DỰ ÁN

## 1. Nguyên Tắc Tối Ưu Token (Token Optimization)
* **Giao tiếp cực ngắn:** 
  - Đi thẳng vào vấn đề. Không chào hỏi xã giao ("Chào bạn", "Tôi có thể giúp gì..."), không chúc tụng, không tóm tắt hay giải thích lại code trừ khi được yêu cầu.
  - Phản hồi bằng Markdown ngắn gọn, trực diện.
* **Chỉnh sửa code tối thiểu:**
  - Tuyệt đối KHÔNG viết lại hoặc hiển thị toàn bộ nội dung file. Chỉ cung cấp đoạn code thay đổi (diff) hoặc sử dụng các công cụ thay đổi vùng nhỏ (`replace_file_content`).
  - Khi viết code, không tự ý thêm ghi chú (comments) hoặc code mẫu (boilerplate) dư thừa.
* **Đọc file thông minh:**
  - Khi đọc file lớn, luôn chỉ định dòng bắt đầu và dòng kết thúc (`StartLine`, `EndLine`) quanh khu vực cần xử lý để tránh nạp toàn bộ file vào ngữ cảnh (context).
  - Không tự ý đọc các file không liên quan trực tiếp đến task.

## 2. Ngôn Ngữ & Giao Tiếp Dễ Hiểu (Bổ sung Dev Không Chuyên)
* **Giao tiếp với Dev không có kỹ năng lập trình:**
  - Người dùng có thể là người không chuyên về code. Do đó, khi thảo luận, giải thích hoặc hướng dẫn kiểm tra, hãy dùng ngôn ngữ phổ thông, dễ hiểu. Tránh các thuật ngữ kỹ thuật sâu (ví dụ: thay vì giải thích "async/await, state, hooks", hãy tập trung giải thích "cách dữ liệu hiển thị, nút bấm hoạt động ra sao").
  - Hướng dẫn người dùng kiểm tra kết quả bằng các bước trực quan trên màn hình (ví dụ: "Bạn hãy mở trang X, click vào nút Y và kiểm tra xem bảng Z có hiển thị không").
* **Xác nhận thông tin:** Yêu cầu chưa rõ hoặc thiếu thông tin → **HỎI LẠI trước**, đừng đoán mò rồi làm sai.
* **Ngôn ngữ chung:** Luôn dùng **tiếng Việt** để trao đổi, giải thích. Giữ nguyên **tiếng Anh** cho tên hàm, tên biến, tên file, câu lệnh lập trình hoặc logs nếu thấy tự nhiên hơn.

## 3. Quy Trình Chạy Lệnh & Git
* **Lint & Typecheck:** Chỉ chạy lệnh kiểm tra lỗi kiểu và cú pháp (`npm run lint`) **MỘT LẦN DUY NHẤT** khi đã hoàn tất toàn bộ cụm thay đổi, trước khi báo cáo hoàn thành. Bỏ qua nếu chỉ đổi chữ/màu/comment không ảnh hưởng tới logic/type. Không chạy sau mỗi lần sửa đổi nhỏ.
* **Build ứng dụng:** KHÔNG chạy `npm run build` hoặc build production sau mỗi lần sửa (gây lãng phí tài nguyên và thời gian). Chỉ thực hiện build khi user yêu cầu đích danh.
* **Lệnh Git & Deploy nguy hiểm:** KHÔNG tự chạy các lệnh Git có tính phá hủy (như `git reset --hard`, `git checkout --`, `git push --force`) hoặc tự động build/deploy hosting. Những việc này để user tự thao tác.

## 4. Phương Pháp Tiếp Cận Task
* **Lập kế hoạch trước:** Đối với task lớn hoặc mơ hồ: Luôn đưa ra một kế hoạch ngắn gọn định làm gì trước khi code để thống nhất hướng đi với user, tránh làm sai hướng phải viết lại code.
* **Sửa đúng trọng tâm:** Ưu tiên sửa đúng file/màn hình user chỉ định; chỉ tìm kiếm rộng (grep) hoặc đọc lan man khi thực sự chưa xác định được vị trí code liên quan.

## 5. Hiện Trạng Dự Án (Mặc định — KHÔNG phải xiềng)
Dự án hiện tại: **Edu Quiz** — Nền tảng tạo quiz + trò chơi học tập tích hợp AI (Gemini).

> Phần này mô tả dự án ĐANG như thế nào, để bạn (AI) khỏi phải dò lại toàn bộ code mỗi phiên → tiết kiệm token.
> Đây là MẶC ĐỊNH, không phải ràng buộc: nếu user muốn đổi UI / Auth / nhà cung cấp AI / cấu trúc, cứ làm theo user — chỉ cần báo trước là sẽ lệch khỏi mô tả dưới đây. Khi thêm code mới mà user không nói khác thì bám stack hiện tại cho nhất quán.

### Công Nghệ Đang Dùng (đổi được nếu user yêu cầu):
* **Framework:** React 19 + Vite 6 + TypeScript
* **UI:** MUI v9 (`@mui/material`) + Tailwind v4 + emotion
* **Icons / Animation / Charts:** `lucide-react`, `@mui/icons-material` / `motion` / `recharts`
* **Backend:** Firebase (Auth + Firestore)
* **Auth:** Firebase Auth: Email/Password + Google Sign-In
* **AI:** `@google/genai` (Gemini), key qua `GEMINI_API_KEY` ở `.env.local`
* **Form:** `react-hook-form` + `zod`
* **Routing:** `react-router-dom` v7

### Cấu Trúc & Quy Ước Code:
* **src/core:** theme/AppThemeProvider, contexts/AuthContext
* **src/lib:** firebase.ts (khởi tạo Firebase: auth, db)
* **src/services:** gọi Firestore/Storage (ví dụ: `classroomService.ts`)
* **src/features:** module theo tính năng (ví dụ: `dashboard/components/*`)
* **src/components:** layout dùng chung (MainLayout, Header)
* **src/guards:** ProtectedRoute
* **src/pages:** trang ghép nối, chia theo role: `teacher/`, `student/`
* **src/App.tsx:** khai báo toàn bộ `<Routes>`
* **Quy tắc Import:** Chỉ import 1 chiều: `pages` → `features/components` → `core/services/lib`.
* **Logic Firestore/AI:** Đặt hoàn toàn trong `services/`, **KHÔNG** viết trực tiếp trong component (component chỉ gọi hàm trong service).
* **Quy tắc đặt tên:** `*Service.ts` (gọi backend), component React `PascalCase.tsx`, trang trong `pages/`.

### Quy Trình Thêm Feature/Trang Mới:
1. Đặt component/trang mới đúng chỗ: trang → `pages/` (theo role nếu có), khối tính năng → `features/{tên}/components/`.
2. Tách phần gọi Firestore/AI ra hàm trong `services/`, component chỉ gọi hàm đó.
3. Nối route trong `App.tsx`, bọc `<ProtectedRoute allowedRoles={[...]}>` nếu trang cần đăng nhập, thường bọc thêm `<MainLayout />`.
4. Cần UI → dùng MUI cho khớp theme; layout nhanh có thể dùng Tailwind class.
5. Chạy `npm run lint` kiểm tra sạch trước khi báo xong.

### Các Điểm Cần Lưu Ý Tránh Vấp Lỗi:
* **Auth:** Nằm ở `core/contexts/AuthContext.tsx`. `useAuth()` trả về `{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }`. Role gồm `'Teacher' | 'Student'`. Biến module-level `pendingProfile` và `isRegistering` xử lý race condition — không xóa khi dọn dẹp code.
* **MUI v9 Grid:** Dùng thuộc tính `size={{ xs, sm, md }}` (không dùng `item` hay `xs=` kiểu cũ).
* **MUI Theme:** Ở `core/theme/AppThemeProvider.tsx` với màu chủ đạo Indigo `#4f46e5`, có sẵn dark/light. Thêm component nên theo phong cách này cho đồng bộ (không bắt buộc — user đổi theme/màu được).
* **Cấu hình Vite:** ĐỪNG sửa `vite.config.ts` phần `hmr`/`watch` (do AI Studio điều khiển, sửa gây nhấp nháy khi edit).
* **Deploy lên Netlify:** Học viên build bằng `npm run build` và kéo thả thư mục `dist/`. File `public/_redirects` (có nội dung `/*  /index.html  200`) là **bắt buộc** để tránh lỗi 404 khi F5 trang con.
* **Firebase config:** Được HARDCODE sẵn ở `src/lib/firebase.ts` để chạy ngay không cần env. Nếu trắng trang, check F12 Console lỗi thực tế thay vì đi sửa Firebase config.
* **Biến môi trường AI:** `.env.local` chứa `GEMINI_API_KEY`. Thiếu key thì phần AI lỗi, các tính năng khác vẫn chạy bình thường. ĐỪNG commit `.env.local`.
* **PWA:** Dự án **KHÔNG** phải PWA. ĐỪNG tự động cài thêm `vite-plugin-pwa`, `workbox` hoặc đăng ký service worker để tránh lỗi cache trình duyệt làm hiển thị trang cũ.
