"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const healthService_1 = require("../services/healthService");
const authService_1 = require("../services/authService");
const geminiService_1 = require("../services/geminiService");
const lessonStateManager_1 = require("../services/lessonStateManager");
const worksheetService_1 = require("../services/worksheetService");
const gameService_1 = require("../services/gameService");
const videoAiService_1 = require("../services/videoAiService");
const slideService_1 = require("../services/slideService");
const qualityQaService_1 = require("../services/qualityQaService");
const pl1Parser_1 = require("../parsers/pl1Parser");
const sgkParser_1 = require("../parsers/sgkParser");
const fileStorage_1 = require("../storage/fileStorage");
const khdhService_1 = require("../services/khdhService");
const upload = (0, multer_1.default)({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100 MB: Thoải mái cho SGK PDF và tài liệu chuyên môn
exports.apiRouter = (0, express_1.Router)();
// 1. Health Checks
exports.apiRouter.get('/health', (req, res) => {
    res.json({ ok: true, app: 'KHDH AUTO V12-RC2 WEBAPP PRO', status: 'RUNNING' });
});
exports.apiRouter.get('/health/connections', (req, res) => {
    const result = healthService_1.HealthCheckService.checkAll();
    res.json(result);
});
// 2. Auth & Gemini Key
exports.apiRouter.post('/auth/login', (req, res) => {
    const { name, email, role, picture } = req.body;
    if (!email)
        return res.status(400).json({ error: 'Email is required' });
    const user = authService_1.AuthService.loginGoogle(name || 'Giáo viên', email, role, picture);
    res.json({ ok: true, user });
});
exports.apiRouter.post('/auth/login-google', (req, res) => {
    const { name, email, role, picture } = req.body;
    if (!email)
        return res.status(400).json({ error: 'Email is required' });
    const user = authService_1.AuthService.loginGoogle(name || 'Giáo viên', email, role, picture);
    res.json({ ok: true, user });
});
exports.apiRouter.post('/auth/register', (req, res) => {
    const { name, email, password, school, subject } = req.body;
    const result = authService_1.AuthService.registerEmail(name, email, password, school, subject);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    res.json(result);
});
exports.apiRouter.post('/auth/verify-email', (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ ok: false, error: 'Email và mã xác minh OTP là bắt buộc.' });
    }
    const result = authService_1.AuthService.verifyEmail(email, code);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    res.json(result);
});
exports.apiRouter.post('/auth/resend-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ ok: false, error: 'Email là bắt buộc.' });
    }
    const result = authService_1.AuthService.resendOtp(email);
    res.json(result);
});
exports.apiRouter.post('/auth/login-email', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
    }
    const result = authService_1.AuthService.loginEmail(email, password);
    if (!result.ok) {
        return res.status(400).json(result);
    }
    res.json(result);
});
exports.apiRouter.post('/auth/logout', (req, res) => {
    authService_1.AuthService.logout();
    res.json({ ok: true });
});
exports.apiRouter.post('/auth/api-key', (req, res) => {
    const { key, keys } = req.body;
    const input = keys !== undefined ? keys : (key || '');
    const result = geminiService_1.GeminiService.setApiKeys(input);
    res.json(result);
});
exports.apiRouter.get('/auth/status', (req, res) => {
    res.json({
        auth: authService_1.AuthService.ping(),
        gemini: geminiService_1.GeminiService.ping()
    });
});
// 3. Lesson State
exports.apiRouter.get('/lesson/state', (req, res) => {
    const state = lessonStateManager_1.LessonStateManager.getActiveState();
    res.json({ ok: true, lesson: state });
});
exports.apiRouter.post('/lesson/load-sample/:key', (req, res) => {
    const key = req.params.key;
    // Sample lesson data
    const sampleLessons = {
        math8: {
            lesson_id: 'MATH8_DATHUC',
            subject: 'Toán',
            grade: 8,
            chapter: 'Chương I. Đa thức',
            lesson_title: 'Đa thức',
            total_periods: 2,
            ppct: [5, 6],
            weeks: [3],
            yccd: [
                { id: 'YCCD-01', text: 'Nhận biết được khái niệm đa thức, các hạng tử của đa thức.', level: 'NHAN_BIET' },
                { id: 'YCCD-02', text: 'Thu gọn được đa thức, xác định được bậc của đa thức.', level: 'THONG_HIEU' },
                { id: 'YCCD-03', text: 'Vận dụng tính chất đa thức giải toán thực tế.', level: 'VAN_DUNG' }
            ],
            digital_competency_indicators: [
                {
                    id: 'NLS-01',
                    indicator: 'Sử dụng công cụ số tra cứu và đối chiếu kiểm chứng SGK',
                    target_activity: 'act_b2',
                    tool: 'AI Assistant',
                    student_action: 'Học sinh nhập biểu thức, đối chiếu quy tắc SGK tr.12 phát hiện lỗi',
                    product: 'Bảng đối chiếu kiểm chứng',
                    evidence: 'Phiếu học tập có xác nhận'
                }
            ],
            subject_profile: 'MATH (Toán học) — Suy luận logic và kiểm chứng SGK',
            lesson_type: 'NEW_KNOWLEDGE (Hình thành kiến thức mới)',
            form_mode: 'DEFAULT_V12_FORM_MODE',
            textbook: {
                book: 'SGK Toán 8 Tập 1',
                pages: '11–14',
                assets: [{ id: 'IMG-01', page: 11, caption: 'Hình 1.1 SGK', status: 'VERIFIED' }]
            },
            activities: [
                {
                    id: 'act_a', code: 'A', period: 1, title: 'Khởi động: Đố vui diện tích', time: 7,
                    yccd_refs: ['YCCD-01'], nls_refs: [], student_task: 'Quan sát hình 1.1 SGK',
                    teacher_actions: 'Giao nhiệm vụ', product: 'Biểu thức diện tích', evidence: 'Câu trả lời miệng',
                    digital_tool: 'Slide 02', source_refs: ['SGK tr.11'], locked: false
                },
                {
                    id: 'act_b2', code: 'B2', period: 1, title: 'Khám phá 2: Thu gọn đa thức', time: 18,
                    yccd_refs: ['YCCD-02'], nls_refs: ['NLS-01'], student_task: 'Thu gọn đa thức và đối chiếu SGK',
                    teacher_actions: 'Hướng dẫn đối chiếu', product: 'Phiếu học tập đối chiếu', evidence: 'Biên bản nhóm',
                    digital_tool: 'AI Assistant', source_refs: ['SGK tr.12'], locked: false
                }
            ]
        }
    };
    const selected = sampleLessons[key] || sampleLessons['math8'];
    lessonStateManager_1.LessonStateManager.setActiveState(selected);
    res.json({ ok: true, lesson: selected });
});
// 4. Source Upload & Commit
exports.apiRouter.post('/sources/upload/:slot', upload.single('file'), async (req, res) => {
    const slot = req.params.slot;
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    const saved = fileStorage_1.storage.saveUpload(req.file.originalname, req.file.buffer);
    if (slot === 'pl1') {
        const extracted = pl1Parser_1.Pl1Parser.extract(req.file.buffer, req.file.originalname);
        res.json({ ok: true, slot, saved, extracted });
    }
    else if (slot === 'sgk') {
        const activeLesson = lessonStateManager_1.LessonStateManager.getActiveState();
        const subject = activeLesson ? activeLesson.subject : 'Toán';
        const grade = activeLesson ? activeLesson.grade : 8;
        const extracted = await sgkParser_1.SgkParser.extractAsync(req.file.buffer, req.file.originalname, subject, grade);
        res.json({ ok: true, slot, saved, extracted });
    }
    else {
        res.json({ ok: true, slot, saved });
    }
});
exports.apiRouter.post('/sources/commit', (req, res) => {
    const { lesson } = req.body;
    if (!lesson || !lesson.lesson_title) {
        return res.status(400).json({ ok: false, error: 'Dữ liệu bài học không hợp lệ' });
    }
    lessonStateManager_1.LessonStateManager.setActiveState(lesson);
    res.json({ ok: true, lesson });
});
// 4B. KHDH Generation (One-Shot & 4-Step Phased with Gemini 3.7 Flash Thinking High)
exports.apiRouter.post('/khdh/generate-one-shot', async (req, res) => {
    try {
        const lesson = req.body.lesson || lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson) {
            return res.status(400).json({ ok: false, error: 'Chưa có bài học được kích hoạt để tạo KHDH' });
        }
        const { model, thinkingBudget } = req.body;
        const result = await khdhService_1.KhdhService.generateOneShot(lesson, { model, thinkingBudget });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
exports.apiRouter.post('/khdh/generate-step/:step', async (req, res) => {
    try {
        const step = parseInt(req.params.step, 10);
        const lesson = req.body.lesson || lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson) {
            return res.status(400).json({ ok: false, error: 'Chưa có bài học được kích hoạt' });
        }
        const { model, thinkingBudget } = req.body;
        const result = await khdhService_1.KhdhService.generateStep(step, lesson, { model, thinkingBudget });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
exports.apiRouter.post('/khdh/sync-artifacts', (req, res) => {
    try {
        const lesson = req.body.lesson || lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson) {
            return res.status(400).json({ ok: false, error: 'Chưa có bài học được kích hoạt' });
        }
        const result = khdhService_1.KhdhService.syncArtifacts(lesson);
        res.json({ ok: true, sync: result });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
// 5. Artifacts
exports.apiRouter.post('/artifacts/worksheet', (req, res) => {
    try {
        const artifact = worksheetService_1.WorksheetService.generate(req.body);
        res.json({ ok: true, artifact });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.apiRouter.post('/artifacts/game', (req, res) => {
    try {
        const artifact = gameService_1.GameService.generate(req.body);
        res.json({ ok: true, artifact });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.apiRouter.post('/artifacts/video', (req, res) => {
    try {
        const artifact = videoAiService_1.VideoAiService.generate(req.body);
        res.json({ ok: true, artifact });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.apiRouter.post('/artifacts/slides/:period', (req, res) => {
    try {
        const period = parseInt(req.params.period, 10);
        const artifact = slideService_1.SlideService.generate(period);
        res.json({ ok: true, artifact });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// 6. Delta Refine
exports.apiRouter.post('/refine/delta', (req, res) => {
    const { activityId, student_task, time, locked } = req.body;
    const result = lessonStateManager_1.LessonStateManager.updateActivity(activityId, { student_task, time, locked });
    res.json({ ok: result.updated, staleDependents: result.staleDependents });
});
// 7. Quality QA
exports.apiRouter.get('/quality/audit', (req, res) => {
    const result = qualityQaService_1.QualityQaService.auditKhdh();
    res.json(result);
});
// 8. Export
exports.apiRouter.get('/export/:type', (req, res) => {
    const type = req.params.type;
    const lesson = lessonStateManager_1.LessonStateManager.getActiveState();
    if (!lesson)
        return res.status(400).json({ error: 'No lesson active' });
    if (type === 'docx') {
        const filename = `KHDH_V12_4PHAN_${lesson.subject}${lesson.grade}_${lesson.lesson_title.replace(/\s+/g, '_')}.doc`;
        const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>KHDH ${lesson.lesson_title}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm 20mm 20mm 20mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; color: #000; }
        table.khdh-header-box { width: 100%; border-collapse: collapse; border: 1pt dashed #000; margin-bottom: 14pt; }
        table.khdh-header-box td { width: 50%; border: 1pt dashed #000; padding: 6pt 8pt; text-align: center; vertical-align: middle; }
      </style>
      </head>
      <body>
        <table class="khdh-header-box">
          <tr>
            <td>
              <div style="font-weight:bold; font-size:13pt; text-transform:uppercase;">TRƯỜNG THCS QUANG TRUNG</div>
              <div style="font-weight:bold; font-size:13pt; text-transform:uppercase;">TỔ: TOÁN - TIN HỌC</div>
            </td>
            <td>
              <div style="font-style:italic; font-size:12.5pt;">Họ và tên giáo viên:</div>
              <div style="font-weight:bold; font-size:13pt; text-transform:uppercase;">LÊ TÂM</div>
            </td>
          </tr>
        </table>
        <div style="text-align:center; margin-bottom:16pt;">
          <div style="color:#1f4e79; font-size:15pt; font-weight:bold; text-transform:uppercase; margin-bottom:4pt;">
            ${lesson.lesson_title.trim().toUpperCase().startsWith('BÀI') ? lesson.lesson_title.trim().toUpperCase() : 'BÀI: ' + lesson.lesson_title.trim().toUpperCase()}
          </div>
          <div style="font-style:italic; font-size:13pt; margin-bottom:2pt;">
            Môn học: ${lesson.subject} - Lớp: ${lesson.grade} (${lesson.chapter || 'Chương I: Đa thức'})
          </div>
          <div style="font-style:italic; font-size:13pt;">
            (Thời gian thực hiện: ${lesson.total_periods < 10 ? '0' + lesson.total_periods : lesson.total_periods} tiết - Tiết PPCT: ${lesson.ppct.join(', ')})
          </div>
        </div>
      </body>
      </html>
    `;
        res.setHeader('Content-Type', 'application/msword');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
        res.send(docHtml);
    }
    else {
        res.json({ ok: true, message: `Exported ${type}` });
    }
});
