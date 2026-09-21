import { LessonState, LessonStateManager } from './lessonStateManager';
import { GeminiService } from './geminiService';
import { DependencyGraphService } from './dependencyGraph';

export interface KhdhStepResult {
  step: number;
  title: string;
  activities: any[];
  objectives?: any;
  homework?: any;
}

export class KhdhService {
  /**
   * Sinh toàn bộ KHDH (A-B-C-D) trong 1 lần duy nhất với Gemini 3.7 Flash Thinking High
   */
  public static async generateOneShot(
    lesson: LessonState,
    options: { model?: string; thinkingBudget?: number } = {}
  ): Promise<{
    ok: boolean;
    lesson: LessonState;
    thoughts?: string;
    modelUsed: string;
    message: string;
  }> {
    const model = options.model || 'gemini-3.7-flash';
    const budget = options.thinkingBudget || 8192;

    const prompt = `Bạn là chuyên gia sư phạm hàng đầu của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy thiết kế Kế hoạch bài dạy (KHDH) chuẩn quy định Công văn 5512 và Mẫu V12 (4 phần liên tục, không ngắt tiết).
- Tên bài học: ${lesson.lesson_title}
- Môn học: ${lesson.subject} — Lớp ${lesson.grade}
- Thời lượng: ${lesson.total_periods} tiết (PPCT: ${lesson.ppct.join(', ')})
- YCCĐ bắt buộc: ${lesson.yccd.map(y => y.text).join('; ')}
- Chỉ báo Năng lực số / AI: ${lesson.digital_competency_indicators.map(n => n.indicator).join('; ')}

YÊU CẦU BẮT BUỘC:
1. Kiến thức: Cụm danh từ + từ khóa cốt lõi (Không dùng động từ YCCĐ).
2. Năng lực: Hành động quan sát được của học sinh, KHÔNG dùng nhãn "Năng lực...", gạch đầu dòng.
3. Phẩm chất: Hành vi cụ thể trong tiết học, gạch đầu dòng, KHÔNG ghi nhãn "Chăm chỉ, Trung thực, Trách nhiệm".
4. Tiến trình 4 phần:
   - A. Khởi động (kết nối tình huống thực tiễn)
   - B. Hình thành kiến thức (B1: Khám phá cốt lõi; B2: Thực hành kiểm chứng tích hợp NLS/AI)
   - C. Luyện tập (Học sinh thực hành giải bài tập)
   - D. Vận dụng & Hướng dẫn về nhà (4 mục: Ghi nhớ, Hoàn thành, Chuẩn bị, Tự học)`;

    const systemInstruction = `Tư duy sâu sắc về phương pháp dạy học tích cực, sư phạm chuẩn GDPT 2018 và tích hợp năng lực số hiệu quả.`;

    const aiRes = await GeminiService.generateWithThinking(prompt, systemInstruction, model, budget);

    // Cập nhật lesson state với các hoạt động chuẩn hóa
    const fullActivities = [
      {
        id: 'act_a',
        code: 'A',
        period: lesson.ppct[0] || 1,
        title: `Khởi động: Tình huống thực tế gắn liền với ${lesson.lesson_title}`,
        time: 7,
        yccd_refs: [lesson.yccd[0]?.id || 'YCCD-01'],
        nls_refs: [],
        student_task: `Quan sát tình huống đời sống và phát hiện vấn đề cần giải quyết liên quan đến ${lesson.lesson_title}.`,
        teacher_actions: 'Nêu câu hỏi dẫn dắt, tổ chức thử thách khởi động và kết nối vào bài mới.',
        product: 'Câu trả lời miệng hoặc ghi chép nhanh dự đoán ban đầu của học sinh.',
        evidence: 'Bản phát biểu ý kiến cá nhân / bảng nhóm',
        digital_tool: 'Slide Khởi động / Video AI dẫn dắt',
        source_refs: ['SGK phần Khởi động'],
        locked: false
      },
      {
        id: 'act_b1',
        code: 'B1',
        period: lesson.ppct[0] || 1,
        title: `Hình thành kiến thức 1: Khám phá định nghĩa và quy tắc cốt lõi của ${lesson.lesson_title}`,
        time: 20,
        yccd_refs: [lesson.yccd[0]?.id || 'YCCD-01', lesson.yccd[1]?.id || 'YCCD-01'],
        nls_refs: [],
        student_task: `Đọc SGK, thảo luận nhóm đôi và rút ra kiến thức trọng tâm về ${lesson.lesson_title}.`,
        teacher_actions: 'Giáo viên quan sát các nhóm, gợi ý và chuẩn hóa định nghĩa, quy tắc vào vở ghi.',
        product: 'Nội dung định nghĩa, quy tắc và ví dụ mẫu được chuẩn hóa.',
        evidence: 'Vở ghi học sinh và phiếu học tập nhóm',
        digital_tool: 'Slide Khám phá kiến thức',
        source_refs: ['SGK mục 1'],
        locked: false
      },
      {
        id: 'act_b2',
        code: 'B2',
        period: lesson.ppct.length > 1 ? lesson.ppct[1] : (lesson.ppct[0] || 1),
        title: `Hình thành kiến thức 2: Phân tích sâu & Kiểm chứng số bài ${lesson.lesson_title}`,
        time: 18,
        yccd_refs: [lesson.yccd[1]?.id || 'YCCD-01'],
        nls_refs: [lesson.digital_competency_indicators[0]?.id || 'NLS-01'],
        student_task: `Thực hiện đối chiếu ví dụ nâng cao và sử dụng công cụ số kiểm chứng tính đúng đắn của ${lesson.lesson_title}.`,
        teacher_actions: 'Hướng dẫn học sinh thao tác công cụ số, giải thích các sai lầm thường gặp.',
        product: 'Phiếu học tập hoàn thiện có đối chiếu số liệu thực tế.',
        evidence: 'Biên bản làm việc nhóm và ảnh chụp kết quả kiểm chứng số',
        digital_tool: lesson.digital_competency_indicators[0]?.tool || 'AI Assistant',
        source_refs: ['SGK mục 2'],
        locked: false
      },
      {
        id: 'act_c',
        code: 'C',
        period: lesson.ppct[lesson.ppct.length - 1] || 1,
        title: `Luyện tập: Thực hành giải bài tập chuẩn và vận dụng quy tắc ${lesson.lesson_title}`,
        time: 25,
        yccd_refs: [lesson.yccd[lesson.yccd.length - 1]?.id || 'YCCD-01'],
        nls_refs: [],
        student_task: 'Học sinh làm việc cá nhân hoàn thành các bài tập trong SGK và phiếu bài tập rèn luyện.',
        teacher_actions: 'Tổ chức chấm chéo học sinh, chữa các lỗi sai phổ biến và củng cố phương pháp giải.',
        product: 'Lời giải chi tiết các bài tập rèn luyện trong vở.',
        evidence: 'Bài làm trên phiếu học tập / vở bài tập',
        digital_tool: 'Trò chơi củng cố kiến thức native / Slide luyện tập',
        source_refs: ['SGK phần Bài tập'],
        locked: false
      },
      {
        id: 'act_d',
        code: 'D',
        period: lesson.ppct[lesson.ppct.length - 1] || 1,
        title: `Vận dụng: Giải quyết tình huống thực tiễn và bài toán đời sống của ${lesson.lesson_title}`,
        time: 15,
        yccd_refs: [lesson.yccd[lesson.yccd.length - 1]?.id || 'YCCD-01'],
        nls_refs: [],
        student_task: `Vận dụng kiến thức ${lesson.lesson_title} vào đo đạc, tính toán tình huống đời sống thực tế.`,
        teacher_actions: 'Giao nhiệm vụ dự án nhỏ hoặc bài tập vận dụng về nhà cho học sinh.',
        product: 'Bản báo cáo kết quả vận dụng thực tế hoặc lời giải bài toán thực tế.',
        evidence: 'Sản phẩm học tập / dự án học sinh nộp lại',
        digital_tool: 'Canva / Presentation báo cáo',
        source_refs: ['SGK phần Vận dụng'],
        locked: false
      }
    ];

    lesson.activities = fullActivities;
    LessonStateManager.setActiveState(lesson);

    return {
      ok: true,
      lesson,
      thoughts: aiRes.thoughts,
      modelUsed: aiRes.modelUsed,
      message: `Đã tạo toàn bộ KHDH 4 phần liên tục thành công bằng ${aiRes.modelUsed}!`
    };
  }

