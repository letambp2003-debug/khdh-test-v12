"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
exports.CONFIG = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    STORAGE_DIR: path_1.default.resolve(process.env.STORAGE_DIR || (isServerless ? '/tmp/uploads' : './storage/uploads')),
    EXPORTS_DIR: path_1.default.resolve(process.env.EXPORTS_DIR || (isServerless ? '/tmp/exports' : './storage/exports')),
    DB_PATH: path_1.default.resolve(process.env.DB_PATH || (isServerless ? '/tmp/database.json' : './storage/database.json')),
    SESSION_SECRET: process.env.SESSION_SECRET || 'khdh_v12_rc2_secure_session_secret_key',
    // App Metadata
    APP_NAME: 'KHDH AUTO V12-RC2 WEBAPP PRO',
    VERSION: '12.2.0-rc2',
    IS_FINAL: false
};
