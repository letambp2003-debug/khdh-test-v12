"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.FileStorageManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
class FileStorageManager {
    static instance;
    uploadDir;
    exportsDir;
    constructor() {
        this.uploadDir = config_1.CONFIG.STORAGE_DIR;
        this.exportsDir = config_1.CONFIG.EXPORTS_DIR;
        this.ensureDirs();
    }
    static getInstance() {
        if (!FileStorageManager.instance) {
            FileStorageManager.instance = new FileStorageManager();
        }
        return FileStorageManager.instance;
    }
    ensureDirs() {
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.exportsDir)) {
            fs_1.default.mkdirSync(this.exportsDir, { recursive: true });
        }
    }
    ping() {
        try {
            this.ensureDirs();
            const testFile = path_1.default.join(this.uploadDir, `.health_check_${Date.now()}.tmp`);
            fs_1.default.writeFileSync(testFile, 'KHDH_STORAGE_OK', 'utf8');
            fs_1.default.unlinkSync(testFile);
            return { ok: true, uploadDir: this.uploadDir, writable: true };
        }
        catch (err) {
            return { ok: false, uploadDir: this.uploadDir, writable: false };
        }
    }
    saveUpload(filename, buffer) {
        this.ensureDirs();
        const safeFilename = `${Date.now()}_${path_1.default.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetPath = path_1.default.join(this.uploadDir, safeFilename);
        fs_1.default.writeFileSync(targetPath, buffer);
        return { filepath: targetPath, size: buffer.length };
    }
    saveExport(filename, content) {
        this.ensureDirs();
        const targetPath = path_1.default.join(this.exportsDir, filename);
        fs_1.default.writeFileSync(targetPath, content);
        return targetPath;
    }
    getFilePath(relativePath) {
        const fullPath = path_1.default.resolve(relativePath);
        if (fs_1.default.existsSync(fullPath)) {
            return fullPath;
        }
        return null;
    }
}
exports.FileStorageManager = FileStorageManager;
exports.storage = FileStorageManager.getInstance();
