/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="chrome" />

interface ImportMetaEnv {
  /**
   * cause `ky` limit, this URL includes `/` suffix.
   */
  readonly VITE_APP_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
