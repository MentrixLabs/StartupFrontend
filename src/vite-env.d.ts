/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // добавьте другие переменные, если есть
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}