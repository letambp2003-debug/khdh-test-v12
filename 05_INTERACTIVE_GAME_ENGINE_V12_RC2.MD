# TRÒ CHƠI TƯƠNG TÁC ENGINE

## 1. Nguyên tắc
Không tích hợp Quizizz/Kahoot.
Game chạy native trong WebApp hoặc export HTML.

## 2. Nút UI
`TRÒ CHƠI TƯƠNG TÁC`

Panel:
- Tiết.
- Hoạt động.
- YCCĐ.
- NLS.
- Loại game.
- Số câu.
- Mức độ.
- Thời gian/câu.
- Cá nhân/nhóm.
- Có giải thích sau câu hay không.

## 3. Số câu
Dropdown:
`5 | 8 | 10 | 12 | 15 | 20 | 25 | 30 | Tùy chỉnh`

## 4. Mức độ
- Nhận biết.
- Thông hiểu.
- Vận dụng.
- Mix tự động/custom %.

## 5. Game types

```text
1. Đua câu hỏi
2. Ô cửa bí mật
3. Ghép cặp
4. Memory Cards
5. Sắp xếp thứ tự
6. Kéo thả phân loại
7. Vòng quay nhiệm vụ
8. Ai đúng nhanh
9. True/False Challenge
10. Hotspot hình ảnh
11. Escape Room mini
12. Nhánh tình huống
13. Bingo kiến thức
14. Puzzle / Mảnh ghép
15. Timeline Challenge
16. Lab Safety Challenge
```

Engine chọn game theo Subject Profile + Lesson Type.

## 6. Question schema

```yaml
GAME_ITEM:
  item_id:
  yccd_ref:
  activity_ref:
  difficulty:
  type:
  stem:
  options: []
  correct_answer:
  explanation:
  source_ref:
```

Mọi câu phải có `source_ref`.

## 7. NLS
Nếu game phục vụ NLS:
- HS phải thao tác/chọn/phân tích;
- lưu evidence nếu giáo viên bật;
- không chỉ click đoán.
