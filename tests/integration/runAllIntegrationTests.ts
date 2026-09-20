import assert from 'assert';
import { HealthCheckService } from '../../server/services/healthService';
import { GeminiService } from '../../server/services/geminiService';
import { LessonStateManager } from '../../server/services/lessonStateManager';
import { WorksheetService } from '../../server/services/worksheetService';
import { GameService } from '../../server/services/gameService';
import { VideoAiService } from '../../server/services/videoAiService';
import { SlideService } from '../../server/services/slideService';
import { db } from '../../server/db/database';

console.log('====================================================');
console.log('🔗 CHẠY BỘ INTEGRATION TESTS (KIỂM THỬ TÍCH HỢP HỆ THỐNG)');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function it(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Health check & DISCONNECTED reason verification
it('HealthCheck: Kiểm tra kết nối thật và báo lỗi DISCONNECTED nếu thiếu API Key', () => {
  // Test when key is empty
  GeminiService.setApiKey('');
  const health = HealthCheckService.checkAll();
  assert.strictEqual(health.connections.database.connected, true, 'Database phải CONNECTED');
  assert.strictEqual(health.connections.file_storage.connected, true, 'File Storage phải CONNECTED');
  assert.strictEqual(health.connections.source_parsers.connected, true, 'Parsers phải CONNECTED');
  
  // Verify Gemini Key is DISCONNECTED with exact reason
  assert.strictEqual(health.connections.gemini_api.connected, false, 'Gemini Key phải DISCONNECTED khi rỗng');
  assert.ok(health.connections.gemini_api.message?.includes('DISCONNECTED'), 'Thông báo phải chứa DISCONNECTED');

  // Test when valid key is provided
  GeminiService.setApiKey('AIzaSyTestIntegrationKey_ValidFormat_12345');
  const health2 = HealthCheckService.checkAll();
  assert.strictEqual(health2.connections.gemini_api.connected, true, 'Gemini Key phải CONNECTED khi có key hợp lệ');
});

// 2. Single Source of Truth across all Artifacts
it('Single Source of Truth: Toàn bộ KHDH, Slide, Phiếu, Game, Video dùng chung LESSON_STATE', () => {
  LessonStateManager.setActiveState({
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

  const ws = WorksheetService.generate({ period: 1, activityId: 'act_b2', worksheetType: 'Khám phá', itemCount: 4, isTeacherVersion: false });
  const game = GameService.generate({ gameType: 'Ô cửa bí mật', questionCount: 5, activityId: 'act_b2', difficulty: 'mix' });
  const video = VideoAiService.generate({ videoType: '02. Nêu vấn đề', sceneCount: 4, style: 'STYLE_02', activityId: 'act_b2' });
  const slide = SlideService.generate(1);

  // Assert all artifacts share the exact same lesson_id
  assert.strictEqual(ws.lesson_id, 'MATH8_INTEGRATION_01');
  assert.strictEqual(game.lesson_id, 'MATH8_INTEGRATION_01');
  assert.strictEqual(video.lesson_id, 'MATH8_INTEGRATION_01');
  assert.strictEqual(slide.lesson_id, 'MATH8_INTEGRATION_01');

  // Assert all artifacts reference the exact same textbook pages
  assert.ok(ws.content.includes('11–14'));
  assert.ok(game.content.questions[0].source_ref.includes('11–14'));
  assert.ok(video.content.scenes[0].source_ref.includes('11–14'));
});

// 3. Delta Regeneration & STALE tagging
it('Delta Regeneration: Sửa hoạt động B2 chỉ gắn cờ STALE cho artifact liên quan mà không đổi bài', () => {
  const result = LessonStateManager.updateActivity('act_b2', {
    student_task: 'Nhiệm vụ mới sau khi tinh chỉnh thảo luận nhóm 4 học sinh',
    time: 20
  });

  assert.strictEqual(result.updated, true, 'Cập nhật hoạt động B2 thành công');
  assert.ok(result.staleDependents.includes('worksheet_01'), 'worksheet_01 phải bị gắn cờ STALE');
  assert.ok(result.staleDependents.includes('game_01'), 'game_01 phải bị gắn cờ STALE');

  const wsArtifact = db.getArtifact('worksheet_01');
  assert.strictEqual(wsArtifact.stale, true, 'Trạng thái artifact trong DB phải là stale: true');

  // Check that KHDH lesson_id remains unchanged
  const activeState = LessonStateManager.getActiveState();
  assert.strictEqual(activeState?.lesson_id, 'MATH8_INTEGRATION_01');
  assert.strictEqual(activeState?.activities.find(a => a.id === 'act_b2')?.time, 20);
});

console.log(`\nTổng kết Integration Tests: ${passedTests}/${totalTests} tests hoàn thành thành công.`);
if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
