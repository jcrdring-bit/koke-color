import React, { useState } from 'react';
import { StoreSettings } from '../../types';
import { dbService } from '../../services/db';
import { Save, Check, Key, Database, Lock, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';

interface SettingsTabProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [showMpToken, setShowMpToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveSettings(formData);
    onUpdateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      
      {/* Datos del Comercio */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <h4 className="font-bold text-[#1C1917] text-sm">
          Información del Comercio y WhatsApp
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#78716C] mb-1 font-medium">Nombre de la tienda:</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-medium"
            />
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">Ubicación / Ciudad:</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-medium"
            />
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">WhatsApp de Consultas (Principal):</label>
            <input
              type="text"
              value={formData.whatsappLine2}
              onChange={(e) => setFormData({ ...formData, whatsappLine2: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">WhatsApp (Línea 1 - Inactiva):</label>
            <input
              type="text"
              value={formData.whatsappLine1}
              onChange={(e) => setFormData({ ...formData, whatsappLine1: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono font-medium opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Mercado Pago */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <h4 className="font-bold text-[#1C1917] text-sm">
          Mercado Pago (Cobros, Alias, CVU y Código QR)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#78716C] mb-1 font-medium">
              Alias de transferencia:
            </label>
            <input
              type="text"
              value={formData.mercadopagoAlias}
              onChange={(e) => setFormData({ ...formData, mercadopagoAlias: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono font-bold text-sky-900"
            />
            <p className="text-[11px] text-[#78716C] mt-1">
              Ej: gringo.peque.mp
            </p>
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">
              CVU (22 dígitos):
            </label>
            <input
              type="text"
              value={formData.mercadopagoCvu || ''}
              onChange={(e) => setFormData({ ...formData, mercadopagoCvu: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono font-bold text-stone-800 text-xs"
            />
            <p className="text-[11px] text-[#78716C] mt-1">
              Para transferencias directas por CVU
            </p>
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">
              URL de imagen QR propia (Opcional):
            </label>
            <input
              type="text"
              placeholder="https://... o dejar vacío para QR automático"
              value={formData.mercadopagoQrUrl || ''}
              onChange={(e) => setFormData({ ...formData, mercadopagoQrUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border text-xs"
            />
            <p className="text-[11px] text-[#78716C] mt-1">
              Si lo dejas vacío, genera el QR dinámico
            </p>
          </div>

          {/* Access Token de Mercado Pago (Privado) */}
          <div className="sm:col-span-3 bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sky-950 font-bold">
                Access Token de Mercado Pago (Privado - para Checkout Pro y Tarjetas):
              </label>
              <button
                type="button"
                onClick={() => setShowMpToken(!showMpToken)}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold underline"
              >
                {showMpToken ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showMpToken ? 'text' : 'password'}
              placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx-xxxxxx-..."
              value={formData.mercadopagoAccessToken || ''}
              onChange={(e) => setFormData({ ...formData, mercadopagoAccessToken: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 font-mono text-xs text-sky-950 font-semibold"
            />
            <p className="text-[11px] text-sky-800 leading-relaxed">
              ⭐ <strong>¡Sin complicaciones técnicas!</strong> Pega aquí tu Access Token de producción de Mercado Pago. Activa de inmediato el cobro con todas las tarjetas de crédito (en cuotas) y débito sin tener que entrar a Netlify. (O también puedes definirlo en Netlify como <code>MP_ACCESS_TOKEN</code>).
            </p>
          </div>

          {/* Link de Pago directo de Mercado Pago (Opcional) */}
          <div className="sm:col-span-3">
            <label className="block text-[#78716C] mb-1 font-medium">
              Link de Pago directo de Mercado Pago (Opcional - link.mercadopago.com.ar / mpago.la):
            </label>
            <input
              type="text"
              placeholder="https://mpago.la/... o https://link.mercadopago.com.ar/..."
              value={formData.mercadopagoPaymentLink || ''}
              onChange={(e) => setFormData({ ...formData, mercadopagoPaymentLink: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border text-xs text-stone-800"
            />
            <p className="text-[11px] text-[#78716C] mt-1">
              Si tienes un link de pago directo creado en tu app de Mercado Pago, tus clientes podrán usarlo directamente con 1 solo clic.
            </p>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[#78716C] mb-1 font-medium">
              Public Key de Mercado Pago (para formulario embebido de tarjeta):
            </label>
            <input
              type="text"
              placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx o APP_USR-..."
              value={formData.mercadopagoPublicKey || ''}
              onChange={(e) => setFormData({ ...formData, mercadopagoPublicKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono text-xs text-sky-950 font-semibold"
            />
            <p className="text-[11px] text-[#78716C] mt-1">
              Clave pública opcional para formulario de tarjeta sin salir de la tienda.
            </p>
          </div>
        </div>
      </div>

      {/* Seguridad Zero-Storage del Administrador */}
      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#164e28]" />
          <h4 className="font-bold text-emerald-950 text-sm">
            Seguridad de Acceso del Administrador (Zero-Storage)
          </h4>
        </div>
        <p className="text-[11px] text-emerald-900 leading-relaxed">
          🔒 <strong>Máxima protección:</strong> La clave de acceso de administrador se valida exclusivamente en el backend seguro de Netlify mediante la variable de entorno <code>ADMIN_PIN</code>.
        </p>
        <p className="text-[11px] text-stone-600 leading-relaxed">
          Por privacidad y seguridad total, la clave <strong>nunca se almacena en el navegador, cookies ni base de datos pública</strong>, cumpliendo con la política de clave cero-almacenamiento.
        </p>
      </div>

      {/* Antigravity / Gemini AI Key */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#164e28]" />
          <h4 className="font-bold text-[#1C1917] text-sm">
            Inteligencia Artificial del Chatbot (Antigravity / Gemini)
          </h4>
        </div>

        <div>
          <label className="block text-[#78716C] mb-1 font-medium">
            Clave de API de Antigravity / Gemini (AI Studio):
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={formData.deepseekApiKey}
              onChange={(e) => setFormData({ ...formData, deepseekApiKey: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-surface-border font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-1.5 rounded-xl border border-surface-border bg-white text-stone-600 hover:bg-stone-50"
            >
              {showKey ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <p className="text-[11px] text-[#78716C] mt-1.5 leading-relaxed">
            Se procesa de forma protegida en el backend de Netlify (<code>GEMINI_API_KEY</code>).
            Si no colocas ninguna, KokeBot responderá con su motor botánico inteligente local de contingencia.
          </p>
        </div>
      </div>

      {/* Conexión a Base de Datos en la Nube (Supabase) */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-[#1C1917] text-sm">
              Base de Datos en la Nube (Supabase)
            </h4>
          </div>
          {formData.supabaseUrl && formData.supabaseAnonKey ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              🟢 Supabase Conectado
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              🟡 Modo Local (Sin nube)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#78716C] mb-1 font-medium">
              Supabase Project URL:
            </label>
            <input
              type="text"
              placeholder="https://tu-proyecto.supabase.co"
              value={formData.supabaseUrl || ''}
              onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[#78716C] mb-1 font-medium">
              Supabase Anon Public Key:
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={formData.supabaseAnonKey || ''}
              onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border font-mono text-xs"
            />
          </div>
        </div>

        <p className="text-[11px] text-[#78716C] leading-relaxed">
          Pega aquí las credenciales de tu proyecto de Supabase (Project Settings ➔ API). Al guardarlas, el catálogo, los clientes y las consultas se sincronizarán directamente en la nube.
        </p>
      </div>

      {/* Botón Guardar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" />
            ¡Ajustes guardados correctamente!
          </span>
        )}

        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

    </form>
  );
};
