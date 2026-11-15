import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Package, Users, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Plant, StoreSettings } from '../../types';
import { LoginResult } from '../../services/security';
import { InventoryTab } from './InventoryTab';
import { CrmTab } from './CrmTab';
import { SettingsTab } from './SettingsTab';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (pin: string) => Promise<LoginResult> | LoginResult;
  onLogout: () => void;
  plants: Plant[];
  onRefreshPlants: () => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  plants,
  onRefreshPlants,
  settings,
  onUpdateSettings,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'crm' | 'settings'>('inventory');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = await onLogin(pinInput);
    setIsSubmitting(false);

    if (!result.success) {
      setLoginError(result.message || 'Clave o PIN incorrecto');
      setTimeout(() => setLoginError(null), 3500);
    } else {
      setPinInput('');
      setLoginError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-surface-border flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164e28] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Panel de Control · Koke Color
              </h3>
              <p className="text-xs text-[#78716C]">
                {isAdmin ? 'Sesión activa (se cerrará automáticamente al salir)' : 'Acceso seguro a administración'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onLogout}
                className="p-2 text-stone-500 hover:text-red-600 rounded-full hover:bg-stone-200/50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-[#1C1917] rounded-full hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isAdmin ? (
            /* Login Form */
            <div className="max-w-xs mx-auto py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-600">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#1C1917]">Ingresar al Panel</h4>
                <p className="text-xs text-[#78716C] mt-1">
                  Ingresa tu clave de administración protegida.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <input
                  type="password"
                  placeholder="Clave o PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`w-full px-4 py-2 text-sm rounded-full border text-center font-mono ${
                    loginError ? 'border-red-500 ring-2 ring-red-100' : 'border-surface-border'
                  }`}
                  autoFocus
                  disabled={isSubmitting}
                />
                {loginError && (
                  <p className="text-xs text-red-600 font-medium text-center">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Verificando...' : 'Entrar'}
                </button>
              </form>
            </div>
          ) : (
            /* Admin Dashboard with Tabs */
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-surface-border pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-[#164e28] text-white'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Inventario y Precios</span>
                </button>

                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'crm'
                      ? 'bg-[#164e28] text-white'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>CRM y Mensajes ({plants.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#164e28] text-white'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Ajustes y Mercado Pago</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'inventory' && (
                <InventoryTab plants={plants} onRefresh={onRefreshPlants} />
              )}
              {activeTab === 'crm' && (
                <CrmTab />
              )}
              {activeTab === 'settings' && (
                <SettingsTab settings={settings} onUpdateSettings={onUpdateSettings} />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
