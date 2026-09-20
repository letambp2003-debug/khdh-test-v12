import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';

export interface ProjectRecord {
  project_id: string;
  user_id: string;
  subject: string;
  grade: number;
  school_year: string;
  sources: {
    pl1?: { filename: string; uploadedAt: string; size: number };
    sgk?: { filename: string; uploadedAt: string; size: number };
    old_khdh?: { filename: string; uploadedAt: string; size: number };
    form?: { filename: string; uploadedAt: string; size: number };
  };
  created_at: string;
  updated_at: string;
}

export interface TeacherPreferenceRecord {
  preference_id: string;
  user_id: string;
  scope: 'THIS_LESSON' | 'THIS_SUBJECT' | 'THIS_GRADE' | 'ALL_MY_LESSONS';
  subject?: string;
  grade?: number;
  rule: string;
  priority: number;
  enabled: boolean;
  created_at: string;
}

export interface DatabaseSchema {
  projects: Record<string, ProjectRecord>;
  lessons: Record<string, any>; // Stores LESSON_STATE
  artifacts: Record<string, any>; // Stores ARTIFACT records
  teacher_preferences: Record<string, TeacherPreferenceRecord>;
  audit_logs: Array<{ timestamp: string; action: string; details: any }>;
  metadata: {
    version: string;
    initialized_at: string;
    last_write: string;
  };
}

const DEFAULT_SCHEMA: DatabaseSchema = {
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

export class Database {
  private static instance: Database;
  private dbPath: string;
  private memoryData: DatabaseSchema;
  private writeLock: boolean = false;

  private constructor() {
    this.dbPath = CONFIG.DB_PATH;
    this.ensureDirectory();
    this.memoryData = this.load();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private ensureDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(raw);
      }
      const seedPath = path.resolve(process.cwd(), 'storage/database.json');
      if (fs.existsSync(seedPath)) {
        const seedRaw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(seedRaw);
        this.saveImmediate(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('[DB] Lỗi đọc cơ sở dữ liệu hiện hữu, khởi tạo lại schema mới:', err);
    }
    this.saveImmediate(DEFAULT_SCHEMA);
    return DEFAULT_SCHEMA;
  }

  private saveImmediate(data: DatabaseSchema) {
    this.ensureDirectory();
    const tempPath = `${this.dbPath}.tmp`;
    data.metadata.last_write = new Date().toISOString();
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, this.dbPath);
  }

  public commit(): void {
    if (this.writeLock) return;
    this.writeLock = true;
    try {
      this.saveImmediate(this.memoryData);
    } finally {
      this.writeLock = false;
    }
  }

  // Health-check verification
  public ping(): { ok: boolean; path: string; records: number } {
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
    } catch (err) {
      return { ok: false, path: this.dbPath, records: 0 };
    }
  }

  // CRUD for LESSON_STATE
  public getLessonState(lessonId: string): any | null {
    return this.memoryData.lessons[lessonId] || null;
  }

  public getAllLessons(): any[] {
    return Object.values(this.memoryData.lessons);
  }

  public saveLessonState(lessonState: any): void {
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
  public getArtifact(artifactId: string): any | null {
    return this.memoryData.artifacts[artifactId] || null;
  }

  public getArtifactsByLesson(lessonId: string): any[] {
    return Object.values(this.memoryData.artifacts).filter((a: any) => a.lesson_id === lessonId);
  }

  public saveArtifact(artifact: any): void {
    if (!artifact || !artifact.artifact_id) {
      throw new Error('Artifact requires an artifact_id');
    }
    this.memoryData.artifacts[artifact.artifact_id] = {
      ...artifact,
      updated_at: new Date().toISOString()
    };
    this.commit();
  }

  public markArtifactStale(artifactId: string, stale: boolean = true): void {
    if (this.memoryData.artifacts[artifactId]) {
      this.memoryData.artifacts[artifactId].stale = stale;
      this.commit();
    }
  }

  // CRUD for Preferences
  public savePreference(pref: TeacherPreferenceRecord): void {
    this.memoryData.teacher_preferences[pref.preference_id] = pref;
    this.commit();
  }

  public getPreferences(userId: string): TeacherPreferenceRecord[] {
    return Object.values(this.memoryData.teacher_preferences).filter(
      p => p.user_id === userId || p.scope === 'ALL_MY_LESSONS'
    );
  }
}

export const db = Database.getInstance();
