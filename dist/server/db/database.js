"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const DEFAULT_SCHEMA = {
    projects: {},
    lessons: {},
    artifacts: {},
    teacher_preferences: {},
    audit_logs: [],
    metadata: {
        version: '12.2.0-rc2',
        initialized_at: new Date().toISOString(),
        last_write: new Date().toISOString()
    }
};
class Database {
    static instance;
    dbPath;
    memoryData;
    writeLock = false;
    constructor() {
        this.dbPath = config_1.CONFIG.DB_PATH;
        this.ensureDirectory();
        this.memoryData = this.load();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    ensureDirectory() {
        const dir = path_1.default.dirname(this.dbPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    load() {
        try {
            if (fs_1.default.existsSync(this.dbPath)) {
                const raw = fs_1.default.readFileSync(this.dbPath, 'utf8');
                return JSON.parse(raw);
            }
            const seedPath = path_1.default.resolve(process.cwd(), 'storage/database.json');
            if (fs_1.default.existsSync(seedPath)) {
                const seedRaw = fs_1.default.readFileSync(seedPath, 'utf8');
                const parsed = JSON.parse(seedRaw);
                this.saveImmediate(parsed);
                return parsed;
            }
        }
        catch (err) {
            console.warn('[DB] Lỗi đọc cơ sở dữ liệu hiện hữu, khởi tạo lại schema mới:', err);
        }
        this.saveImmediate(DEFAULT_SCHEMA);
        return DEFAULT_SCHEMA;
    }
    saveImmediate(data) {
        this.ensureDirectory();
        const tempPath = `${this.dbPath}.tmp`;
        data.metadata.last_write = new Date().toISOString();
        fs_1.default.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
        fs_1.default.renameSync(tempPath, this.dbPath);
    }
    commit() {
        if (this.writeLock)
            return;
        this.writeLock = true;
        try {
            this.saveImmediate(this.memoryData);
        }
        finally {
            this.writeLock = false;
        }
    }
    // Health-check verification
    ping() {
        try {
            this.ensureDirectory();
            const testKey = `_ping_${Date.now()}`;
            this.memoryData.audit_logs.push({
                timestamp: new Date().toISOString(),
                action: 'DB_PING',
                details: { ping: testKey }
            });
            // Keep audit log to max 200 items
            if (this.memoryData.audit_logs.length > 200) {
                this.memoryData.audit_logs = this.memoryData.audit_logs.slice(-100);
            }
            this.commit();
            return {
                ok: true,
                path: this.dbPath,
                records: Object.keys(this.memoryData.lessons).length + Object.keys(this.memoryData.artifacts).length
            };
        }
        catch (err) {
            return { ok: false, path: this.dbPath, records: 0 };
        }
    }
    // CRUD for LESSON_STATE
    getLessonState(lessonId) {
        return this.memoryData.lessons[lessonId] || null;
    }
    getAllLessons() {
        return Object.values(this.memoryData.lessons);
    }
    saveLessonState(lessonState) {
        if (!lessonState || !lessonState.lesson_id) {
            throw new Error('Lesson State requires a valid lesson_id');
        }
        this.memoryData.lessons[lessonState.lesson_id] = {
            ...lessonState,
            updated_at: new Date().toISOString()
        };
        this.commit();
    }
    // CRUD for Artifacts
    getArtifact(artifactId) {
        return this.memoryData.artifacts[artifactId] || null;
    }
    getArtifactsByLesson(lessonId) {
        return Object.values(this.memoryData.artifacts).filter((a) => a.lesson_id === lessonId);
    }
    saveArtifact(artifact) {
        if (!artifact || !artifact.artifact_id) {
            throw new Error('Artifact requires an artifact_id');
        }
        this.memoryData.artifacts[artifact.artifact_id] = {
            ...artifact,
            updated_at: new Date().toISOString()
        };
        this.commit();
    }
    markArtifactStale(artifactId, stale = true) {
        if (this.memoryData.artifacts[artifactId]) {
            this.memoryData.artifacts[artifactId].stale = stale;
            this.commit();
        }
    }
    // CRUD for Preferences
    savePreference(pref) {
        this.memoryData.teacher_preferences[pref.preference_id] = pref;
        this.commit();
    }
    getPreferences(userId) {
        return Object.values(this.memoryData.teacher_preferences).filter(p => p.user_id === userId || p.scope === 'ALL_MY_LESSONS');
    }
}
exports.Database = Database;
exports.db = Database.getInstance();
