import { Plant } from '../types';

export const whatsappService = {
  createGeneralLink(phone: string, storeCity = 'José C. Paz'): string {
    const text = encodeURIComponent(
      `¡Hola Koke Color! Quiero consultar por las kokedamas disponibles en ${storeCity}.`
    );
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`;
  },

  createCartInquiryLink(
    phone: string,
    items: { plant: Plant; quantity: number }[],
    total: number,
    storeCity = 'José C. Paz'
  ): string {
    const lines = items.map(
      item => `• ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.plant.name} ($ ${item.plant.price.toLocaleString('es-AR')})`
    );

    const message = [
      `¡Hola Koke Color! Quiero consultar por la siguiente selección de kokedamas:`,
      ``,
      ...lines,
      ``,
      `*Total estimado: $ ${total.toLocaleString('es-AR')}*`,
      ``,
      `¿Tienen disponibilidad para coordinar entrega o retiro en ${storeCity}?`
    ].join('\n');

    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  },

  createPlantInquiryLink(phone: string, plant: Plant, storeCity = 'José C. Paz'): string {
    const message = [
      `¡Hola Koke Color! Me interesa la kokedama *${plant.name}* ($ ${plant.price.toLocaleString('es-AR')}).`,
      `¿Tienen stock disponible en ${storeCity}?`
    ].join('\n');

    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  },

  createPaymentProofLink(
    phone: string,
    alias: string,
    total: number,
    items: { plant: Plant; quantity: number }[]
  ): string {
    const plantsList = items.map(i => i.plant.name).join(', ');
    const message = [
      `¡Hola Koke Color! Ya realicé la transferencia por Mercado Pago.`,
      `*Monto:* $ ${total.toLocaleString('es-AR')}`,
      `*Alias utilizado:* ${alias}`,
      `*Kokedamas:* ${plantsList}`,
      ``,
      `Adjunto aquí el comprobante para coordinar la entrega. ¡Muchas gracias!`
    ].join('\n');

    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }
};
