# VIDEO AI ENGINE V12-RC2

## 1. Nút UI
`TẠO VIDEO AI`

Bộ lọc:
- Tiết.
- Hoạt động.
- YCCĐ.
- Loại video.
- Số cảnh.
- Phong cách.
- Có nhân vật hay không.
- Có lời thoại hay không.
- Mức độ chân thực.
- Tỉ lệ 16:9 / 9:16 / 1:1.

## 2. Loại video

```text
01 VIDEO KHỞI ĐỘNG
02 VIDEO NÊU VẤN ĐỀ
03 VIDEO TƯƠNG TÁC
04 VIDEO GIẢI THÍCH KHÁI NIỆM
05 VIDEO THỰC HÀNH
06 VIDEO THÍ NGHIỆM
07 VIDEO MÔ PHỎNG
08 VIDEO STEM
09 VIDEO TÌNH HUỐNG
10 VIDEO TUYÊN TRUYỀN / GIÁO DỤC
11 VIDEO AN TOÀN
12 VIDEO KỂ CHUYỆN
13 VIDEO LỊCH SỬ / TÁI HIỆN
14 VIDEO HƯỚNG DẪN THAO TÁC
15 VIDEO EXIT / CỦNG CỐ
```

## 3. Số cảnh
Dropdown:
`3 | 4 | 5 | 6 | 8 | 10 | 12 | 15 | 20 | Tùy chỉnh`

Mặc định:
`8 giây / cảnh`.

## 4. Phong cách video giáo dục cao cấp

```text
STYLE_01 Cinematic Classroom
STYLE_02 Premium 3D Educational Animation
STYLE_03 Clean 2D Motion Graphic
STYLE_04 Realistic Documentary
STYLE_05 Science Lab Cinematic
STYLE_06 STEM Tech Futuristic
STYLE_07 Storybook Educational
STYLE_08 Historical Reenactment
STYLE_09 Minimal Academic Explainer
STYLE_10 Friendly School Life
STYLE_11 Safety Training Simulation
STYLE_12 Interactive Scenario Film
STYLE_13 Infographic Motion Design
STYLE_14 Nature & Field Study Documentary
STYLE_15 Maker Lab / Engineering Workshop
```

## 5. Scene schema

```text
[SCENE_01]
PURPOSE:
SOURCE_REF:
DURATION: 8s

IMAGE_PROMPT:
...

VIDEO_PROMPT:
...

DIALOGUE_VI:
"..."

STYLE:
...

CAMERA:
...

ACTION:
...

NEGATIVE_PROMPT:
no readable text, no subtitles, no captions, no on-screen text,
no UI, no interface, no logo, no watermark, no random letters,
no distorted hands, no duplicated people
[/SCENE_01]
```

## 6. Lời thoại
- tiếng Việt;
- tối đa 24 từ/cảnh;
- khớp 8 giây;
- tự nhiên;
- đúng đối tượng học sinh;
- không chứa kiến thức ngoài nguồn.

Nếu >24 từ:
`DIALOGUE_TOO_LONG`.

## 7. Video thí nghiệm
Bắt buộc:
- đúng quy trình nguồn;
- an toàn;
- không bịa kết quả;
- phân biệt mô phỏng và thí nghiệm thật.

## 8. Video tuyên truyền
- tình huống an toàn, phù hợp lứa tuổi;
- không gây sốc;
- kết thúc bằng hành vi tích cực;
- không hiển thị text rác.

## 9. Interactive video
Có thể tạo:
- điểm dừng câu hỏi;
- nhánh lựa chọn;
- prediction checkpoint;
- pause-and-discuss;
- verify-after-watch.

Các điểm tương tác lưu riêng, không chèn chữ vào prompt hình nếu không cần.
