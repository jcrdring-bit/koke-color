import { useState } from 'react';
import { Plant, CartItem } from '../types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isSelected = (plantId: string, color?: string) => {
    return items.some(i => i.plant.id === plantId && (color ? i.selectedColor === color : true));
  };

  const toggleItem = (plant: Plant, color?: string) => {
    if (isSelected(plant.id, color)) {
      removeItem(plant.id, color);
    } else {
      addItem(plant, color);
    }
  };

  const addItem = (plant: Plant, color?: string) => {
    const finalColor = color || (plant.colorVariants && plant.colorVariants.length > 0 ? plant.colorVariants[0].name : undefined);

    setItems(prev => {
      const existing = prev.find(i => i.plant.id === plant.id && i.selectedColor === finalColor);
      if (existing) {
        return prev.map(i =>
          (i.plant.id === plant.id && i.selectedColor === finalColor)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { plant, quantity: 1, selectedColor: finalColor }];
    });
  };

  const removeItem = (plantId: string, color?: string) => {
    setItems(prev => prev.filter(i => !(i.plant.id === plantId && (color ? i.selectedColor === color : true))));
  };

  const clearCart = () => {
    setItems([]);
  };

  return {
    items,
    total,
    totalCount,
    isSelected,
    toggleItem,
    addItem,
    removeItem,
    clearCart,
    isDrawerOpen,
    setIsDrawerOpen,
    isMercadoPagoModalOpen,
    setIsMercadoPagoModalOpen,
  };
}
