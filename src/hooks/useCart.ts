import { useState } from 'react';
import { Plant, CartItem } from '../types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.plant.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isSelected = (plantId: string) => {
    return items.some(i => i.plant.id === plantId);
  };

  const toggleItem = (plant: Plant) => {
    if (isSelected(plant.id)) {
      removeItem(plant.id);
    } else {
      addItem(plant);
    }
  };

  const addItem = (plant: Plant) => {
    setItems(prev => {
      const existing = prev.find(i => i.plant.id === plant.id);
      if (existing) {
        return prev.map(i => i.plant.id === plant.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { plant, quantity: 1 }];
    });
  };

  const removeItem = (plantId: string) => {
    setItems(prev => prev.filter(i => i.plant.id !== plantId));
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
