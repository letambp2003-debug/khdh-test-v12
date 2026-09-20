# ANTIGRAVITY — MASTER EXECUTION PROMPT V12-RC2 WEBAPP PRO

Hãy nâng cấp dự án hiện tại thành **KHDH AUTO V12-RC2 WEBAPP PRO** theo toàn bộ file specification trong thư mục này.

## A. Không làm mockup
Phải tạo ứng dụng chạy được trên localhost, có frontend, backend/local service, persistence, upload, parsing, generation state, artifact hub, QA và export.

## B. Luồng bắt buộc

```text
Google Login
→ Google AI API Key
→ Upload 4 source slots
→ Validate/Index
→ Lesson Catalog
→ Select Lesson
→ Subject Profile
→ Lesson Type
→ Blueprint
→ KHDH
→ NLS Map
→ Period Map
→ Slide Prompts
→ Artifact Hub:
   Worksheet / Interactive Game / AI Video
→ Quality QA
→ Manual Refine
→ Save Preferences
→ Export
```

## C. Source slots — chỉ 4 nhóm

```text
1 PL1_[mon].docx       REQUIRED
2 SGK_[mon].pdf        REQUIRED
3 KHDH cũ              OPTIONAL
4 FORM tổ bộ môn       OPTIONAL
```

Không yêu cầu PPCT riêng.
PL1 là nguồn lấy tên bài, số tiết, PPCT, YCCĐ, NLS.

Nếu chỉ có PL1 + SGK:
`DEFAULT_V12_FORM_MODE`.

Nếu có FORM:
`CUSTOM_FORM_MODE`.

Nếu có KHDH cũ:
auto old-match để quyết định nâng cấp.

## D. SGK fidelity
Trích xuất text + formulas + tables + images + captions + page refs.
Không báo 100% nếu asset extraction chưa đủ.
Hiển thị trạng thái completeness.

## E. Google Auth + API key
- Continue with Google.
- API key nhập riêng.
- validate key.
- không log key;
- không hard-code;
- mã hóa khi lưu;
- production dùng server proxy;
- không có key hợp lệ thì disable AI actions.

## F. KHDH
Sinh đúng V12 hoặc map vào Custom Form.
Nếu có NLS trong PL1, phải map đến activity cụ thể.

## G. Slide
1 period = 1 deck = 15–20 slide.
Tạo cả:
- Canva code-text prompts;
- NotebookLM deck markdown.

## H. Phiếu học tập
Tạo module + UI button:
`PHIẾU HỌC TẬP`.

Có chọn:
- tiết;
- hoạt động;
- YCCĐ;
- loại phiếu;
- số nhiệm vụ;
- mức độ NB/TH/VD;
- tỷ lệ custom;
- NLS/AI;
- student/teacher version.

Không regen KHDH.

## I. Game
Tạo module + UI button:
`TRÒ CHƠI TƯƠNG TÁC`.

Native HTML5/WebApp, không dùng Quizizz/Kahoot.

Game types tối thiểu 16 loại theo spec.
Question count dropdown.
Difficulty mix.
Mọi câu có source_ref và answer validation.

## J. Video AI
Tạo module + UI button:
`TẠO VIDEO AI`.

Có:
- loại video;
- period/activity;
- scene count dropdown;
- ít nhất 15 premium education styles;
- 8s/scene default;
- Vietnamese dialogue <=24 words/scene;
- IMAGE_PROMPT;
- VIDEO_PROMPT;
- CAMERA;
- ACTION;
- STYLE;
- NEGATIVE_PROMPT.

Negative bắt buộc:
`no readable text, no subtitles, no captions, no on-screen text, no UI, no logo, no watermark, no random letters`.

Các loại:
khởi động, tương tác, giải thích, thực hành, thí nghiệm, mô phỏng, STEM, tình huống, tuyên truyền, an toàn, kể chuyện, lịch sử, thao tác, exit.

## K. Manual refine
Mọi panel có nút:
`TINH CHỈNH`.

Có:
- block lock;
- delta regeneration;
- version history;
- undo/rollback;
- toggle `Lưu yêu cầu này thành quy tắc mặc định`;
- scope bài/môn/khối/toàn tài khoản.

Không regen toàn bộ khi chỉ sửa artifact.

## L. Dependency graph
Khi KHDH block thay:
- chỉ artifact phụ thuộc block đó = STALE;
- hiển thị nút `CẬP NHẬT`;
- không tự xóa nội dung cũ.

## M. Statistics
Tạo dashboard:
- KHDH;
- slide;
- phiếu;
- game;
- video;
- source completeness;
- NLS coverage;
- difficulty distribution;
- QA;
- manual edits.

## N. Quality
Tạo nút:
`ĐÁNH GIÁ CHẤT LƯỢNG`.

Scorecard riêng cho:
- KHDH;
- Worksheet;
- Game;
- Video;
- Slide.

Blocking errors không được bù bằng điểm.

## O. Data model
Implement:
`PROJECT`, `LESSON_STATE`, `ARTIFACT`, `TEACHER_PREFERENCE`, version history, dependency graph.

## P. UI
Sidebar đúng file `11_UI_UX_FLOW_V12_RC2.MD`.
3 mode:
Cơ bản / Nâng cao / Chuyên gia.

## Q. Tech
Ưu tiên:
- React + TypeScript + Vite;
- backend/local service Node/TypeScript hoặc Python nếu DOCX/PDF cần;
- SQLite/local DB cho dev;
- adapter layer cho production DB;
- typed schemas;
- unit + integration tests.

Không phụ thuộc công cụ UI bên ngoài cho game.

## R. Security
Không log:
- API key;
- OAuth token;
- raw user secrets.

Sanitize uploads.
Validate MIME/type/size.
No executable macros.

## S. Build milestones
1. scaffold/auth;
2. source ingestion;
3. lesson data pack;
4. blueprint/KHDH;
5. NLS/period/slide;
6. worksheet;
7. game;
8. video;
9. manual refine/preferences;
10. stats/quality;
11. template/export;
12. tests/build.

Không dừng hỏi lại nếu không có blocker.

## T. Deliverables
Phải tạo:

```text
README.md
RUN_LOCAL.md
IMPLEMENTATION_REPORT.md
TEST_REPORT.md
SECURITY_NOTES.md
src/
server/
agents/
schemas/
tests/
storage/
docs/
```

Chạy:
- typecheck;
- lint;
- build;
- tests.

Nếu thiếu dependency môi trường:
`BLOCKED: ...`
nhưng tiếp tục các phần không phụ thuộc.
