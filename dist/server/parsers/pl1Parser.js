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
        // 8. Extract Full Lesson Catalog from PL1
        const catalog = [];
        const seenTitles = new Set();
        // Primary current lesson as first entry
        const primaryItem = {
            id: 'cat_item_01',
            lesson_title,
            subject,
            grade,
            chapter,
            total_periods,
            ppct,
            weeks,
            yccd: [...yccd],
            nls_indicators: [...nls_indicators]
        };
        catalog.push(primaryItem);
        seenTitles.add(lesson_title.toLowerCase());
        // Scan for other lessons in the document text
        const lessonRegex = /(?:BÀI|Bài|Chủ đề|CHỦ ĐỀ)\s*(\d+|[IVXLCDM]+)[\.\:\s\-–—]+([^\n\r\(\)]+?)(?:\s*\((\d+)\s*tiết\))?(?=[\n\r]|$)/gi;
        let match;
        let itemIdx = 2;
        while ((match = lessonRegex.exec(content)) !== null) {
            const num = match[1];
            const rawTitle = match[2].trim().replace(/^[:\.\-\s]+/, '').trim();
            const normTitle = rawTitle.toLowerCase();
            if (rawTitle.length >= 3 && !seenTitles.has(normTitle) && !normTitle.includes('kiểm tra') && !normTitle.includes('ôn tập')) {
                seenTitles.add(normTitle);
                const itemPeriods = match[3] ? parseInt(match[3], 10) : 2;
                const itemPpctStart = (itemIdx - 1) * 2 + 1;
                const itemPpct = Array.from({ length: itemPeriods }, (_, i) => itemPpctStart + i);
                const itemWeek = Math.floor((itemIdx - 1) / 2) + 1;
                catalog.push({
                    id: `cat_item_0${itemIdx++}`,
                    lesson_title: rawTitle,
                    subject,
                    grade,
                    chapter: `Chương ${num}. ${rawTitle}`,
                    total_periods: itemPeriods,
                    ppct: itemPpct,
                    weeks: [itemWeek],
                    yccd: [
                        { id: 'YCCD-01', text: `Nhận biết và nêu được các định nghĩa, quy tắc của bài ${rawTitle}.`, level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: `Thông hiểu, phân tích và áp dụng các tính chất trọng tâm trong bài ${rawTitle}.`, level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: `Vận dụng kiến thức bài ${rawTitle} vào giải quyết bài tập và tình huống thực tiễn.`, level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [
                        {
                            id: 'NLS-01',
                            indicator: `Sử dụng công cụ số hoặc mô phỏng tra cứu, đối chiếu bài ${rawTitle}`,
                            target_activity: 'act_b2',
                            tool: 'AI Assistant / WebApp Simulator',
                            student_action: 'Học sinh nhập dữ liệu vào công cụ số, kiểm tra kết quả và đối chiếu SGK',
                            product: 'Bản đối chiếu số',
                            evidence: 'Phiếu học tập đối chiếu số'
                        }
                    ]
                });
            }
            if (catalog.length >= 10)
                break;
        }
        // If catalog has few items, supplement standard GDPT 2018 curriculum for this subject & grade
        if (catalog.length < 3) {
            const standards = Pl1Parser.getStandardCurriculum(subject, grade);
            for (const std of standards) {
                if (!seenTitles.has(std.lesson_title.toLowerCase())) {
                    seenTitles.add(std.lesson_title.toLowerCase());
                    catalog.push(std);
                }
            }
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
            nls_indicators,
            catalog
        };
    }
    static getStandardCurriculum(subject, grade) {
        const sNorm = (subject || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (sNorm.includes('toan')) {
            if (grade === 6) {
                return [
                    {
                        id: 'std_toan6_01',
                        lesson_title: 'Tập hợp và phần tử của tập hợp',
                        subject: 'Toán',
                        grade: 6,
                        chapter: 'Chương I. Số tự nhiên',
                        total_periods: 2,
                        ppct: [1, 2],
                        weeks: [1],
                        yccd: [
                            { id: 'YCCD-01', text: 'Nhận biết được tập hợp và các phần tử của tập hợp.', level: 'NHAN_BIET' },
                            { id: 'YCCD-02', text: 'Sử dụng được các kí hiệu thuộc, không thuộc tập hợp.', level: 'THONG_HIEU' },
                            { id: 'YCCD-03', text: 'Mô tả được một tập hợp bằng cách liệt kê hoặc nêu tính chất đặc trưng.', level: 'VAN_DUNG' }
                        ],
                        nls_indicators: [{ id: 'NLS-01', indicator: 'Sử dụng phần mềm sơ đồ Venn', target_activity: 'act_b2', tool: 'GeoGebra / VennTool', student_action: 'Biểu diễn tập hợp trực quan', product: 'Sơ đồ Venn', evidence: 'Phiếu học tập' }]
                    },
                    {
                        id: 'std_toan6_02',
                        lesson_title: 'Hình vuông - Tam giác đều - Lục giác đều',
                        subject: 'Toán',
                        grade: 6,
                        chapter: 'Chương III. Hình học trực quan',
                        total_periods: 2,
                        ppct: [15, 16],
                        weeks: [8],
                        yccd: [
                            { id: 'YCCD-01', text: 'Nhận dạng được hình vuông, tam giác đều, lục giác đều.', level: 'NHAN_BIET' },
                            { id: 'YCCD-02', text: 'Mô tả được các yếu tố cơ bản: cạnh, góc, đường chéo.', level: 'THONG_HIEU' },
                            { id: 'YCCD-03', text: 'Vẽ và gấp được hình vuông, tam giác đều bằng thước và compa.', level: 'VAN_DUNG' }
                        ],
                        nls_indicators: [{ id: 'NLS-01', indicator: 'Dùng phần mềm vẽ hình trực quan', target_activity: 'act_b2', tool: 'GeoGebra 3D/Geometry', student_action: 'Vẽ và đo đạc cạnh góc', product: 'File vẽ hình', evidence: 'Ảnh chụp màn hình' }]
                    }
                ];
            }
            return [
                {
                    id: 'std_toan8_01',
                    lesson_title: 'Đơn thức và đa thức nhiều biến',
                    subject: 'Toán',
                    grade: 8,
                    chapter: 'Chương I. Đa thức',
                    total_periods: 2,
                    ppct: [1, 2],
                    weeks: [1],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nhận biết được đơn thức, đa thức nhiều biến.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Thu gọn được đơn thức, đa thức.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Tính được giá trị của đa thức khi biết giá trị của các biến.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Dùng máy tính cầm tay hoặc CAS kiểm tra', target_activity: 'act_b2', tool: 'CAS Simulator', student_action: 'Nhập đa thức kiểm tra nghiệm', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập' }]
                },
                {
                    id: 'std_toan8_02',
                    lesson_title: 'Hằng đẳng thức đáng nhớ',
                    subject: 'Toán',
                    grade: 8,
                    chapter: 'Chương I. Đa thức',
                    total_periods: 3,
                    ppct: [7, 8, 9],
                    weeks: [4],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nhận biết được 7 hằng đẳng thức đáng nhớ.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Vận dụng được hằng đẳng thức để khai triển và rút gọn biểu thức.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Tính nhanh giá trị biểu thức và giải phương trình tích.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Mô phỏng hình học của hằng đẳng thức', target_activity: 'act_b2', tool: 'GeoGebra Area Model', student_action: 'Chia diện tích hình vuông minh họa (a+b)^2', product: 'Mô hình diện tích', evidence: 'Phiếu học tập' }]
                },
                {
                    id: 'std_toan8_03',
                    lesson_title: 'Phân tích đa thức thành nhân tử',
                    subject: 'Toán',
                    grade: 8,
                    chapter: 'Chương I. Đa thức',
                    total_periods: 2,
                    ppct: [10, 11],
                    weeks: [5],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nhận biết thế nào là phân tích đa thức thành nhân tử.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Vận dụng các phương pháp: đặt nhân tử chung, dùng hằng đẳng thức, nhóm hạng tử.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Giải được bài toán tìm x và chứng minh chia hết.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Kiểm tra phân tích nhân tử qua công cụ số', target_activity: 'act_b2', tool: 'WolframAlpha / AI Solver', student_action: 'Đối chiếu kết quả phân tích', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập' }]
                },
                {
                    id: 'std_toan8_04',
                    lesson_title: 'Bài 5. Phép chia đa thức cho đơn thức',
                    subject: 'Toán',
                    grade: 8,
                    chapter: 'Chương I: Đa thức',
                    total_periods: 1,
                    ppct: [11],
                    weeks: [6],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nhận biết được quy tắc chia đa thức cho đơn thức trong trường hợp chia hết.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Thực hiện thành thạo phép chia từng hạng tử của đa thức cho đơn thức rồi cộng kết quả lại.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Vận dụng phép chia đa thức cho đơn thức vào bài toán tìm x và rút gọn biểu thức.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Kiểm tra phép chia đa thức bằng công cụ số hoặc CAS', target_activity: 'act_b2', tool: 'WebApp Math Assistant', student_action: 'Đối chiếu kết quả phép chia đa thức', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập' }]
                }
            ];
        }
        else if (sNorm.includes('khoa hoc') || sNorm.includes('khtn')) {
            return [
                {
                    id: 'std_khtn7_01',
                    lesson_title: 'Phương pháp và kĩ năng học tập môn Khoa học tự nhiên',
                    subject: 'Khoa học tự nhiên',
                    grade: 7,
                    chapter: 'Mở đầu',
                    total_periods: 2,
                    ppct: [1, 2],
                    weeks: [1],
                    yccd: [
                        { id: 'YCCD-01', text: 'Trình bày được một số phương pháp và kĩ năng trong học tập môn KHTN.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Thực hiện được các kĩ năng quan sát, phân loại, liên kết, đo, dự báo.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Lập được kế hoạch nghiên cứu và viết báo cáo thí nghiệm.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Ghi chép số liệu thí nghiệm bằng bảng tính số', target_activity: 'act_b2', tool: 'Google Sheets / Excel', student_action: 'Nhập dữ liệu và vẽ biểu đồ', product: 'Biểu đồ số liệu', evidence: 'File bảng tính' }]
                },
                {
                    id: 'std_khtn7_02',
                    lesson_title: 'Nguyên tử - Cấu tạo nguyên tử',
                    subject: 'Khoa học tự nhiên',
                    grade: 7,
                    chapter: 'Chủ đề 1. Nguyên tử - Nguyên tố hóa học',
                    total_periods: 3,
                    ppct: [3, 4, 5],
                    weeks: [2],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nêu được mô hình nguyên tử của Rutherford - Bohr.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Nêu được điện tích, khối lượng của proton, neutron và electron.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Xác định được số hạt p, e, n và khối lượng nguyên tử của một số nguyên tố.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Mô phỏng cấu tạo nguyên tử 3D', target_activity: 'act_b2', tool: 'PhET Interactive Simulation', student_action: 'Lắp ráp hạt p, n, e tạo nguyên tử', product: 'Ảnh chụp màn hình mô phỏng', evidence: 'Phiếu học tập thực hành' }]
                },
                {
                    id: 'std_khtn7_03',
                    lesson_title: 'Đo tốc độ và đồ thị quãng đường - thời gian',
                    subject: 'Khoa học tự nhiên',
                    grade: 7,
                    chapter: 'Chủ đề 3. Tốc độ',
                    total_periods: 2,
                    ppct: [18, 19],
                    weeks: [6],
                    yccd: [
                        { id: 'YCCD-01', text: 'Mô tả được cách đo tốc độ bằng đồng hồ bấm giây và cổng quang điện.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Vẽ được đồ thị quãng đường – thời gian từ bảng số liệu.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Xác định được tốc độ từ đồ thị quãng đường – thời gian.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Đo cảm biến và vẽ đồ thị số tự động', target_activity: 'act_b2', tool: 'Phyphox / Tracker', student_action: 'Ghi âm / cảm biến chuyển động xuất đồ thị', product: 'Đồ thị s-t số', evidence: 'Báo cáo thí nghiệm' }]
                }
            ];
        }
        else if (sNorm.includes('tin')) {
            return [
                {
                    id: 'std_tin8_01',
                    lesson_title: 'Thuật toán tìm kiếm tuần tự',
                    subject: 'Tin học',
                    grade: 8,
                    chapter: 'Chủ đề F. Giải quyết vấn đề với sự trợ giúp của máy tính',
                    total_periods: 2,
                    ppct: [3, 4],
                    weeks: [2],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nêu được ý tưởng của thuật toán tìm kiếm tuần tự.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Mô phỏng được từng bước thực hiện của thuật toán tìm kiếm tuần tự.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Viết được chương trình Python cài đặt thuật toán tìm kiếm tuần tự.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Chạy mô phỏng thuật toán trực quan', target_activity: 'act_b2', tool: 'VisuAlgo / Python Online', student_action: 'Chạy từng bước và quan sát con trỏ duyệt mảng', product: 'Mã nguồn chạy đúng', evidence: 'Bản in mã nguồn' }]
                },
                {
                    id: 'std_tin8_02',
                    lesson_title: 'Thuật toán tìm kiếm nhị phân',
                    subject: 'Tin học',
                    grade: 8,
                    chapter: 'Chủ đề F. Giải quyết vấn đề với sự trợ giúp của máy tính',
                    total_periods: 2,
                    ppct: [5, 6],
                    weeks: [3],
                    yccd: [
                        { id: 'YCCD-01', text: 'Giải thích được điều kiện áp dụng thuật toán tìm kiếm nhị phân (dãy đã sắp xếp).', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Mô phỏng được các bước thu hẹp khoảng tìm kiếm.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'So sánh được hiệu quả số bước lặp giữa tìm kiếm tuần tự và nhị phân.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Đo thời gian thực thi của hai thuật toán', target_activity: 'act_b2', tool: 'Python time module', student_action: 'Đo mili-giây với mảng 1.000 phần tử', product: 'Bảng đối chiếu thời gian', evidence: 'Phiếu học tập' }]
                }
            ];
        }
        else {
            return [
                {
                    id: 'std_gen_01',
                    lesson_title: 'Khám phá và hình thành kiến thức chuyên đề',
                    subject,
                    grade,
                    chapter: 'Chương I. Kiến thức cơ bản',
                    total_periods: 2,
                    ppct: [1, 2],
                    weeks: [1],
                    yccd: [
                        { id: 'YCCD-01', text: 'Nhận biết được các khái niệm và phạm trù trọng tâm.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Thông hiểu và phân tích được mối quan hệ giữa các thành tố.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Vận dụng kiến thức vào thực hành và giải quyết vấn đề thực tế.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Sử dụng công cụ số tra cứu và đối chiếu', target_activity: 'act_b2', tool: 'AI Assistant', student_action: 'Đối chiếu nguồn tin cậy', product: 'Bảng đối chiếu', evidence: 'Phiếu học tập' }]
                },
                {
                    id: 'std_gen_02',
                    lesson_title: 'Luyện tập và Vận dụng thực tiễn chuyên sâu',
                    subject,
                    grade,
                    chapter: 'Chương I. Kiến thức cơ bản',
                    total_periods: 2,
                    ppct: [3, 4],
                    weeks: [2],
                    yccd: [
                        { id: 'YCCD-01', text: 'Hệ thống hóa được các nội dung cốt lõi đã học.', level: 'NHAN_BIET' },
                        { id: 'YCCD-02', text: 'Phân tích và giải thích các trường hợp vận dụng thực tế.', level: 'THONG_HIEU' },
                        { id: 'YCCD-03', text: 'Thực hiện dự án nhỏ hoặc bài tập tổng hợp.', level: 'VAN_DUNG' }
                    ],
                    nls_indicators: [{ id: 'NLS-01', indicator: 'Tạo sản phẩm số báo cáo học tập', target_activity: 'act_b2', tool: 'Canva / Presentation Tool', student_action: 'Thiết kế infographic tóm tắt', product: 'Infographic', evidence: 'Tệp ảnh xuất bản' }]
                }
            ];
        }
    }
}
exports.Pl1Parser = Pl1Parser;
