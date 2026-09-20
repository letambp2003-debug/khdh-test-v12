"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const healthService_1 = require("../../server/services/healthService");
const geminiService_1 = require("../../server/services/geminiService");
const lessonStateManager_1 = require("../../server/services/lessonStateManager");
const worksheetService_1 = require("../../server/services/worksheetService");
const gameService_1 = require("../../server/services/gameService");
const videoAiService_1 = require("../../server/services/videoAiService");
const slideService_1 = require("../../server/services/slideService");
const database_1 = require("../../server/db/database");
console.log('====================================================');
console.log('🔗 CHẠY BỘ INTEGRATION TESTS (KIỂM THỬ TÍCH HỢP HỆ THỐNG)');
console.log('====================================================\n');
let totalTests = 0;
let passedTests = 0;
function it(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    }
    catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
    }
}
// 1. Health check & DISCONNECTED reason verification
it('HealthCheck: Kiểm tra kết nối thật và báo lỗi DISCONNECTED nếu thiếu API Key', () => {
    // Test when key is empty
    geminiService_1.GeminiService.setApiKey('');
    const health = healthService_1.HealthCheckService.checkAll();
    assert_1.default.strictEqual(health.connections.database.connected, true, 'Database phải CONNECTED');
    assert_1.default.strictEqual(health.connections.file_storage.connected, true, 'File Storage phải CONNECTED');
    assert_1.default.strictEqual(health.connections.source_parsers.connected, true, 'Parsers phải CONNECTED');
    // Verify Gemini Key is DISCONNECTED with exact reason
    assert_1.default.strictEqual(health.connections.gemini_api.connected, false, 'Gemini Key phải DISCONNECTED khi rỗng');
    assert_1.default.ok(health.connections.gemini_api.message?.includes('DISCONNECTED'), 'Thông báo phải chứa DISCONNECTED');
    // Test when valid key is provided
    geminiService_1.GeminiService.setApiKey('AIzaSyTestIntegrationKey_ValidFormat_12345');
    const health2 = healthService_1.HealthCheckService.checkAll();
    assert_1.default.strictEqual(health2.connections.gemini_api.connected, true, 'Gemini Key phải CONNECTED khi có key hợp lệ');
});
// 2. Single Source of Truth across all Artifacts
it('Single Source of Truth: Toàn bộ KHDH, Slide, Phiếu, Game, Video dùng chung LESSON_STATE', () => {
    lessonStateManager_1.LessonStateManager.setActiveState({
        lesson_id: 'MATH8_INTEGRATION_01',
        subject: 'Toán',
        grade: 8,
        chapter: 'Chương I',
        lesson_title: 'Đa thức',
        total_periods: 2,
        ppct: [5, 6],
        weeks: [3],
        yccd: [{ id: 'YCCD-01', text: 'Nhận biết đa thức', level: 'NHAN_BIET' }],
        digital_competency_indicators: [{
                id: 'NLS-01',
                indicator: 'Tra cứu đối chiếu SGK',
                target_activity: 'act_b2',
                tool: 'AI Assistant',
                student_action: 'Nhập biểu thức và kiểm chứng',
                product: 'Phiếu đối chiếu',
                evidence: 'Biên bản có chữ ký'
            }],
        subject_profile: 'MATH',
        lesson_type: 'NEW_KNOWLEDGE',
        form_mode: 'DEFAULT_V12_FORM_MODE',
        textbook: { book: 'SGK Toán 8', pages: '11–14', assets: [] },
        activities: [
            {
                id: 'act_b2', code: 'B2', period: 1, title: 'Thu gọn đa thức', time: 18,
                yccd_refs: ['YCCD-01'], nls_refs: ['NLS-01'], student_task: 'Thu gọn đa thức và đối chiếu',
                teacher_actions: 'Hướng dẫn', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập',
                digital_tool: 'AI Assistant', source_refs: ['SGK tr.12'], locked: false
            }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
    });
    const ws = worksheetService_1.WorksheetService.generate({ period: 1, activityId: 'act_b2', worksheetType: 'Khám phá', itemCount: 4, isTeacherVersion: false });
    const game = gameService_1.GameService.generate({ gameType: 'Ô cửa bí mật', questionCount: 5, activityId: 'act_b2', difficulty: 'mix' });
    const video = videoAiService_1.VideoAiService.generate({ videoType: '02. Nêu vấn đề', sceneCount: 4, style: 'STYLE_02', activityId: 'act_b2' });
    const slide = slideService_1.SlideService.generate(1);
    // Assert all artifacts share the exact same lesson_id
    assert_1.default.strictEqual(ws.lesson_id, 'MATH8_INTEGRATION_01');
    assert_1.default.strictEqual(game.lesson_id, 'MATH8_INTEGRATION_01');
    assert_1.default.strictEqual(video.lesson_id, 'MATH8_INTEGRATION_01');
    assert_1.default.strictEqual(slide.lesson_id, 'MATH8_INTEGRATION_01');
    // Assert all artifacts reference the exact same textbook pages
    assert_1.default.ok(ws.content.includes('11–14'));
    assert_1.default.ok(game.content.questions[0].source_ref.includes('11–14'));
    assert_1.default.ok(video.content.scenes[0].source_ref.includes('11–14'));
});
// 3. Delta Regeneration & STALE tagging
it('Delta Regeneration: Sửa hoạt động B2 chỉ gắn cờ STALE cho artifact liên quan mà không đổi bài', () => {
    const result = lessonStateManager_1.LessonStateManager.updateActivity('act_b2', {
        student_task: 'Nhiệm vụ mới sau khi tinh chỉnh thảo luận nhóm 4 học sinh',
        time: 20
    });
    assert_1.default.strictEqual(result.updated, true, 'Cập nhật hoạt động B2 thành công');
    assert_1.default.ok(result.staleDependents.includes('worksheet_01'), 'worksheet_01 phải bị gắn cờ STALE');
    assert_1.default.ok(result.staleDependents.includes('game_01'), 'game_01 phải bị gắn cờ STALE');
    const wsArtifact = database_1.db.getArtifact('worksheet_01');
    assert_1.default.strictEqual(wsArtifact.stale, true, 'Trạng thái artifact trong DB phải là stale: true');
    // Check that KHDH lesson_id remains unchanged
    const activeState = lessonStateManager_1.LessonStateManager.getActiveState();
    assert_1.default.strictEqual(activeState?.lesson_id, 'MATH8_INTEGRATION_01');
    assert_1.default.strictEqual(activeState?.activities.find(a => a.id === 'act_b2')?.time, 20);
});
console.log(`\nTổng kết Integration Tests: ${passedTests}/${totalTests} tests hoàn thành thành công.`);
if (passedTests === totalTests) {
    process.exit(0);
}
else {
    process.exit(1);
}
