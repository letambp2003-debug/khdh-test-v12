import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';

export class FileStorageManager {
  private static instance: FileStorageManager;
  private uploadDir: string;
  private exportsDir: string;

  private constructor() {
    this.uploadDir = CONFIG.STORAGE_DIR;
    this.exportsDir = CONFIG.EXPORTS_DIR;
    this.ensureDirs();
  }

  public static getInstance(): FileStorageManager {
    if (!FileStorageManager.instance) {
      FileStorageManager.instance = new FileStorageManager();
    }
    return FileStorageManager.instance;
  }

  private ensureDirs() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  public ping(): { ok: boolean; uploadDir: string; writable: boolean } {
    try {
      this.ensureDirs();
      const testFile = path.join(this.uploadDir, `.health_check_${Date.now()}.tmp`);
      fs.writeFileSync(testFile, 'KHDH_STORAGE_OK', 'utf8');
      fs.unlinkSync(testFile);
      return { ok: true, uploadDir: this.uploadDir, writable: true };
    } catch (err) {
      return { ok: false, uploadDir: this.uploadDir, writable: false };
    }
  }

  public saveUpload(filename: string, buffer: Buffer): { filepath: string; size: number } {
    this.ensureDirs();
    const safeFilename = `${Date.now()}_${path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.join(this.uploadDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);
    return { filepath: targetPath, size: buffer.length };
  }

  public saveExport(filename: string, content: string | Buffer): string {
    this.ensureDirs();
    const targetPath = path.join(this.exportsDir, filename);
    fs.writeFileSync(targetPath, content);
    return targetPath;
  }

  public getFilePath(relativePath: string): string | null {
    const fullPath = path.resolve(relativePath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
  }
}

export const storage = FileStorageManager.getInstance();
