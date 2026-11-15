import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface FloatingCartBarProps {
  totalCount: number;
  totalAmount: number;
  onOpen: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalAmount,
  onOpen,
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-6 duration-300">
      <button
        onClick={onOpen}
        className="bg-[#164e28] hover:bg-[#123f21] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ring-4 ring-black/5"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-emerald-300" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {totalCount}
          </span>
        </div>

        <span className="font-semibold tracking-wide">
          Ver mi carrito
        </span>

        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
          $ {totalAmount.toLocaleString('es-AR')}
        </span>

        <ArrowRight className="w-4 h-4 text-emerald-200" />
      </button>
    </div>
  );
};