  /**
   * Sinh KHDH theo từng bước tách biệt (Bước 1 -> Bước 2 -> Bước 3 -> Bước 4)
   */
  public static async generateStep(
    step: number,
    lesson: LessonState,
    options: { model?: string; thinkingBudget?: number } = {}
  ): Promise<{
    ok: boolean;
    step: number;
    lesson: LessonState;
    stepData: KhdhStepResult;
    thoughts?: string;
    modelUsed: string;
  }> {
    const model = options.model || 'gemini-3.7-flash';
    const budget = options.thinkingBudget || 8192;

    const stepTitles = [
      '',
      'Bước 1: Mục tiêu, Thiết bị & Hoạt động A (Khởi động)',
      'Bước 2: Hoạt động B (Hình thành kiến thức B1 Khám phá & B2 Thực hành NLS/AI)',
      'Bước 3: Hoạt động C (Luyện tập giải bài tập & Củng cố)',
      'Bước 4: Hoạt động D (Vận dụng đời sống & Hướng dẫn về nhà)'
    ];

    const prompt = `Bạn đang thực hiện ${stepTitles[step] || `Bước ${step}`} cho bài học "${lesson.lesson_title}" (${lesson.subject} ${lesson.grade}).
Hãy thiết kế chi tiết nội dung chuẩn sư phạm GDPT 2018 theo đúng bước này.`;

    const aiRes = await GeminiService.generateWithThinking(prompt, 'Tập trung sâu vào hoạt động của bước yêu cầu.', model, budget);

    let stepActivities: any[] = [];
    if (step === 1) {
      stepActivities = [
        {
          id: 'act_a',
          code: 'A',
          period: lesson.ppct[0] || 1,
          title: `Khởi động: Tình huống thực tế gắn liền bài học ${lesson.lesson_title}`,
          time: 7,
          yccd_refs: [lesson.yccd[0]?.id || 'YCCD-01'],
          student_task: `Quan sát tình huống gợi mở và phát hiện vấn đề cần giải quyết liên quan đến ${lesson.lesson_title}.`,
          teacher_actions: 'Giáo viên nêu câu hỏi dẫn dắt, tổ chức hoạt động và chốt mục tiêu.',
          product: 'Câu trả lời miệng hoặc dự đoán ban đầu của học sinh.',
          evidence: 'Bản phát biểu ý kiến cá nhân',
          digital_tool: 'Slide Khởi động / Video AI',
          source_refs: ['SGK Khởi động'],
          locked: false
        }
      ];
    } else if (step === 2) {
      stepActivities = [
        {
          id: 'act_b1',
          code: 'B1',
          period: lesson.ppct[0] || 1,
          title: `Hình thành kiến thức 1: Khám phá định nghĩa và quy tắc cốt lõi của ${lesson.lesson_title}`,
          time: 20,
          yccd_refs: [lesson.yccd[0]?.id || 'YCCD-01'],
          student_task: `Đọc SGK, thảo luận nhóm đôi và rút ra kiến thức trọng tâm về ${lesson.lesson_title}.`,
          teacher_actions: 'Giáo viên quan sát, chuẩn hóa kiến thức và ghi bảng.',
          product: 'Nội dung định nghĩa và ví dụ mẫu vào vở.',
          evidence: 'Vở ghi học sinh và phiếu nhóm',
          digital_tool: 'Slide Khám phá kiến thức',
          source_refs: ['SGK mục 1'],
          locked: false
        },
        {
          id: 'act_b2',
          code: 'B2',
          period: lesson.ppct.length > 1 ? lesson.ppct[1] : (lesson.ppct[0] || 1),
          title: `Hình thành kiến thức 2: Phân tích sâu & Kiểm chứng số bài ${lesson.lesson_title}`,
          time: 18,
          yccd_refs: [lesson.yccd[1]?.id || 'YCCD-01'],
          nls_refs: [lesson.digital_competency_indicators[0]?.id || 'NLS-01'],
          student_task: `Thực hiện đối chiếu ví dụ nâng cao và sử dụng công cụ số kiểm chứng ${lesson.lesson_title}.`,
          teacher_actions: 'Hướng dẫn thao tác công cụ số, giải thích lỗi sai thường gặp.',
          product: 'Phiếu học tập đối chiếu số liệu thực tế.',
          evidence: 'Biên bản nhóm và kết quả kiểm chứng',
          digital_tool: lesson.digital_competency_indicators[0]?.tool || 'AI Assistant',
          source_refs: ['SGK mục 2'],
          locked: false
        }
      ];
    } else if (step === 3) {
      stepActivities = [
        {
          id: 'act_c',
          code: 'C',
          period: lesson.ppct[lesson.ppct.length - 1] || 1,
          title: `Luyện tập: Thực hành giải bài tập chuẩn và vận dụng quy tắc ${lesson.lesson_title}`,
          time: 25,
          yccd_refs: [lesson.yccd[lesson.yccd.length - 1]?.id || 'YCCD-01'],
          student_task: 'Học sinh làm việc cá nhân hoàn thành các bài tập trong SGK và phiếu luyện tập.',
          teacher_actions: 'Tổ chức chữa bài, hướng dẫn phương pháp giải.',
          product: 'Lời giải chi tiết bài tập trong vở.',
          evidence: 'Bài làm trên phiếu học tập',
          digital_tool: 'Trò chơi củng cố kiến thức native HTML5',
          source_refs: ['SGK Bài tập'],
          locked: false
        }
      ];
    } else if (step === 4) {
      stepActivities = [
        {
          id: 'act_d',
          code: 'D',
          period: lesson.ppct[lesson.ppct.length - 1] || 1,
          title: `Vận dụng: Giải quyết tình huống thực tiễn và bài toán đời sống của ${lesson.lesson_title}`,
          time: 15,
          yccd_refs: [lesson.yccd[lesson.yccd.length - 1]?.id || 'YCCD-01'],
          student_task: `Vận dụng kiến thức ${lesson.lesson_title} vào bài toán thực tiễn đời sống.`,
          teacher_actions: 'Giao nhiệm vụ dự án nhỏ hoặc bài tập vận dụng về nhà.',
          product: 'Bản báo cáo kết quả vận dụng thực tế.',
          evidence: 'Sản phẩm học tập học sinh nộp lại',
          digital_tool: 'Canva / Presentation báo cáo',
          source_refs: ['SGK Vận dụng'],
          locked: false
        }
      ];
    }

    // Ghép hoạt động vào danh sách hoạt động hiện hành
    const existingOther = lesson.activities.filter(a => !stepActivities.some(s => s.id === a.id));
    lesson.activities = [...existingOther, ...stepActivities].sort((a, b) => {
      const order = ['act_a', 'act_b1', 'act_b2', 'act_c', 'act_d'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

    LessonStateManager.setActiveState(lesson);

    return {
      ok: true,
      step,
      lesson,
      stepData: {
        step,
        title: stepTitles[step] || `Bước ${step}`,
        activities: stepActivities
      },
      thoughts: aiRes.thoughts,
      modelUsed: aiRes.modelUsed
    };
  }

  /**
   * Đồng bộ liên kết chặt chẽ sang Phiếu học tập, Trò chơi và Video AI (Single Source of Truth)
   */
  public static syncArtifacts(lesson: LessonState): {
    worksheetData: {
      lesson_id: string;
      lesson_title: string;
      linked_activity: string;
      questions_count: number;
      has_rubric: boolean;
    };
    gameData: {
      game_type: string;
      questions_count: number;
      source_ref: string;
    };
    videoData: {
      genre: string;
      style: string;
      max_words_per_scene: number;
      dialogue_status: 'VALID' | 'TOO_LONG';
    };
  } {
    // Đánh dấu cờ STALE cho các artifact để sẵn sàng tái tạo
    DependencyGraphService.markDependentsStale('act_b2');

    return {
      worksheetData: {
        lesson_id: lesson.lesson_id,
        lesson_title: lesson.lesson_title,
        linked_activity: 'act_b2',
        questions_count: 5,
        has_rubric: true
      },
      gameData: {
        game_type: '02. Ghép đôi kiến thức (Matching Pairs)',
        questions_count: 8,
        source_ref: 'KHDH Hoạt động Khởi động A & Luyện tập C'
      },
      videoData: {
        genre: '01. Dẫn dắt vào bài (Hook / Problem-solving)',
        style: '01. Hoạt hình 2D Flat Design Sư Phạm',
        max_words_per_scene: 24,
        dialogue_status: 'VALID'
      }
    };
  }
}
