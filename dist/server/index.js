"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const apiRoutes_1 = require("./routes/apiRoutes");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json({ limit: '50mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// API Routes
exports.app.use('/api', apiRoutes_1.apiRouter);
// Static frontend files
const publicDir = process.cwd();
exports.app.use(express_1.default.static(publicDir));
// Fallback to index.html for client routing
exports.app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api'))
        return next();
    res.sendFile(path_1.default.resolve(publicDir, 'index.html'));
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ ok: false, error: 'Malformed JSON payload' });
    }
    return res.status(500).json({ ok: false, error: err.message || 'Internal Server Error' });
});
if (require.main === module) {
    exports.app.listen(config_1.CONFIG.PORT, () => {
        console.log(`[SERVER] 🚀 ${config_1.CONFIG.APP_NAME} đang chạy tại: http://localhost:${config_1.CONFIG.PORT}`);
        console.log(`[SERVER] 🔍 Health-check endpoints: http://localhost:${config_1.CONFIG.PORT}/api/health/connections`);
    });
}
