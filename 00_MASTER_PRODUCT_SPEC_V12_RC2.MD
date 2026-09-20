# KHDH AUTO V12-RC2 WEBAPP PRO

## 1. Mục tiêu

WebApp dùng một bộ nguồn duy nhất để tạo và liên kết:

```text
KHDH / KHBG
├── Slide Prompt theo từng tiết
├── Phiếu học tập
├── Trò chơi tương tác
├── Video AI
├── Canva Prompt
├── NotebookLM Slide Deck
├── Evidence Map
├── NLS/AI Map
├── Thống kê
└── Quality QA
```

Tất cả học liệu con phải sinh từ cùng `LESSON_DATA_PACK`, không sinh rời khỏi bài học.

## 2. Nguồn đầu vào — chỉ 4 nhóm

```text
1. PL1_[mon].docx              BẮT BUỘC
2. SGK_[mon].pdf               BẮT BUỘC
3. KHDH/KHBG cũ                TÙY CHỌN
4. FORM của tổ bộ môn          TÙY CHỌN
```

### PL1 phải đọc
- tên bài;
- chương/chủ đề;
- số tiết;
- tiết PPCT nếu có;
- tuần nếu có;
- yêu cầu cần đạt;
- chỉ báo/yêu cầu năng lực số.

### SGK phải đọc
- nội dung;
- câu hỏi;
- bài tập;
- bảng;
- dữ liệu;
- công thức;
- hình ảnh;
- chú thích;
- trình tự bài;
- locator trang/hình.

Không báo "100%" nếu parser chưa xác nhận đủ text/asset. Thiếu dữ liệu dùng:
`SOURCE_ASSET_INCOMPLETE`.

### KHDH cũ
Chỉ dùng để nâng cấp.

### FORM tổ bộ môn
Nếu có: `CUSTOM_FORM_MODE`.
Nếu không có: `DEFAULT_V12_FORM_MODE`.

## 3. Logic nguồn

```text
Có PL1 + SGK
→ SOẠN MỚI
→ DEFAULT FORM V12

Có PL1 + SGK + FORM
→ SOẠN MỚI
→ CUSTOM FORM

Có PL1 + SGK + KHDH cũ
→ NÂNG CẤP
→ DEFAULT FORM V12

Có đủ 4 nguồn
→ NÂNG CẤP
→ CUSTOM FORM

Thiếu PL1 hoặc SGK
→ SOURCE_REQUIRED
```

## 4. Single Source of Truth

```yaml
LESSON_DATA_PACK:
  lesson_id:
  subject:
  grade:
  chapter:
  lesson_title:
  ppct: []
  weeks: []
  total_periods:
  yccd: []
  digital_competency_indicators: []
  knowledge_units: []
  textbook_pages: []
  textbook_assets: []
  old_khdh:
  form_profile:
  subject_profile:
  lesson_type:
  source_links: []
  source_qa:
```

## 5. Pipeline

```text
LOGIN GOOGLE
→ API KEY
→ UPLOAD SOURCES
→ SOURCE VALIDATION
→ SOURCE INDEX
→ LESSON CATALOG
→ SELECT LESSON
→ SUBJECT PROFILE
→ LESSON TYPE
→ LESSON BLUEPRINT
→ BLUEPRINT QA
→ KHDH/KHBG
→ NLS/AI MAPPING
→ TIME_MAP / PERIOD_MAP
→ SLIDE PROMPTS
→ ARTIFACT HUB
    ├─ Phiếu học tập
    ├─ Trò chơi tương tác
    └─ Video AI
→ QUALITY QA
→ MANUAL REFINE / DELTA REGEN
→ EXPORT / SAVE
```

## 6. KHDH mặc định V12

```text
I. MỤC TIÊU
1. Kiến thức
2. Năng lực
3. Phẩm chất

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU

III. TIẾN TRÌNH DẠY HỌC
A. KHỞI ĐỘNG
B. HÌNH THÀNH KIẾN THỨC
C. LUYỆN TẬP
D. VẬN DỤNG

IV. HƯỚNG DẪN VỀ NHÀ
```

Không tạo mục V. Kế hoạch đánh giá.

- Kiến thức = danh từ/cụm danh từ + từ khóa.
- Năng lực = hành động quan sát được.
- Phẩm chất = tên phẩm chất + hành vi cụ thể.

## 7. Năng lực số

Nếu PL1 có chỉ báo/yêu cầu NLS:

```text
PL1 NLS
→ OBJECTIVE NLS EXPRESSION
→ ACTIVITY MAPPING
→ STUDENT DIGITAL ACTION
→ TOOL
→ PRODUCT
→ VERIFICATION
→ EVIDENCE MAP
```

Không được chỉ ghi NLS ở mục tiêu rồi không triển khai trong hoạt động.

Không sử dụng Quizizz hoặc Kahoot.

Có thể dùng:
- AI video;
- interactive video;
- native web game;
- chatbot;
- simulation;
- digital worksheet;
- image/video analysis;
- collaborative digital product;
- data visualization;
- AI verification activity.

## 8. Artifact Hub

Sau KHDH/PERIOD_MAP bật:

```text
[ PHIẾU HỌC TẬP ]
[ TRÒ CHƠI TƯƠNG TÁC ]
[ TẠO VIDEO AI ]
```

Mỗi module tự nhận:
- bài;
- tiết;
- hoạt động;
- YCCĐ;
- mức độ;
- sản phẩm;
- NLS;
- nguồn SGK.

## 9. Delta Regeneration

Không chạy lại KHDH khi chỉ sửa artifact.

Ví dụ:
```text
Sửa B2
→ B2 update
→ artifact phụ thuộc B2 = STALE
→ gợi ý cập nhật đúng artifact liên quan
```

## 10. Release
Tên bản:
`V12-RC2 WEBAPP PRO`.

Chỉ đổi thành `V12 FINAL` sau nghiệm thu đa môn.
