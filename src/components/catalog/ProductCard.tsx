import React, { useState, useEffect } from 'react';
import { Sun, MapPin, ShoppingCart, Check, Eye, Sparkles } from 'lucide-react';
import { Plant } from '../../types';

interface ProductCardProps {
  plant: Plant;
  isSelected: boolean;
  onToggleSelect: (plant: Plant, color?: string) => void;
  onOpenCare: (plant: Plant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  plant,
  isSelected,
  onToggleSelect,
  onOpenCare,
}) => {
  const hasVariants = Boolean(plant.colorVariants && plant.colorVariants.length > 0);
  const variants = plant.colorVariants || [];

  // Índice del color actual (rotación automática cada 5 segundos si no se eligió manualmente)
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);

  useEffect(() => {
    if (!hasVariants || isPaused || hasManuallySelected) return;

    const interval = setInterval(() => {
      setActiveColorIndex((prev) => (prev + 1) % variants.length);
    }, 5000); // Rota exactamente cada 5 segundos

    return () => clearInterval(interval);
  }, [hasVariants, variants.length, isPaused, hasManuallySelected]);

  const activeVariant = hasVariants ? variants[activeColorIndex] : null;
  const currentImageUrl = activeVariant ? activeVariant.imageUrl : plant.imageUrl;
  const currentColorName = activeVariant ? activeVariant.name : undefined;

  const handleColorClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveColorIndex(idx);
    setHasManuallySelected(true); // Bloquear en el color elegido por el usuario para comprar
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(plant, currentColorName);
  };

  return (
    <article
      className="group bg-white rounded-3xl border border-surface-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Image Container */}
      <div
        className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onOpenCare(plant)}
      >
        <img
          key={currentImageUrl}
          src={currentImageUrl}
          alt={`${plant.name} ${currentColorName ? `- Flor ${currentColorName}` : ''}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out animate-in fade-in"
          loading="lazy"
        />

        {/* Top-Right Badge: Koke Color · J.C. Paz */}
        <div className="absolute top-3 right-3 bg-[#164e28]/90 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-xs">
          Koke Color · J.C. Paz
        </div>

        {/* Indicador de color en la foto si tiene variantes */}
        {hasVariants && activeVariant && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 animate-in fade-in">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-xs"
              style={{ backgroundColor: activeVariant.hex }}
            />
            <span>Flor {activeVariant.name}</span>
          </div>
        )}

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
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

        {/* Selector interactivo de colores directo sobre la foto */}
        {hasVariants && (
          <div 
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full shadow-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {variants.map((v, idx) => {
              const isActive = idx === activeColorIndex;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={(e) => handleColorClick(idx, e)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border border-black/30 ${
                    isActive
                      ? 'scale-125 ring-2 ring-white shadow-sm z-10'
                      : 'opacity-75 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: v.hex }}
                  title={`Seleccionar flor ${v.name}`}
                >
                  {isActive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        v.name === 'Blanco' || v.name === 'Amarillo' ? 'bg-stone-900' : 'bg-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
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

          {/* Selector interactivo de colores de flor */}
          {hasVariants && (
            <div className="mb-3.5 p-2.5 bg-[#FAF8F5] rounded-2xl border border-surface-border">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-2 px-0.5">
                <span className="flex items-center gap-1.5 text-stone-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Color de flor:</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#164e28] border border-emerald-200 shadow-2xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: activeVariant?.hex }}
                  />
                  <span>{currentColorName}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {variants.map((v, idx) => {
                  const isActive = idx === activeColorIndex;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={(e) => handleColorClick(idx, e)}
                      className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-[#164e28] text-white border-[#164e28] shadow-xs scale-105 ring-2 ring-emerald-300/60'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/90 hover:border-stone-400'
                      }`}
                      title={`Seleccionar flor ${v.name}`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: v.hex }}
                      />
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              onClick={handleActionClick}
              className={`p-3 rounded-full transition-all duration-200 shadow-xs flex items-center justify-center ${
                isSelected
                  ? 'bg-stone-800 text-white hover:bg-black scale-105'
                  : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
              }`}
              title={
                hasVariants
                  ? `Agregar Kalanchoe (Flor ${currentColorName}) al carrito`
                  : isSelected
                  ? 'Quitar de mi selección'
                  : 'Agregar a mi selección'
              }
            >
              {isSelected ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          ) : (
            <span className="text-xs text-[#78716C] italic">Sin stock</span>
          )}
        </div>
      </div>
    </article>
  );
};
