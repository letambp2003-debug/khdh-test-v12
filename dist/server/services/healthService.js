"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const database_1 = require("../db/database");
const fileStorage_1 = require("../storage/fileStorage");
const authService_1 = require("./authService");
const geminiService_1 = require("./geminiService");
const sourceParser_1 = require("../parsers/sourceParser");
const lessonStateManager_1 = require("./lessonStateManager");
class HealthCheckService {
    static checkAll() {
        const dbPing = database_1.db.ping();
        const storagePing = fileStorage_1.storage.ping();
        const authPing = authService_1.AuthService.ping();
        const geminiPing = geminiService_1.GeminiService.ping();
        const parserPing = sourceParser_1.SourceParser.ping();
        const activeLesson = lessonStateManager_1.LessonStateManager.getActiveState();
        const connections = {
            database: {
                name: 'Cơ sở dữ liệu (Typed JSON / SQLite)',
                connected: dbPing.ok,
                status: dbPing.ok ? 'CONNECTED' : 'DISCONNECTED',
                details: dbPing,
                message: dbPing.ok ? 'Cơ sở dữ liệu sẵn sàng đọc ghi' : 'DISCONNECTED: Lỗi quyền truy cập file database'
            },
            file_storage: {
                name: 'Hệ thống lưu trữ tệp (File Storage)',
                connected: storagePing.ok,
                status: storagePing.ok ? 'CONNECTED' : 'DISCONNECTED',
                details: storagePing,
                message: storagePing.ok ? 'Thư mục storage sẵn sàng ghi tệp' : 'DISCONNECTED: Thư mục storage không có quyền ghi'
            },
            google_auth: {
                name: 'Xác thực Google OAuth',
                connected: authPing.ok,
                status: authPing.ok ? 'CONNECTED' : 'DISCONNECTED',
                details: authPing.user,
                message: authPing.status
            },
            gemini_api: {
                name: 'Khóa Google AI (Gemini) API Key',
                connected: geminiPing.ok,
                status: geminiPing.ok ? 'CONNECTED' : 'DISCONNECTED',
                details: { status: geminiPing.status, keyCount: geminiPing.keyCount, maskedKey: geminiPing.maskedKey, maskedKeys: geminiPing.maskedKeys },
                message: geminiPing.message
            },
            source_parsers: {
                name: 'Bộ bóc tách nguồn (DOCX/PDF Parsers)',
                connected: parserPing.ok,
                status: parserPing.ok ? 'CONNECTED' : 'DISCONNECTED',
                details: parserPing.parsers,
                message: 'Parser DOCX & PDF sẵn sàng bóc tách'
            },
            lesson_state: {
                name: 'Hạt nhân trạng thái LESSON_STATE',
                connected: activeLesson !== null,
                status: activeLesson !== null ? 'CONNECTED' : 'DISCONNECTED',
                details: activeLesson ? { lesson_id: activeLesson.lesson_id, title: activeLesson.lesson_title } : null,
                message: activeLesson !== null
                    ? `Đã liên kết bài: ${activeLesson.lesson_title}`
                    : 'DISCONNECTED: Chưa có bài học nào được nạp vào LESSON_STATE'
            }
        };
        const criticalConnected = connections.database.connected && connections.file_storage.connected;
        let overall = 'HEALTHY';
        if (!criticalConnected) {
            overall = 'UNHEALTHY';
        }
        else if (!connections.gemini_api.connected || !connections.google_auth.connected) {
            overall = 'DEGRADED';
        }
        return {
            overall_status: overall,
            timestamp: new Date().toISOString(),
            connections
        };
    }
}
exports.HealthCheckService = HealthCheckService;
