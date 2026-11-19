import React, { useState, useEffect } from 'react';
import { X, Droplets, Sun, CheckCircle2, ShoppingCart, MapPin, Check, Sparkles } from 'lucide-react';
import { Plant } from '../../types';

interface CareModalProps {
  plant: Plant | null;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (plant: Plant, color?: string) => void;
}

export const CareModal: React.FC<CareModalProps> = ({
  plant,
  onClose,
  isSelected,
  onToggleSelect,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);

  const hasVariants = Boolean(plant?.colorVariants && plant.colorVariants.length > 0);
  const variants = plant?.colorVariants || [];

  useEffect(() => {
    if (!hasVariants || isPaused || hasManuallySelected) return;

    const interval = setInterval(() => {
      setSelectedColorIndex((prev) => (prev + 1) % variants.length);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [hasVariants, variants.length, isPaused, hasManuallySelected]);

  if (!plant) return null;

  const currentVariant = hasVariants ? variants[selectedColorIndex] : null;
  const currentImageUrl = currentVariant ? currentVariant.imageUrl : plant.imageUrl;
  const currentColorName = currentVariant ? currentVariant.name : undefined;

  const handleColorClick = (idx: number) => {
    setSelectedColorIndex(idx);
    setHasManuallySelected(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden border border-surface-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Modal Header Image */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-stone-100 overflow-hidden">
          <img
            key={currentImageUrl}
            src={currentImageUrl}
            alt={`${plant.name} ${currentColorName ? `- Flor ${currentColorName}` : ''}`}
            className="w-full h-full object-cover transition-all duration-700 animate-in fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges en la foto */}
          <div className="absolute bottom-4 left-6 right-6 text-white flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Guía botánica de cuidados
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                {plant.name}
              </h3>
              <p className="text-xs italic text-stone-200">
                {plant.scientificName}
              </p>
            </div>

            {hasVariants && currentVariant && (
              <span className="bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white"
                  style={{ backgroundColor: currentVariant.hex }}
                />
                <span>Flor {currentVariant.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Selector de colores en el modal para Kalanchoe */}
          {hasVariants && (
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-surface-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Variedad de flor (cambia cada 5 seg):</span>
                <span className="font-bold text-[#164e28]">Flor {currentColorName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, idx) => {
                  const isActive = idx === selectedColorIndex;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleColorClick(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-[#164e28] text-white border-[#164e28] shadow-xs scale-105 ring-2 ring-emerald-300/60'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: v.hex }}
                      />
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-surface-border text-xs text-[#78716C]">
              <MapPin className="w-3.5 h-3.5 text-[#164e28]" />
              <span>Origen: {plant.origin}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-xs text-amber-800">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{plant.light}</span>
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 leading-relaxed">
            {plant.description}
          </p>

          {/* Care Guidelines Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 mt-0.5">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-900 block mb-1">
                  Riego por inmersión
                </span>
                <p className="text-xs text-sky-800 leading-relaxed">
                  {plant.wateringGuide}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-1">
                  Luz y Ubicación
                </span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {plant.lightGuide}
                </p>
              </div>
            </div>
          </div>

          {/* Care Tips Checklist */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#78716C] mb-3">
              Consejos de hidratación del musgo
            </h4>
            <div className="space-y-2.5">
              {plant.careTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1C1917]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-surface-border flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50 transition-colors"
          >
            Cerrar
          </button>

          {plant.inStock ? (
            <button
              onClick={() => {
                onToggleSelect(plant, currentColorName);
              }}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-stone-800 text-white hover:bg-black'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Quitar del carrito</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar {currentColorName ? `(Flor ${currentColorName})` : ''} al carrito</span>
                </>
              )}
            </button>
          ) : (
            <div className="px-5 py-2.5 rounded-full bg-stone-200 text-stone-500 text-xs font-semibold">
              Planta actualmente agotada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
