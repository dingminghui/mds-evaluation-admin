/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** EMAS HTTP Endpoint，开发时也用于代理 target */
  readonly VITE_EMAS_HTTP_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
