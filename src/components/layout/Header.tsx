import React from 'react';
import { Leaf, Search, ShieldCheck, Lock } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenAdmin,
  onLogoutAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-surface-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo y Marca */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-full bg-[#164e28] text-white flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-700 leading-none">
                  Koke Color
                </h1>
                <p className="font-sans text-[10px] tracking-widest text-[#78716C] uppercase font-semibold mt-1">
                  Naturaleza que flota
                </p>
              </div>
            </div>

            {/* Botón Admin en móvil */}
            <div className="sm:hidden flex items-center gap-1.5">
              <button
                onClick={onOpenAdmin}
                className={`p-2 rounded-full border text-xs flex items-center gap-1 transition-colors ${
                  isAdmin 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-white border-surface-border text-[#78716C] hover:text-[#1C1917]'
                }`}
                title="Panel de Administración y CRM"
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda central */}
          <div className="w-full sm:max-w-md relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar kokedama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-surface-border text-sm placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#164e28]/20 focus:border-[#164e28] shadow-sm transition-all"
              />
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917] bg-surface-muted px-1.5 py-0.5 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Acceso Admin en desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all shadow-sm ${
                isAdmin 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' 
                  : 'bg-white border-surface-border text-[#78716C] hover:text-[#1C1917] hover:border-gray-400'
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Panel Admin</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogoutAdmin();
                    }}
                    className="ml-1 text-[10px] text-red-600 hover:underline"
                    title="Cerrar sesión"
                  >
                    (Salir)
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Administrador</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
