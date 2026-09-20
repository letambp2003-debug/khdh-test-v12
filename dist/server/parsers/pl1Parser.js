"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pl1Parser = void 0;
const sourceParser_1 = require("./sourceParser");
class Pl1Parser {
    static extract(buffer, filename) {
        const raw = sourceParser_1.SourceParser.parseDocxBuffer(buffer);
        const content = raw.text;
        const fnLower = filename.toLowerCase();
        // 1. Detect Subject
        let subject = 'Toán';
        const cLower = content.toLowerCase();
        if (fnLower.includes('khtn') || fnLower.includes('khoa học tự nhiên') || cLower.includes('khoa học tự nhiên') || cLower.includes('tốc độ')) {
            subject = 'Khoa học tự nhiên';
        }
        else if (fnLower.includes('tin') || fnLower.includes('thông tin') || cLower.includes('tin học') || cLower.includes('thuật toán')) {
            subject = 'Tin học';
        }
        else if (fnLower.includes('lí') || fnLower.includes('vật lý') || cLower.includes('vật lí') || cLower.includes('vật lý')) {
            subject = 'Vật lí';
        }
        else if (fnLower.includes('hóa') || cLower.includes('hóa học')) {
            subject = 'Hóa học';
        }
        else if (fnLower.includes('sinh') || cLower.includes('sinh học')) {
            subject = 'Sinh học';
        }
        else if (fnLower.includes('văn') || cLower.includes('ngữ văn')) {
            subject = 'Ngữ văn';
        }
        else if (fnLower.includes('sử') || fnLower.includes('địa') || cLower.includes('lịch sử') || cLower.includes('địa lí')) {
            subject = 'Lịch sử & Địa lí';
        }
        else if (fnLower.includes('anh') || fnLower.includes('english') || cLower.includes('tiếng anh')) {
            subject = 'Tiếng Anh';
        }
        else if (fnLower.includes('công nghệ') || cLower.includes('công nghệ')) {
            subject = 'Công nghệ';
        }
        // 2. Detect Grade (6-12)
        let grade = 8;
        const gradeMatch = content.match(/(?:lớp|khối|grade|k)\s*(\d{1,2})/i) || filename.match(/(?:toán|khtn|tin|văn|lí|hóa|sinh|anh|[a-z])\s*(\d{1,2})/i);
        if (gradeMatch && gradeMatch[1]) {
            const g = parseInt(gradeMatch[1], 10);
            if (g >= 6 && g <= 12)
                grade = g;
        }
        else if (subject === 'Khoa học tự nhiên') {
            grade = 7;
        }
        // 3. Detect Lesson Title
        let lesson_title = '';
        const titleMatch = content.match(/(?:Tên bài|Tên bài học|BÀI HỌC|BÀI DẠY|KẾ HOẠCH BÀI DẠY)[:\s\-–—]+([^\n\r]+)/i)
            || content.match(/(?:Bài|Chủ đề)\s*(\d+)[:\.\s\-–—]+([^\n\r,\.]+)/i);
        if (titleMatch) {
            lesson_title = (titleMatch[2] || titleMatch[1]).trim().replace(/^[0-9\.\:\s\-]+/, '').trim();
        }
        if (!lesson_title || lesson_title.length < 3) {
            // Try extracting from filename, e.g. PL1_Toan8_DaThuc.docx
            const cleanFn = filename.replace(/\.(docx|doc|pdf)$/i, '').replace(/^[A-Za-z0-9]+[_\-\s]+/, '');
            const parts = cleanFn.split(/[_\-]+/);
            if (parts.length > 1) {
                lesson_title = parts[parts.length - 1];
            }
            else if (cleanFn.length > 3) {
                lesson_title = cleanFn;
            }
        }
        if (!lesson_title || lesson_title.length < 3) {
            // Default based on detected subject
            if (subject === 'Khoa học tự nhiên')
                lesson_title = 'Tốc độ chuyển động';
            else if (subject === 'Tin học')
                lesson_title = 'Thuật toán tìm kiếm tuần tự';
            else
                lesson_title = 'Đa thức';
        }
        // 4. Detect Chapter
        let chapter = `Chương I. ${lesson_title}`;
        const chapterMatch = content.match(/(?:Chương|Chủ đề)\s*([0-9IVXLCDM]+)[:\.\s\-–—]+([^\n\r,\.]+)/i);
        if (chapterMatch) {
            chapter = `Chương ${chapterMatch[1]}. ${chapterMatch[2].trim()}`;
        }
        // 5. Detect Periods and PPCT
        let total_periods = 2;
        const periodMatch = content.match(/(?:số tiết|thời lượng|thời gian)[:\s]*(\d+)\s*tiết?/i)
            || content.match(/\((\d+)\s*tiết\)/i)
            || content.match(/(\d+)\s*tiết/i);
        if (periodMatch && periodMatch[1]) {
            const p = parseInt(periodMatch[1], 10);
            if (p >= 1 && p <= 10)
                total_periods = p;
        }
        let ppct = [];
        const ppctMatch = content.match(/(?:tiết ppct|tiết theo ppct|ppct|tiết thứ|tiết)[:\s]*([0-9,\s\-–]+)/i);
        if (ppctMatch && ppctMatch[1]) {
            const parts = ppctMatch[1].split(/[,–\-]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            if (parts.length > 1 && ppctMatch[1].includes('-') && parts[0] < parts[parts.length - 1]) {
                for (let i = parts[0]; i <= parts[parts.length - 1]; i++)
                    ppct.push(i);
            }
            else if (parts.length > 0) {
                ppct = parts;
            }
        }
        if (ppct.length === 0) {
            ppct = Array.from({ length: total_periods }, (_, i) => i + 1);
        }
        let weeks = [3];
        const weekMatch = content.match(/(?:tuần|tuần thứ)[:\s]*(\d+)/i);
        if (weekMatch && weekMatch[1]) {
            weeks = [parseInt(weekMatch[1], 10)];
        }
        // 6. Extract YCCĐ (Yêu cầu cần đạt) from real text
        const yccd = [];
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        let yccdIndex = 1;
        for (const line of lines) {
            const lLower = line.toLowerCase();
            const isBullet = /^[\-\+•\*\d\.\)a-d\)]+/.test(line);
            const hasActionVerb = /nhận biết|nêu được|chỉ ra|mô tả|phát biểu|thông hiểu|giải thích|phân biệt|so sánh|vận dụng|thực hành|tính toán|giải quyết/.test(lLower);
            if (isBullet && hasActionVerb && line.length >= 15) {
                const cleanText = line.replace(/^[\-\+•\*\d\.\)a-d\)\s]+/, '').trim();
                let level = 'THONG_HIEU';
                if (/nhận biết|nêu được|chỉ ra|mô tả|phát biểu|liệt kê/.test(lLower))
                    level = 'NHAN_BIET';
                else if (/vận dụng|thực hành|giải quyết|tính toán|chứng minh/.test(lLower))
                    level = 'VAN_DUNG';
                yccd.push({
                    id: `YCCD-0${yccdIndex++}`,
                    text: cleanText,
                    level
                });
                if (yccd.length >= 5)
                    break;
            }
        }
        // If none found from bullet scan, generate standard YCCĐ for this lesson
        if (yccd.length === 0) {
            yccd.push({ id: 'YCCD-01', text: `Nhận biết được khái niệm cốt lõi của bài học ${lesson_title}.`, level: 'NHAN_BIET' }, { id: 'YCCD-02', text: `Thông hiểu và giải thích được quy tắc bài học ${lesson_title}.`, level: 'THONG_HIEU' }, { id: 'YCCD-03', text: `Vận dụng được kiến thức bài ${lesson_title} vào bài toán thực tiễn.`, level: 'VAN_DUNG' });
        }
        // 7. Extract NLS Indicators
        const nls_indicators = [
            {
                id: 'NLS-01',
                indicator: `Sử dụng công cụ số hoặc chatbot để tra cứu và đối chiếu kiểm chứng bài ${lesson_title}`,
                target_activity: 'act_b2',
                tool: 'AI Assistant / WebApp Simulator',
                student_action: 'Học sinh nhập dữ liệu vào công cụ số, kiểm tra kết quả và đối chiếu với SGK để phát hiện lỗi sai',
                product: 'Phiếu học tập đối chiếu số',
                evidence: 'Bản đối chiếu kiểm chứng có xác nhận của giáo viên'
            }
        ];
        // If text mentions specific digital tools
        if (cLower.includes('phần mềm') || cLower.includes('mô phỏng') || cLower.includes('geogebra') || cLower.includes('python')) {
            nls_indicators[0].tool = 'Phần mềm mô phỏng chuyên ngành';
            nls_indicators[0].student_action = 'Học sinh thao tác trên phần mềm mô phỏng và so sánh kết quả thực nghiệm với lý thuyết SGK';
        }
        return {
            lesson_title,
            subject,
            grade,
            chapter,
            total_periods,
            ppct,
            weeks,
            yccd,
            nls_indicators
        };
    }
}
exports.Pl1Parser = Pl1Parser;
