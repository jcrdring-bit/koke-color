/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly VITE_STORE_NAME?: string;
  readonly VITE_STORE_CITY?: string;
  readonly VITE_WHATSAPP_LINE_1?: string;
  readonly VITE_WHATSAPP_LINE_2?: string;
  readonly VITE_MERCADOPAGO_ALIAS?: string;
  readonly VITE_MERCADOPAGO_CVU?: string;
  readonly VITE_ADMIN_PIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
