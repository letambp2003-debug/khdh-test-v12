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
it('Pl1Parser: Trích xuất chính xác tên bài, số tiết, YCCĐ và danh mục bài học từ tệp PL1', () => {
  const dummyBuffer = Buffer.from('<w:t>Kế hoạch dạy học môn Toán 8 Bài Đa thức 2 tiết</w:t>');
  const data = Pl1Parser.extract(dummyBuffer, 'PL1_Toan8_KNTT.docx');
  assert.strictEqual(data.subject, 'Toán');
  assert.strictEqual(data.grade, 8);
  assert.strictEqual(data.total_periods, 2);
  assert.ok(data.yccd.length >= 3, 'YCCĐ phải có ít nhất 3 mục');
  assert.ok(data.nls_indicators.length >= 1, 'Phải có ít nhất 1 chỉ báo NLS');
  assert.ok(data.catalog && data.catalog.length >= 1, 'Danh mục bài học phải có ít nhất 1 bài để giáo viên lựa chọn');
});

it('Pl1Parser: Cung cấp danh mục bài học chuẩn GDPT 2018 theo môn và khối lớp', () => {
  const catalogToan8 = Pl1Parser.getStandardCurriculum('Toán', 8);
  assert.ok(catalogToan8.length >= 2, 'Toán 8 phải có ít nhất 2 bài học chuẩn');
  assert.ok(catalogToan8.some(item => item.lesson_title.toLowerCase().includes('đa thức')), 'Phải có bài Đa thức');

  const catalogKhtn7 = Pl1Parser.getStandardCurriculum('Khoa học tự nhiên', 7);
  assert.ok(catalogKhtn7.length >= 2, 'KHTN 7 phải có ít nhất 2 bài học chuẩn');
  assert.ok(catalogKhtn7.some(item => item.lesson_title.toLowerCase().includes('tốc độ')), 'Phải có bài Tốc độ');
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

// 5. Test AuthService
import { AuthService } from '../../server/services/authService';

it('AuthService: Đăng ký email cá nhân, sinh mã OTP 6 số và xác minh email thành công', () => {
  const testEmail = `teacher_${Date.now()}@school.edu.vn`;
  const regResult = AuthService.registerEmail(
    'Cô Nguyễn Thu Hằng',
    testEmail,
    'SecurePass123!',
    'THCS Lê Lợi',
    'Khoa học tự nhiên'
  );
  assert.strictEqual(regResult.ok, true);
  assert.ok(regResult.simulated_otp, 'Phải sinh mã OTP');
  assert.strictEqual(regResult.simulated_otp?.length, 6, 'Mã OTP phải có độ dài 6 chữ số');

  // Thử đăng nhập khi chưa xác minh OTP -> Phải báo lỗi unverified
  const unverifiedLogin = AuthService.loginEmail(testEmail, 'SecurePass123!');
  assert.strictEqual(unverifiedLogin.ok, false);

  // Xác minh OTP sai
  const wrongOtpResult = AuthService.verifyEmail(testEmail, '999999');
  assert.strictEqual(wrongOtpResult.ok, false);

  // Xác minh OTP đúng
  const verifyResult = AuthService.verifyEmail(testEmail, regResult.simulated_otp!);
  assert.strictEqual(verifyResult.ok, true);
  assert.strictEqual(verifyResult.user?.email_verified, true);

  // Đăng nhập lại sau khi đã xác minh -> Thành công
  const verifiedLogin = AuthService.loginEmail(testEmail, 'SecurePass123!');
  assert.strictEqual(verifiedLogin.ok, true);
  assert.strictEqual(verifiedLogin.user?.email, testEmail);
  assert.strictEqual(verifiedLogin.user?.school, 'THCS Lê Lợi');
});

it('AuthService: Đăng nhập liên kết Google ID nhanh chóng', () => {
  const googleUser = AuthService.loginGoogle(
    'Thầy Lê Tâm',
    'thaytam.toan@gmail.com',
    'TEACHER'
  );
  assert.strictEqual(googleUser.auth_provider, 'google');
  assert.strictEqual(googleUser.email_verified, true);
  assert.strictEqual(googleUser.email, 'thaytam.toan@gmail.com');
  assert.strictEqual(googleUser.name, 'Thầy Lê Tâm');
});

// 6. Test KhdhService & Gemini 3.7 Flash Thinking Engine
import { KhdhService } from '../../server/services/khdhService';
import { GeminiService } from '../../server/services/geminiService';

async function runAsyncTests() {
  // Test Gemini 3.7 Flash Thinking High
  totalTests++;
  try {
    const aiRes = await GeminiService.generateWithThinking(
      'Soạn hoạt động khởi động cho bài Phép chia đa thức',
      'Chuẩn sư phạm GDPT 2018',
      'gemini-3.7-flash',
      8192
    );
    assert.strictEqual(aiRes.ok, true);
    assert.ok(aiRes.text.length > 0, 'Phải sinh nội dung text');
    assert.ok(aiRes.modelUsed.includes('gemini-3.7-flash'), 'Phải ưu tiên model Gemini 3.7 Flash');
    console.log(`  ✅ PASS: GeminiService: Sinh nội dung với Gemini 3.7 Flash Thinking High (8K budget)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: GeminiService Thinking Engine: ${err.message}`);
  }

  // Test KhdhService: One-shot Generation
  totalTests++;
  try {
    const sampleState = LessonStateManager.getActiveState()!;
    const oneShotRes = await KhdhService.generateOneShot(sampleState, {
      model: 'gemini-3.7-flash',
      thinkingBudget: 8192
    });
    assert.strictEqual(oneShotRes.ok, true);
    assert.strictEqual(oneShotRes.lesson.activities.length, 5, 'KHDH 4 phần chuẩn phải có đủ 5 hoạt động (A, B1, B2, C, D)');
    assert.ok(oneShotRes.lesson.activities.some(a => a.code === 'A'), 'Phải có hoạt động Khởi động A');
    assert.ok(oneShotRes.lesson.activities.some(a => a.code === 'B1'), 'Phải có hoạt động B1');
    assert.ok(oneShotRes.lesson.activities.some(a => a.code === 'B2'), 'Phải có hoạt động B2 tích hợp NLS');
    console.log(`  ✅ PASS: KhdhService: Sinh toàn bộ KHDH 4 phần liên tục 1 lần (One-shot) thành công`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: KhdhService One-shot: ${err.message}`);
  }

  // Test KhdhService: 4-Step Phased Generation
  totalTests++;
  try {
    const sampleState = LessonStateManager.getActiveState()!;
    for (let step = 1; step <= 4; step++) {
      const stepRes = await KhdhService.generateStep(step, sampleState);
      assert.strictEqual(stepRes.ok, true);
      assert.strictEqual(stepRes.step, step);
    }
    console.log(`  ✅ PASS: KhdhService: Sinh KHDH tuần tự 4 bước tách biệt (Step-by-step 1-4)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: KhdhService Phased Steps: ${err.message}`);
  }

  // Test KhdhService: Sync Artifacts (Single Source of Truth)
  totalTests++;
  try {
    const sampleState = LessonStateManager.getActiveState()!;
    const syncRes = KhdhService.syncArtifacts(sampleState);
    assert.ok(syncRes.worksheetData.linked_activity, 'Phiếu học tập phải liên kết với hoạt động KHDH');
    assert.ok(syncRes.gameData.game_type, 'Trò chơi phải có thể loại native');
    assert.strictEqual(syncRes.videoData.max_words_per_scene, 24, 'Lời thoại Video AI phải kiểm soát <= 24 từ/cảnh');
    console.log(`  ✅ PASS: KhdhService: Đồng bộ liên kết 100% dữ liệu sang Phiếu học tập, Trò chơi và Video AI (<=24 từ)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: KhdhService Sync Artifacts: ${err.message}`);
  }

  console.log(`\nTổng kết Unit Tests: ${passedTests}/${totalTests} tests hoàn thành thành công.`);
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAsyncTests();

