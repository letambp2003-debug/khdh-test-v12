"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const config_1 = require("../config");
class GeminiService {
    static keyPool = config_1.CONFIG.GEMINI_API_KEY ? [config_1.CONFIG.GEMINI_API_KEY] : [];
    static currentIndex = 0;
    static status = config_1.CONFIG.GEMINI_API_KEY ? 'VALID' : 'NOT_CONFIGURED';
    static maskKey(key) {
        if (!key)
            return 'NONE';
        if (key.length <= 10)
            return `${key.substring(0, 3)}...`;
        return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
    }
    static setApiKeys(input) {
        let rawKeys = [];
        if (Array.isArray(input)) {
            rawKeys = input.map(k => String(k).trim()).filter(Boolean);
        }
        else if (typeof input === 'string') {
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
    static setApiKey(key) {
        return this.setApiKeys(key);
    }
    static ping() {
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
    static isReady() {
        return this.status === 'VALID' && this.keyPool.length > 0;
    }
    static getApiKey() {
        if (this.keyPool.length === 0)
            return '';
        const key = this.keyPool[this.currentIndex % this.keyPool.length];
        this.currentIndex++;
        return key;
    }
    static getAllKeys() {
        return [...this.keyPool];
    }
    static getKeyCount() {
        return this.keyPool.length;
    }
}
exports.GeminiService = GeminiService;
