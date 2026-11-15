import React from 'react';
import { X, Trash2, MessageCircle, CreditCard, ShoppingCart, ShieldCheck } from 'lucide-react';
import { CartItem, StoreSettings } from '../../types';
import { whatsappService } from '../../services/whatsapp';

interface ConsultationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onRemoveItem: (plantId: string) => void;
  onOpenMercadoPago: () => void;
  settings: StoreSettings;
}

export const ConsultationDrawer: React.FC<ConsultationDrawerProps> = ({
  isOpen,
  onClose,
  items,
  total,
  onRemoveItem,
  onOpenMercadoPago,
  settings,
}) => {
  if (!isOpen) return null;

  const whatsappLink = whatsappService.createCartInquiryLink(
    settings.whatsappLine2,
    items,
    total,
    settings.city
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-surface-border">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-surface-border flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#164e28] text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  Tu selección de kokedamas
                </h3>
                <p className="text-xs text-[#78716C]">
                  {items.length} {items.length === 1 ? 'modelo seleccionado' : 'modelos seleccionados'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200 text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-surface-border/60">
            {items.length === 0 ? (
              <div className="text-center py-16 text-[#78716C]">
                <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-stone-300 mb-3" />
                <p className="text-sm font-medium">Aún no agregaste kokedamas a tu carrito.</p>
                <p className="text-xs text-stone-400 mt-1">Explora el catálogo y selecciona tus favoritas.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.plant.id} className="py-3.5 flex items-center gap-3.5 group">
                  <img
                    src={item.plant.imageUrl}
                    alt={item.plant.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-surface-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-[#1C1917] truncate">
                      {item.plant.name}
                    </h4>
                    <p className="text-xs text-[#78716C] italic truncate">
                      {item.plant.scientificName}
                    </p>
                    <span className="font-sans text-xs font-semibold text-[#164e28] mt-1 block">
                      $ {item.plant.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.plant.id)}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Quitar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-surface-border bg-[#FAF8F5] space-y-4">
              
              {/* Total Calculation */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#78716C]">
                  Total estimado:
                </span>
                <span className="font-serif text-3xl font-bold text-[#1C1917]">
                  $ {total.toLocaleString('es-AR')}
                </span>
              </div>

              {/* Botón Mercado Pago */}
              <button
                onClick={onOpenMercadoPago}
                className="w-full py-3 px-4 rounded-full bg-[#009EE3] hover:bg-[#0089C7] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar con Mercado Pago (Alias)</span>
              </button>

              {/* WhatsApp Inquiry Options */}
              <div className="pt-2 border-t border-surface-border/60 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold text-center">
                  O coordinar entrega por WhatsApp
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Enviar consulta por WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#78716C] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atención directa y personalizada en {settings.city}</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
