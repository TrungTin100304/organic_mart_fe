/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  // thêm các biến môi trường khác vào đây nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

