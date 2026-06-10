/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_ENABLE_SEPAY_MOCK?: string;
  readonly VITE_ENABLE_ADMIN_MOCKS?: string;
  readonly APP_URL: string;
  // thêm các biến môi trường khác vào đây nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
