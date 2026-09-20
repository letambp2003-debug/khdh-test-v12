import { CONFIG } from '../config';

export type ApiKeyStatus = 'NOT_CONFIGURED' | 'VALIDATING' | 'VALID' | 'INVALID' | 'QUOTA_ERROR';

export interface SetApiKeyResult {
  ok: boolean;
  status: ApiKeyStatus;
  validCount: number;
  totalCount: number;
  keys: string[];
  maskedKeys: string[];
  message: string;
}

export class GeminiService {
  private static keyPool: string[] = CONFIG.GEMINI_API_KEY ? [CONFIG.GEMINI_API_KEY] : [];
  private static currentIndex: number = 0;
  private static status: ApiKeyStatus = CONFIG.GEMINI_API_KEY ? 'VALID' : 'NOT_CONFIGURED';

  public static maskKey(key: string): string {
    if (!key) return 'NONE';
    if (key.length <= 10) return `${key.substring(0, 3)}...`;
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  }

  public static setApiKeys(input: string | string[]): SetApiKeyResult {
    let rawKeys: string[] = [];
    if (Array.isArray(input)) {
      rawKeys = input.map(k => String(k).trim()).filter(Boolean);
    } else if (typeof input === 'string') {
      // Split by newlines, commas, semicolons
      rawKeys = input.split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);
    }

    if (rawKeys.length === 0) {
      this.keyPool = [];
      this.currentIndex = 0;
      this.status = 'NOT_CONFIGURED';
      return {
        ok: false,
        status: 'NOT_CONFIGURED',
        validCount: 0,
        totalCount: 0,
        keys: [],
        maskedKeys: [],
        message: 'DISCONNECTED: Google AI API Key chưa được cấu hình'
      };
    }

    const validKeys = rawKeys.filter(k => k.length >= 15);
    const masked = validKeys.map(k => this.maskKey(k));

    if (validKeys.length === 0) {
      this.keyPool = [];
      this.currentIndex = 0;
      this.status = 'INVALID';
      return {
        ok: false,
        status: 'INVALID',
        validCount: 0,
        totalCount: rawKeys.length,
        keys: [],
        maskedKeys: [],
        message: 'DISCONNECTED: Khóa API không đúng định dạng (Quá ngắn hoặc sai cú pháp)'
      };
    }

    this.keyPool = validKeys;
    this.currentIndex = 0;
    this.status = 'VALID';

    return {
      ok: true,
      status: 'VALID',
      validCount: validKeys.length,
      totalCount: rawKeys.length,
      keys: validKeys,
      maskedKeys: masked,
      message: `CONNECTED: Đã nạp thành công ${validKeys.length} Google AI API Key (Hỗ trợ xoay vòng tải Round-Robin)`
    };
  }

  public static setApiKey(key: string): SetApiKeyResult {
    return this.setApiKeys(key);
  }

  public static ping(): {
    ok: boolean;
    status: ApiKeyStatus;
    keyCount: number;
    maskedKey: string;
    maskedKeys: string[];
    message: string;
  } {
    const maskedList = this.keyPool.map(k => this.maskKey(k));
    const firstMasked = maskedList.length > 0 ? maskedList[0] : 'NONE';

    if (this.status === 'VALID' && this.keyPool.length > 0) {
      return {
        ok: true,
        status: 'VALID',
        keyCount: this.keyPool.length,
        maskedKey: firstMasked,
        maskedKeys: maskedList,
        message: this.keyPool.length > 1
          ? `CONNECTED: Đã kết nối ${this.keyPool.length} Google AI API Keys (Round-Robin ready)`
          : `CONNECTED: Google AI API Key đã kết nối`
      };
    }

    return {
      ok: false,
      status: this.status,
      keyCount: 0,
      maskedKey: 'NONE',
      maskedKeys: [],
      message: this.status === 'INVALID'
        ? 'DISCONNECTED: Khóa API không đúng định dạng'
        : 'DISCONNECTED: Google AI API Key chưa được cấu hình'
    };
  }

  public static isReady(): boolean {
    return this.status === 'VALID' && this.keyPool.length > 0;
  }

  public static getApiKey(): string {
    if (this.keyPool.length === 0) return '';
    const key = this.keyPool[this.currentIndex % this.keyPool.length];
    this.currentIndex++;
    return key;
  }

  public static getAllKeys(): string[] {
    return [...this.keyPool];
  }

  public static getKeyCount(): number {
    return this.keyPool.length;
  }
}
