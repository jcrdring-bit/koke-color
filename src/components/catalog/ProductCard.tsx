import React from 'react';
import { Sun, MapPin, ShoppingCart, Check, Eye } from 'lucide-react';
import { Plant } from '../../types';

interface ProductCardProps {
  plant: Plant;
  isSelected: boolean;
  onToggleSelect: (plant: Plant) => void;
  onOpenCare: (plant: Plant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  plant,
  isSelected,
  onToggleSelect,
  onOpenCare,
}) => {
  return (
    <article className="group bg-white rounded-3xl border border-surface-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onOpenCare(plant)}>
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top-Right Badge: Koke Color · J.C. Paz */}
        <div className="absolute top-3 right-3 bg-[#164e28]/90 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-xs">
          Koke Color · J.C. Paz
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {plant.inStock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCare(plant);
              }}
              className="bg-white/95 hover:bg-white text-[#1C1917] text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#164e28]" />
              <span>Ver cuidados</span>
            </button>
          ) : (
            <div className="bg-white/95 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              ¡Agotado!
            </div>
          )}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Botanical Name */}
          <div className="mb-2">
            <h3 
              onClick={() => onOpenCare(plant)}
              className="font-serif text-xl font-bold text-[#1C1917] hover:text-[#164e28] transition-colors cursor-pointer leading-tight"
            >
              {plant.name}
            </h3>
            <p className="font-sans text-xs italic text-[#78716C] mt-0.5">
              {plant.scientificName}
            </p>
          </div>

          {/* Meta Tags: Origin & Light */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#78716C] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-surface-border/50">
              <MapPin className="w-3 h-3 text-[#164e28]" />
              <span>{plant.origin}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <Sun className="w-3 h-3 text-amber-600" />
              <span>{plant.light}</span>
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
              Precio unitario
            </span>
            <span className="font-serif text-2xl font-bold text-[#1C1917]">
              $ {plant.price.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Action Button */}
          {plant.inStock ? (
            <button
              onClick={() => onToggleSelect(plant)}
              className={`p-3 rounded-full transition-all duration-200 shadow-xs flex items-center justify-center ${
                isSelected
                  ? 'bg-red-600 text-white hover:bg-red-700 scale-105 ring-2 ring-red-400/40'
                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 shadow-xs'
              }`}
              title={isSelected ? 'Quitar del carrito' : 'Agregar al carrito'}
              aria-label={isSelected ? 'Quitar del carrito' : 'Agregar al carrito'}
            >
              {isSelected ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              disabled
              className="p-3 rounded-full bg-stone-100 text-stone-400 cursor-not-allowed"
              title="Agotado temporalmente"
            >
              <ShoppingCart className="w-5 h-5 opacity-40" />
            </button>
          )}
        </div>

      </div>

    </article>
  );
};
