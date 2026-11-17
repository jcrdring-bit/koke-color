/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORE_NAME?: string;
  readonly VITE_STORE_CITY?: string;
  readonly VITE_WHATSAPP_LINE_1?: string;
  readonly VITE_WHATSAPP_LINE_2?: string;
  readonly VITE_MERCADOPAGO_ALIAS?: string;
  readonly VITE_MERCADOPAGO_CVU?: string;
  readonly VITE_MERCADOPAGO_QR_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
