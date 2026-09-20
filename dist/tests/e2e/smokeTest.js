"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const healthService_1 = require("../../server/services/healthService");
const authService_1 = require("../../server/services/authService");
const geminiService_1 = require("../../server/services/geminiService");
const lessonStateManager_1 = require("../../server/services/lessonStateManager");
const worksheetService_1 = require("../../server/services/worksheetService");
const gameService_1 = require("../../server/services/gameService");
const videoAiService_1 = require("../../server/services/videoAiService");
const qualityQaService_1 = require("../../server/services/qualityQaService");
console.log('====================================================');
console.log('🚀 CHẠY E2E SMOKE TEST (KIỂM THỬ KHÓI ĐẦU CUỐI TOÀN HỆ THỐNG)');
console.log('====================================================\n');
let stepsPassed = 0;
function step(name, fn) {
    try {
        fn();
        stepsPassed++;
        console.log(`  [Step ${stepsPassed}] ✅ ${name}`);
    }
    catch (err) {
        console.error(`  [Step ${stepsPassed + 1}] ❌ ${name}`);
        console.error(`     Error: ${err.message}`);
        process.exit(1);
    }
}
// Step 1: Health check
step('1. Kiểm tra Health-check hệ thống và các kết nối thực tế', () => {
    const health = healthService_1.HealthCheckService.checkAll();
    assert_1.default.ok(health.connections.database.connected, 'Database phải sẵn sàng');
    assert_1.default.ok(health.connections.file_storage.connected, 'Storage phải sẵn sàng');
    assert_1.default.ok(health.connections.source_parsers.connected, 'Parsers phải sẵn sàng');
});
// Step 2: Google Authentication
step('2. Đăng nhập người dùng Google OAuth', () => {
    const user = authService_1.AuthService.loginGoogle('Trần Văn Nam', 'nguyenvannam.toan8@edu.vn', 'TEACHER');
    assert_1.default.strictEqual(user.name, 'Trần Văn Nam');
    assert_1.default.strictEqual(authService_1.AuthService.isAuthenticated(), true);
});
// Step 3: Configure Gemini API Key
step('3. Cấu hình và kiểm tra Google AI (Gemini) API Key', () => {
    const res = geminiService_1.GeminiService.setApiKey('AIzaSySmokeTestKey_ValidFormat_99999');
    assert_1.default.strictEqual(res.status, 'VALID');
    assert_1.default.strictEqual(geminiService_1.GeminiService.isReady(), true);
});
// Step 4: Load Lesson Data Pack into LESSON_STATE
step('4. Khởi tạo Lesson Data Pack vào LESSON_STATE', () => {
    const sample = {
        lesson_id: 'MATH8_SMOKE_TEST',
        subject: 'Toán',
        grade: 8,
        chapter: 'Chương I. Đa thức',
        lesson_title: 'Đa thức',
        total_periods: 2,
        ppct: [5, 6],
        weeks: [3],
        yccd: [
            { id: 'YCCD-01', text: 'Nhận biết khái niệm đa thức', level: 'NHAN_BIET' },
            { id: 'YCCD-02', text: 'Thu gọn đa thức', level: 'THONG_HIEU' }
        ],
        digital_competency_indicators: [
            {
                id: 'NLS-01',
                indicator: 'Sử dụng chatbot tra cứu và đối chiếu SGK',
                target_activity: 'act_b2',
                tool: 'AI Assistant',
                student_action: 'Nhập biểu thức và kiểm chứng',
                product: 'Bảng đối chiếu',
                evidence: 'Phiếu học tập'
            }
        ],
        subject_profile: 'MATH (Toán học)',
        lesson_type: 'NEW_KNOWLEDGE',
        form_mode: 'DEFAULT_V12_FORM_MODE',
        textbook: { book: 'SGK Toán 8', pages: '11–14', assets: [] },
        activities: [
            {
                id: 'act_b2', code: 'B2', period: 1, title: 'Thu gọn đa thức', time: 18,
                yccd_refs: ['YCCD-02'], nls_refs: ['NLS-01'], student_task: 'Thu gọn đa thức và đối chiếu',
                teacher_actions: 'Hướng dẫn đối chiếu', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập',
                digital_tool: 'AI Assistant', source_refs: ['SGK tr.12'], locked: false
            }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
    };
    lessonStateManager_1.LessonStateManager.setActiveState(sample);
    const active = lessonStateManager_1.LessonStateManager.getActiveState();
    assert_1.default.strictEqual(active?.lesson_id, 'MATH8_SMOKE_TEST');
});
// Step 5: Generate Artifact Hub modules
step('5. Sinh Phiếu học tập, Game native 16 loại và Video AI <= 24 từ', () => {
    const ws = worksheetService_1.WorksheetService.generate({ period: 1, activityId: 'act_b2', worksheetType: 'Khám phá', itemCount: 4, isTeacherVersion: true });
    assert_1.default.ok(ws.content.includes('PHIẾU HỌC TẬP'));
    const game = gameService_1.GameService.generate({ gameType: 'Ô cửa bí mật', questionCount: 5, activityId: 'act_b2', difficulty: 'mix' });
    assert_1.default.strictEqual(game.content.platforms_blocked[0], 'Quizizz');
    assert_1.default.strictEqual(game.content.platforms_blocked[1], 'Kahoot');
    const video = videoAiService_1.VideoAiService.generate({ videoType: '01. Video Khởi động', sceneCount: 3, style: 'STYLE_02 Premium 3D', activityId: 'act_b2' });
    assert_1.default.strictEqual(video.content.scenes.length, 3);
    for (const scene of video.content.scenes) {
        assert_1.default.ok(scene.word_count <= 24, `Số từ lời thoại phải <= 24: ${scene.word_count}`);
    }
});
// Step 6: Delta Refine and Stale Tagging
step('6. Thực hiện Delta Refine và xác nhận cờ STALE', () => {
    const result = lessonStateManager_1.LessonStateManager.updateActivity('act_b2', {
        student_task: 'Thảo luận nhóm 4 học sinh và đối chiếu bảng phụ'
    });
    assert_1.default.strictEqual(result.updated, true);
    assert_1.default.ok(result.staleDependents.includes('worksheet_01'));
});
// Step 7: Run Quality QA Scorecard
step('7. Kiểm định QA chất lượng KHDH đạt chuẩn 100 điểm', () => {
    const audit = qualityQaService_1.QualityQaService.auditKhdh();
    assert_1.default.ok(audit.totalScore >= 80, `Điểm QA: ${audit.totalScore}/100`);
    assert_1.default.strictEqual(audit.passed, true);
    assert_1.default.strictEqual(audit.blockingErrors.length, 0);
});
console.log('\n🎉 E2E SMOKE TEST HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
process.exit(0);
