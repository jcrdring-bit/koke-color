import React from 'react';
import { Leaf, MessageCircle, MapPin, Heart } from 'lucide-react';
import { StoreSettings } from '../../types';
import { whatsappService } from '../../services/whatsapp';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  const whatsappLink = whatsappService.createGeneralLink(settings.whatsappLine2, settings.city);

  return (
    <footer className="mt-20 border-t border-surface-border bg-white text-xs text-[#78716C] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-surface-border/60">
          
          {/* Columna 1: Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#164e28] text-white flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-serif text-xl font-bold text-[#1C1917]">
                Koke Color
              </span>
            </div>
            <p className="font-sans text-xs tracking-wider uppercase font-semibold text-[#164e28]">
              Naturaleza que flota
            </p>
            <p className="text-xs leading-relaxed max-w-sm">
              Kokedamas artesanales vivas modeladas a mano con musgo natural y técnica tradicional japonesa.
            </p>
          </div>

          {/* Columna 2: Ubicación & Contacto */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px]">
              Punto de Encuentro y Ventas
            </h4>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{settings.city}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Coordinamos entregas directas y retiros en punto de entrega pactado.
            </p>
          </div>

          {/* Columna 3: WhatsApp Directo */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px]">
              WhatsApp Oficial
            </h4>
            <div className="flex flex-col gap-1.5">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-medium hover:underline"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp ({settings.whatsappLine2})</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Admin trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Koke Color · Hecho con</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>en José C. Paz, Argentina.</span>
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:underline text-stone-500 hover:text-[#1C1917]"
            >
              Acceso Administrador (PIN)
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
