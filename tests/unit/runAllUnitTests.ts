import assert from 'assert';
import { Pl1Parser } from '../../server/parsers/pl1Parser';
import { VideoAiService } from '../../server/services/videoAiService';
import { DependencyGraphService } from '../../server/services/dependencyGraph';
import { QualityQaService } from '../../server/services/qualityQaService';
import { LessonStateManager } from '../../server/services/lessonStateManager';

console.log('====================================================');
console.log('🧪 CHẠY BỘ UNIT TESTS (KIỂM THỬ ĐƠN VỊ TỪNG MODULE)');
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

// 1. Test Pl1Parser
it('Pl1Parser: Trích xuất chính xác tên bài, số tiết và YCCĐ từ tệp PL1', () => {
  const dummyBuffer = Buffer.from('<w:t>Kế hoạch dạy học môn Toán 8 Bài Đa thức 2 tiết</w:t>');
  const data = Pl1Parser.extract(dummyBuffer, 'PL1_Toan8_KNTT.docx');
  assert.strictEqual(data.subject, 'Toán');
  assert.strictEqual(data.grade, 8);
  assert.strictEqual(data.total_periods, 2);
  assert.ok(data.yccd.length >= 3, 'YCCĐ phải có ít nhất 3 mục');
  assert.ok(data.nls_indicators.length >= 1, 'Phải có ít nhất 1 chỉ báo NLS');
});

// 2. Test VideoAiService Dialogue Validator
it('VideoAiService: Kiểm soát chặt chẽ lời thoại <= 24 từ/cảnh', () => {
  const shortDialogue = 'Hãy quan sát kĩ chuyển động và đối chiếu SGK trang 12.';
  const validResult = VideoAiService.validateDialogue(shortDialogue);
  assert.strictEqual(validResult.valid, true);
  assert.ok(validResult.wordCount <= 24);

  const longDialogue = 'Một hai ba bốn năm sáu bảy tám chín mười mười một mười hai mười ba mười bốn mười lăm mười sáu mười bảy mười tám mười chín hai mươi hai mốt hai hai hai ba hai bốn hai lăm từ.';
  const invalidResult = VideoAiService.validateDialogue(longDialogue);
  assert.strictEqual(invalidResult.valid, false);
  assert.ok(invalidResult.error?.includes('DIALOGUE_TOO_LONG'));
});

// 3. Test Dependency Graph
it('DependencyGraphService: Truy vết chính xác artifact phụ thuộc khi sửa Hoạt động', () => {
  const dependents = DependencyGraphService.getDependents('act_b2');
  assert.ok(dependents.includes('worksheet_01'), 'Hoạt động B2 phải liên kết với worksheet_01');
  assert.ok(dependents.includes('game_01'), 'Hoạt động B2 phải liên kết với game_01');
  assert.ok(dependents.includes('video_01'), 'Hoạt động B2 phải liên kết với video_01');
});

// 4. Test Quality QA Scorecard
it('QualityQaService: Chấm điểm KHDH thang 100 và phát hiện lỗi chặn', () => {
  // Set sample lesson into state
  LessonStateManager.setActiveState({
    lesson_id: 'TEST_QA_01',
    subject: 'Toán',
    grade: 8,
    chapter: 'Chương I',
    lesson_title: 'Bài Test QA',
    total_periods: 2,
    ppct: [1, 2],
    weeks: [1],
    yccd: [{ id: 'YCCD-01', text: 'Nhận biết khái niệm', level: 'NHAN_BIET' }],
    digital_competency_indicators: [{
      id: 'NLS-01',
      indicator: 'Chỉ báo số 1',
      target_activity: 'act_01',
      tool: 'AI',
      student_action: 'Thực hành',
      product: 'Bảng đối chiếu',
      evidence: 'Phiếu học tập'
    }],
    subject_profile: 'MATH',
    lesson_type: 'NEW_KNOWLEDGE',
    form_mode: 'DEFAULT_V12_FORM_MODE',
    textbook: { book: 'SGK Toán 8', pages: '1-5', assets: [] },
    activities: [{
      id: 'act_01', code: 'B1', period: 1, title: 'Khám phá', time: 20,
      yccd_refs: ['YCCD-01'], nls_refs: ['NLS-01'], student_task: 'Nhiệm vụ',
      teacher_actions: 'Hướng dẫn', product: 'Sản phẩm', evidence: 'Minh chứng',
      digital_tool: 'AI', source_refs: ['SGK tr.1'], locked: false
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1
  });

  const audit = QualityQaService.auditKhdh();
  assert.ok(audit.totalScore >= 80, `Điểm số QA phải đạt chuẩn: ${audit.totalScore}/100`);
  assert.strictEqual(audit.blockingErrors.length, 0, 'Không được có lỗi chặn');
  assert.strictEqual(audit.passed, true);
});

console.log(`\nTổng kết Unit Tests: ${passedTests}/${totalTests} tests hoàn thành thành công.`);
if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
