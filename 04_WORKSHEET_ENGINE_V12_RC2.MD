# PHIẾU HỌC TẬP ENGINE

## 1. Nút UI
`PHIẾU HỌC TẬP`

Khi bấm, mở panel:
- Chọn tiết.
- Chọn hoạt động.
- Chọn YCCĐ.
- Chọn mục tiêu.
- Chọn mức độ.
- Chọn loại phiếu.
- Số câu/nhiệm vụ.
- Có/không tích hợp NLS/AI.
- Layout/style.
- Xuất PNG/PDF/Markdown/Word-ready content.

## 2. Loại phiếu

```text
01 KHỞI ĐỘNG
02 KHÁM PHÁ
03 HÌNH THÀNH KIẾN THỨC
04 LUYỆN TẬP
05 VẬN DỤNG
06 THỰC HÀNH / THÍ NGHIỆM
07 ĐỌC HIỂU / PHÂN TÍCH TƯ LIỆU
08 DỰ ÁN / STEM
09 TỰ HỌC
10 EXIT TICKET
```

## 3. Mức độ

```text
NHẬN BIẾT
THÔNG HIỂU
VẬN DỤNG
```

Cho phép Auto theo Activity hoặc Custom tỷ lệ.

Ví dụ:

```yaml
difficulty_mix:
  nhan_biet: 30
  thong_hieu: 40
  van_dung: 30
```

## 4. Data link

```yaml
WORKSHEET_REQUEST:
  lesson_id:
  period_id:
  activity_refs: []
  yccd_refs: []
  nls_refs: []
  source_refs: []
  worksheet_type:
  item_count:
  difficulty_mix:
  answer_mode: HIDE | TEACHER_ONLY
```

## 5. Không lộ lời giải
Bản học sinh:
- không đáp án;
- không gợi ý quá mức.

Bản giáo viên có thể sinh:
- đáp án;
- rubric;
- hướng dẫn chấm.

## 6. Toán/hình
- công thức canonical;
- hình chính xác dùng TikZ;
- không dùng ảnh AI thay hình cần chính xác.
