/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase 프로젝트 URL (예: https://xxxx.supabase.co). 없으면 좋아요 기능이 비활성화됩니다. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon(public) key. service_role 키는 절대 넣지 않습니다. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
