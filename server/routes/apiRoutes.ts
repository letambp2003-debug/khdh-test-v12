import { Router, Request, Response } from 'express';
import multer from 'multer';
import { HealthCheckService } from '../services/healthService';
import { AuthService } from '../services/authService';
import { GeminiService } from '../services/geminiService';
import { LessonStateManager } from '../services/lessonStateManager';
import { WorksheetService } from '../services/worksheetService';
import { GameService } from '../services/gameService';
import { VideoAiService } from '../services/videoAiService';
import { SlideService } from '../services/slideService';
import { QualityQaService } from '../services/qualityQaService';
import { Pl1Parser } from '../parsers/pl1Parser';
import { SgkParser } from '../parsers/sgkParser';
import { storage } from '../storage/fileStorage';

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });
export const apiRouter = Router();

// 1. Health Checks
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true, app: 'KHDH AUTO V12-RC2 WEBAPP PRO', status: 'RUNNING' });
});

apiRouter.get('/health/connections', (req: Request, res: Response) => {
  const result = HealthCheckService.checkAll();
  res.json(result);
});

// 2. Auth & Gemini Key
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = AuthService.loginGoogle(name || 'Giáo viên', email);
  res.json({ ok: true, user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  AuthService.logout();
  res.json({ ok: true });
});

apiRouter.post('/auth/api-key', (req: Request, res: Response) => {
  const { key, keys } = req.body;
  const input = keys !== undefined ? keys : (key || '');
  const result = GeminiService.setApiKeys(input);
  res.json(result);
});

apiRouter.get('/auth/status', (req: Request, res: Response) => {
  res.json({
    auth: AuthService.ping(),
    gemini: GeminiService.ping()
  });
});

// 3. Lesson State
apiRouter.get('/lesson/state', (req: Request, res: Response) => {
  const state = LessonStateManager.getActiveState();
  res.json({ ok: true, lesson: state });
});

apiRouter.post('/lesson/load-sample/:key', (req: Request, res: Response) => {
  const key = req.params.key;
  // Sample lesson data
  const sampleLessons: Record<string, any> = {
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
  LessonStateManager.setActiveState(selected);
  res.json({ ok: true, lesson: selected });
});

// 4. Source Upload & Commit
apiRouter.post('/sources/upload/:slot', upload.single('file'), async (req: Request, res: Response) => {
  const slot = req.params.slot;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const saved = storage.saveUpload(req.file.originalname, req.file.buffer);

  if (slot === 'pl1') {
    const extracted = Pl1Parser.extract(req.file.buffer, req.file.originalname);
    res.json({ ok: true, slot, saved, extracted });
  } else if (slot === 'sgk') {
    const activeLesson = LessonStateManager.getActiveState();
    const subject = activeLesson ? activeLesson.subject : 'Toán';
    const grade = activeLesson ? activeLesson.grade : 8;
    const extracted = await SgkParser.extractAsync(req.file.buffer, req.file.originalname, subject, grade);
    res.json({ ok: true, slot, saved, extracted });
  } else {
    res.json({ ok: true, slot, saved });
  }
});

apiRouter.post('/sources/commit', (req: Request, res: Response) => {
  const { lesson } = req.body;
  if (!lesson || !lesson.lesson_title) {
    return res.status(400).json({ ok: false, error: 'Dữ liệu bài học không hợp lệ' });
  }
  LessonStateManager.setActiveState(lesson);
  res.json({ ok: true, lesson });
});

// 5. Artifacts
apiRouter.post('/artifacts/worksheet', (req: Request, res: Response) => {
  try {
    const artifact = WorksheetService.generate(req.body);
    res.json({ ok: true, artifact });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/artifacts/game', (req: Request, res: Response) => {
  try {
    const artifact = GameService.generate(req.body);
    res.json({ ok: true, artifact });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/artifacts/video', (req: Request, res: Response) => {
  try {
    const artifact = VideoAiService.generate(req.body);
    res.json({ ok: true, artifact });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/artifacts/slides/:period', (req: Request, res: Response) => {
  try {
    const period = parseInt(req.params.period, 10);
    const artifact = SlideService.generate(period);
    res.json({ ok: true, artifact });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Delta Refine
apiRouter.post('/refine/delta', (req: Request, res: Response) => {
  const { activityId, student_task, time, locked } = req.body;
  const result = LessonStateManager.updateActivity(activityId, { student_task, time, locked });
  res.json({ ok: result.updated, staleDependents: result.staleDependents });
});

// 7. Quality QA
apiRouter.get('/quality/audit', (req: Request, res: Response) => {
  const result = QualityQaService.auditKhdh();
  res.json(result);
});

// 8. Export
apiRouter.get('/export/:type', (req: Request, res: Response) => {
  const type = req.params.type;
  const lesson = LessonStateManager.getActiveState();
  if (!lesson) return res.status(400).json({ error: 'No lesson active' });

  if (type === 'docx') {
    const filename = `KHDH_V12_4PHAN_${lesson.subject}${lesson.grade}_${lesson.lesson_title.replace(/\s+/g, '_')}.doc`;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>KHDH ${lesson.lesson_title}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm 20mm 20mm 20mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; }
        h2 { text-align: center; font-size: 16pt; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 6pt 0; }
        td, th { border: 1pt solid #000; padding: 5pt; font-size: 12.5pt; vertical-align: top; }
      </style>
      </head>
      <body>
        <div style="text-align:center;font-size:12pt;margin-bottom:12pt">
          <b>KẾ HOẠCH BÀI DẠY (FORM V12 — 4 PHẦN LIÊN TỤC, KHÔNG TÁCH TIẾT)</b><br>
          <h2>${lesson.lesson_title.toUpperCase()}</h2>
          <p>Môn: ${lesson.subject} – Lớp: ${lesson.grade} | Thời lượng: ${lesson.total_periods} tiết (PPCT: ${lesson.ppct.join(', ')})</p>
        </div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.send(docHtml);
  } else {
    res.json({ ok: true, message: `Exported ${type}` });
  }
});
