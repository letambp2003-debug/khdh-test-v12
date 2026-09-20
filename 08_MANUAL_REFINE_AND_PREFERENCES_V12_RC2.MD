# TINH CHỈNH BẰNG TAY + QUY TẮC GIÁO VIÊN

## 1. Nút UI
`TINH CHỈNH`

Cho phép sửa:
- KHDH;
- từng hoạt động;
- từng slide;
- từng phiếu;
- từng câu game;
- từng cảnh video;
- prompt;
- mức độ;
- số câu;
- thời lượng.

## 2. Lock
Người dùng có thể:
`LOCK CONTENT`.

Phần đã khóa không được regen.

## 3. Delta Regeneration

```text
Sửa B2
→ B2 update
→ Artifact phụ thuộc B2 = STALE
→ gợi ý cập nhật chỉ artifact liên quan
```

Không chạy lại toàn bộ KHDH.

## 4. Lưu yêu cầu làm quy tắc tiếp theo

UI toggle:
`[ ] Lưu yêu cầu này thành quy tắc mặc định`

Scope:
```text
CHỈ BÀI NÀY
MÔN NÀY
KHỐI NÀY
TẤT CẢ BÀI CỦA TÔI
```

Schema:

```yaml
TEACHER_PREFERENCE:
  preference_id:
  user_id:
  scope:
  subject:
  grade:
  rule:
  priority:
  enabled:
  created_at:
```

Priority:
`TEACHER_PREFERENCE > AI_DEFAULT`

Nhưng không vượt:
- nguồn chương trình;
- SGK;
- safety;
- conflict rules.

## 5. Version history
Mỗi edit lưu:
- version;
- user;
- timestamp;
- changed blocks;
- reason.

Có undo/rollback.
