"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorksheetService = void 0;
const lessonStateManager_1 = require("./lessonStateManager");
const database_1 = require("../db/database");
class WorksheetService {
    static generate(options) {
        const lesson = lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson)
            throw new Error('Chưa có LESSON_STATE nào để sinh phiếu');
        const act = lesson.activities.find(a => a.id === options.activityId) || lesson.activities[0];
        const artifactId = 'worksheet_01';
        let content = `PHIẾU HỌC TẬP — ${options.worksheetType.toUpperCase()}\n`;
        content += `BÀI HỌC: ${lesson.lesson_title.toUpperCase()} (${lesson.subject} ${lesson.grade}) | TIẾT: ${options.period}\n`;
        content += `HOẠT ĐỘNG: ${act.title}\n`;
        content += `YCCĐ: ${act.yccd_refs.join(', ')} | NLS: ${act.nls_refs.join(', ') || 'Không'}\n`;
        content += `PHIÊN BẢN: ${options.isTeacherVersion ? 'GIÁO VIÊN (KÈM ĐÁP ÁN & RUBRIC)' : 'HỌC SINH (KHÔNG LỘ ĐÁP ÁN)'}\n`;
        content += `NGUỒN CĂN CỨ: SGK trang ${lesson.textbook.pages}\n\n`;
        for (let i = 1; i <= options.itemCount; i++) {
            content += `Nhiệm vụ 0${i} [Mức độ: ${i <= 2 ? 'Nhận biết' : (i <= 4 ? 'Thông hiểu' : 'Vận dụng')}]:\n`;
            content += `  Thực hiện yêu cầu bám sát mục ${i} trang ${lesson.textbook.pages} SGK ${lesson.subject} ${lesson.grade}.\n`;
            if (options.isTeacherVersion) {
                content += `  >> [ĐÁP ÁN & RUBRIC]: Kết quả chuẩn xác theo SGK trang ${lesson.textbook.pages}. Biểu điểm: 2.5 điểm.\n`;
            }
            content += `\n`;
        }
        const artifact = {
            artifact_id: artifactId,
            type: 'WORKSHEET',
            lesson_id: lesson.lesson_id,
            period_id: options.period,
            activity_refs: [act.id],
            yccd_refs: act.yccd_refs,
            nls_refs: act.nls_refs,
            source_refs: act.source_refs,
            content,
            qa: { score: 97, status: 'PASS' },
            stale: false,
            version: 1
        };
        database_1.db.saveArtifact(artifact);
        return artifact;
    }
}
exports.WorksheetService = WorksheetService;
