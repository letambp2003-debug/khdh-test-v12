import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  STORAGE_DIR: path.resolve(process.env.STORAGE_DIR || (isServerless ? '/tmp/uploads' : './storage/uploads')),
  EXPORTS_DIR: path.resolve(process.env.EXPORTS_DIR || (isServerless ? '/tmp/exports' : './storage/exports')),
  DB_PATH: path.resolve(process.env.DB_PATH || (isServerless ? '/tmp/database.json' : './storage/database.json')),
  SESSION_SECRET: process.env.SESSION_SECRET || 'khdh_v12_rc2_secure_session_secret_key',
  
  // App Metadata
  APP_NAME: 'KHDH AUTO V12-RC2 WEBAPP PRO',
  VERSION: '12.2.0-rc2',
  IS_FINAL: false
};
