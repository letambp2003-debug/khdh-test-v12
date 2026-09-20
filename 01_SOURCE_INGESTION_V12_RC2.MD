# SOURCE INGESTION V12-RC2

## 1. Bốn slot upload cố định

```yaml
SOURCE_SLOTS:
  pl1:
    required: true
    pattern: "PL1_*.docx"
  textbook:
    required: true
    pattern: "SGK_*.pdf"
  old_khdh:
    required: false
    pattern: "*.docx"
  department_form:
    required: false
    pattern: "*.docx"
```

Không bắt người dùng upload PPCT riêng nếu PL1 đã chứa PPCT.

## 2. PL1 Extractor

```yaml
PL1_INDEX:
  subject:
  grade:
  lessons:
    - title:
      chapter:
      period_count:
      ppct: []
      week:
      yccd: []
      nls_indicators: []
      source_anchor:
```

## 3. SGK Extractor

```yaml
SGK_LESSON_RECORD:
  title:
  pages:
  text_blocks: []
  formulas: []
  tables: []
  questions: []
  exercises: []
  image_assets:
    - asset_id:
      page:
      caption:
      source_region:
      extraction_status:
```

Nếu ảnh/text không lấy được:
`SOURCE_ASSET_INCOMPLETE`.

Không thay bằng ảnh AI rồi coi là ảnh SGK.

## 4. KHDH cũ

```yaml
OLD_KHDH_MATCH:
  status: OLD_CONFIRMED | OLD_POSSIBLE | NEW | CONFLICT
  source_file:
  matched_lesson:
  confidence:
```

## 5. Form tổ bộ môn

Parse:
- heading hierarchy;
- sections;
- table structure;
- fonts;
- margins;
- line spacing;
- borders;
- header/footer;
- placeholders.

Canonical internal role:
`DEPARTMENT_FORM`.

Nếu người dùng muốn dùng làm template Word cố định:
canonical copy = `Mauga.docx`.

## 6. Source completeness

Dashboard:

```text
PL1       ✅
SGK       ✅
KHDH CŨ   ⚪ tùy chọn
FORM      ✅/⚪
SGK TEXT  100%/INCOMPLETE
SGK IMAGE 100%/INCOMPLETE
```

Chỉ hiện 100% khi QA nguồn thực sự đạt.
