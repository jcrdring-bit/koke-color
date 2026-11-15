import React from 'react';
import { MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types';
import { whatsappService } from '../../services/whatsapp';

interface HeroSectionProps {
  settings: StoreSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const whatsappLink = whatsappService.createGeneralLink(settings.whatsappLine2, settings.city);

  return (
    <section className="py-10 sm:py-16 text-center max-w-4xl mx-auto px-4">
      
      {/* Eyebrow Tag */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#164e28] text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Catálogo artesanal</span>
      </div>

      {/* Main Heading in Fraunces serif */}
      <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold text-purple-700 tracking-tight mb-2">
        Koke Color
      </h1>
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-lime-600 tracking-tight mb-4">
        Pequeños mundos vivos
      </h2>

      {/* Subtitle */}
      <p className="font-sans text-base sm:text-lg text-[#78716C] max-w-2xl mx-auto leading-relaxed mb-6">
        Elegí una planta, conocé sus cuidados y armá una consulta con tus favoritas.
      </p>

      {/* Location Pill */}
      <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#78716C] bg-white px-4 py-1.5 rounded-full border border-surface-border shadow-xs mb-8">
        <MapPin className="w-4 h-4 text-emerald-700" />
        <span>Punto de venta · <strong>{settings.city}</strong> · Pedidos por WhatsApp</span>
      </div>

      {/* WhatsApp Button */}
      <div className="flex items-center justify-center">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#164e28] text-white text-sm font-medium hover:bg-[#123f21] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4 text-emerald-300" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>

    </section>
  );
};
