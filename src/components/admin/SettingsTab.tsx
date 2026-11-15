import React, { useState } from 'react';
import { StoreSettings } from '../../types';
import { dbService } from '../../services/db';
import { Save, Check, Key, Database, Lock } from 'lucide-react';

interface SettingsTabProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [adminPin, setAdminPin] = useState(() => dbService.getAdminPin());
  const [showPin, setShowPin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveSettings(formData);
    await dbService.setAdminPin(adminPin);
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
        </div>
      </div>

      {/* PIN de Seguridad del Administrador */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#164e28]" />
          <h4 className="font-bold text-[#1C1917] text-sm">
            PIN o Clave de Acceso de Administrador
          </h4>
        </div>

        <div>
          <label className="block text-[#78716C] mb-1 font-medium">
            Clave actual de acceso:
          </label>
          <div className="flex gap-2 max-w-sm">
            <input
              type={showPin ? 'text' : 'password'}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-surface-border font-mono font-bold text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="px-3 py-1.5 rounded-xl border border-surface-border bg-white text-stone-600 hover:bg-stone-50"
            >
              {showPin ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <p className="text-[11px] text-[#78716C] mt-1">
            También puedes definirla en tu archivo <code>.env.local</code> como <code>VITE_ADMIN_PIN=tu_pin</code>.
          </p>
        </div>
      </div>

      {/* DeepSeek API Key */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-surface-border space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#164e28]" />
          <h4 className="font-bold text-[#1C1917] text-sm">
            Inteligencia Artificial (DeepSeek API Key)
          </h4>
        </div>

        <div>
          <label className="block text-[#78716C] mb-1 font-medium">
            Clave de API de DeepSeek (sk-...):
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
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
            También puedes configurarla en tu archivo <code>.env.local</code> con <code>VITE_DEEPSEEK_API_KEY=...</code>.
            Si no colocas ninguna, KokeBot continuará funcionando de todas formas con su motor inteligente local.
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
