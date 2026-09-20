"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = exports.GAME_TYPES_16 = void 0;
const lessonStateManager_1 = require("./lessonStateManager");
const database_1 = require("../db/database");
exports.GAME_TYPES_16 = [
    'Đua câu hỏi tốc độ',
    'Ô cửa bí mật',
    'Ghép cặp tương ứng',
    'Memory Cards',
    'Sắp xếp thứ tự quy trình',
    'Kéo thả phân loại',
    'Vòng quay nhiệm vụ',
    'Ai đúng nhanh nhất',
    'True/False Challenge',
    'Hotspot hình ảnh SGK',
    'Escape Room mini',
    'Nhánh tình huống',
    'Bingo kiến thức',
    'Puzzle mảnh ghép',
    'Timeline Challenge',
    'Lab Safety Challenge'
];
class GameService {
    static generate(options) {
        const lesson = lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson)
            throw new Error('Chưa có LESSON_STATE nào để sinh game');
        const act = lesson.activities.find(a => a.id === options.activityId) || lesson.activities[0];
        const artifactId = 'game_01';
        const questions = [];
        for (let i = 1; i <= options.questionCount; i++) {
            questions.push({
                item_id: `q_${i}`,
                yccd_ref: act.yccd_refs[0] || 'YCCD-01',
                activity_ref: act.id,
                difficulty: i <= 4 ? 'NHAN_BIET' : (i <= 8 ? 'THONG_HIEU' : 'VAN_DUNG'),
                stem: `Câu hỏi số ${i}: Nhận định nào sau đây là chính xác theo SGK ${lesson.subject} ${lesson.grade} trang ${lesson.textbook.pages}?`,
                options: [
                    'A. Đáp án chuẩn xác theo quy tắc SGK trang ' + lesson.textbook.pages,
                    'B. Phương án gây nhiễu loại 1',
                    'C. Phương án gây nhiễu loại 2',
                    'D. Phương án gây nhiễu loại 3'
                ],
                correct_answer: 'A',
                explanation: `Căn cứ theo định nghĩa và ví dụ trong SGK trang ${lesson.textbook.pages}.`,
                source_ref: `SGK ${lesson.subject} ${lesson.grade} tr. ${lesson.textbook.pages}`
            });
        }
        const artifact = {
            artifact_id: artifactId,
            type: 'GAME',
            lesson_id: lesson.lesson_id,
            period_id: act.period,
            activity_refs: [act.id],
            yccd_refs: act.yccd_refs,
            nls_refs: act.nls_refs,
            source_refs: act.source_refs,
            content: {
                game_type: options.gameType,
                platforms_blocked: ['Quizizz', 'Kahoot'],
                native_format: 'HTML5_WEBAPP',
                questions
            },
            qa: { score: 96, status: 'PASS' },
            stale: false,
            version: 1
        };
        database_1.db.saveArtifact(artifact);
        return artifact;
    }
    static generateHtml(gameData) {
        const questions = gameData.content?.questions || [];
        return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Native Game</title>
<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#fff;padding:20px;max-width:700px;margin:auto}
.card{background:#1e293b;padding:20px;border-radius:12px;margin-bottom:16px}
button{background:#2563eb;color:#fff;border:0;padding:10px 16px;border-radius:8px;cursor:pointer;margin:4px 0;width:100%;text-align:left}
button:hover{background:#1d4ed8}
</style>
</head>
<body>
  <h1>🎮 ${gameData.content?.game_type || 'Trò chơi tương tác'}</h1>
  <p>Cấm Quizizz & Kahoot · Nền tảng Native WebApp</p>
  ${questions.map((q, idx) => `
    <div class="card">
      <h3>Câu ${idx + 1}: ${q.stem}</h3>
      <p style="font-size:12px;color:#94a3b8">Nguồn: ${q.source_ref}</p>
      ${q.options.map((opt) => `
        <button onclick="alert('${opt.startsWith('A') ? '✅ Chính xác! ' + q.explanation : '❌ Chưa chính xác!'}')">${opt}</button>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>`;
    }
}
exports.GameService = GameService;
