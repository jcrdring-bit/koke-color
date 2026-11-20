// Catálogo canónico y oficial del servidor para Koke Color
// Previene manipulación de precios (Price Tampering) en transacciones y pasarelas de pago

export interface OfficialProduct {
  id: string;
  name: string;
  price: number;
}

export const OFFICIAL_CATALOG: Record<string, OfficialProduct> = {
  'ciclamen-colgante': { id: 'ciclamen-colgante', name: 'Ciclamen Colgante', price: 28000 },
  'gerbera-fucsia': { id: 'gerbera-fucsia', name: 'Gerbera Fucsia', price: 30000 },
  'anturio-rojo': { id: 'anturio-rojo', name: 'Anturio Rojo', price: 45000 },
  'suculenta-jade': { id: 'suculenta-jade', name: 'Suculenta Jade', price: 15000 },
  'kalanchoe': { id: 'kalanchoe', name: 'Kalanchoe', price: 25000 },
  'begonia': { id: 'begonia', name: 'Begonia', price: 20000 },
  'aeonium': { id: 'aeonium', name: 'Aeonium', price: 20000 },
  'mini-romero': { id: 'mini-romero', name: 'Mini Romero', price: 15000 },
  'mini-oregano': { id: 'mini-oregano', name: 'Mini Orégano', price: 15000 },
  'echeveria': { id: 'echeveria', name: 'Echeveria', price: 15000 },
  'haworthia': { id: 'haworthia', name: 'Haworthia', price: 15000 },
  'sedum-burro': { id: 'sedum-burro', name: 'Sedum Cola de Burro', price: 18000 },
  'lazo-de-amor': { id: 'lazo-de-amor', name: 'Lazo de Amor', price: 20000 },
  'zinnia': { id: 'zinnia', name: 'Zinnia', price: 15000 },
  'souvenir-4-suculentas': { id: 'souvenir-4-suculentas', name: 'Pack Souvenir 4 Suculentas', price: 20000 },
  'espada-de-san-jorge': { id: 'espada-de-san-jorge', name: 'Espada de San Jorge', price: 22000 }
};

export interface ValidatedItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  selectedColor?: string;
}

/**
 * Normaliza y extrae el identificador base del producto, incluso si viene con sufijos de color
 */
export function extractBaseProductId(rawId: string): string {
  if (!rawId) return '';
  const clean = rawId.toLowerCase().trim();
  // Si el id viene como 'kalanchoe_Amarillo', extraer 'kalanchoe'
  const parts = clean.split('_');
  return parts[0];
}

/**
 * Valida una lista de items enviados por el cliente contrastándolos contra el catálogo del servidor.
 * Retorna los items con los PRECIOS REALES DEL SERVIDOR.
 * Lanza un error si algún producto no existe o la cantidad es inválida.
 */
export function validateAndPriceItems(rawItems: any[]): { items: ValidatedItem[]; totalAmount: number } {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('La lista de productos es requerida y no puede estar vacía.');
  }

  let totalAmount = 0;
  const validatedItems: ValidatedItem[] = [];

  for (const raw of rawItems) {
    const candidateId = raw.plant?.id || raw.id;
    if (!candidateId || typeof candidateId !== 'string') {
      throw new Error('Identificador de producto inválido o ausente.');
    }

    const baseId = extractBaseProductId(candidateId);
    const officialProduct = OFFICIAL_CATALOG[baseId];

    if (!officialProduct) {
      throw new Error(`El producto con ID "${candidateId}" no existe en el catálogo oficial.`);
    }

    const quantity = parseInt(raw.quantity, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > 50) {
      throw new Error(`Cantidad inválida para el producto "${officialProduct.name}". Debe ser entre 1 y 50.`);
    }

    const selectedColor = typeof raw.selectedColor === 'string' && raw.selectedColor.trim() 
      ? raw.selectedColor.trim().slice(0, 30) 
      : undefined;

    const colorText = selectedColor ? ` (Flor ${selectedColor})` : '';

    const validated: ValidatedItem = {
      id: officialProduct.id,
      title: `${officialProduct.name}${colorText}`,
      quantity,
      unit_price: officialProduct.price,
      selectedColor
    };

    validatedItems.push(validated);
    totalAmount += officialProduct.price * quantity;
  }

  return { items: validatedItems, totalAmount };
}
