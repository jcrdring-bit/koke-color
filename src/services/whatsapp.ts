import { Plant } from '../types';

export const whatsappService = {
  /**
   * Normaliza el número de teléfono para enlaces de WhatsApp (wa.me)
   * Si el usuario escribe 1176092591 (10 dígitos en Argentina), antepone 549 para que abra WhatsApp correctamente.
   */
  cleanPhone(phone: string): string {
    let digits = (phone || '').replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('11')) {
      digits = `549${digits}`;
    }
    return digits || '5491176092591';
  },

  createGeneralLink(phone: string, storeCity = 'José C. Paz'): string {
    const text = encodeURIComponent(
      `¡Hola Koke Color! Quiero consultar por las kokedamas disponibles en ${storeCity}.`
    );
    return `https://wa.me/${this.cleanPhone(phone)}?text=${text}`;
  },

  /**
   * Enlace específico para cuando el chatbot no sabe responder y deriva la duda exacta a WhatsApp
   */
  createCustomQueryLink(phone: string, query?: string, storeCity = 'José C. Paz'): string {
    const cleanNumber = this.cleanPhone(phone);
    let message = `¡Hola Koke Color! Estaba navegando en su tienda y quisiera consultarles una duda sobre sus kokedamas en ${storeCity}.`;

    if (query && query.trim()) {
      message = `¡Hola Koke Color! Estaba consultando en el chat de la web y quisiera que me asesoren sobre esto:\n\n"${query.trim()}"\n\n¿Podrían ayudarme? ¡Muchas gracias! 🌿`;
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  },

  createCartInquiryLink(
    phone: string,
    items: { plant: Plant; quantity: number; selectedColor?: string }[],
    total: number,
    storeCity = 'José C. Paz'
  ): string {
    const lines = items.map(
      item => `• ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.plant.name}${item.selectedColor ? ` (Flor ${item.selectedColor})` : ''} ($ ${item.plant.price.toLocaleString('es-AR')})`
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

    return `https://wa.me/${this.cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  },

  createPlantInquiryLink(phone: string, plant: Plant, storeCity = 'José C. Paz', color?: string): string {
    const colorText = color ? ` (Flor ${color})` : '';
    const message = [
      `¡Hola Koke Color! Me interesa la kokedama *${plant.name}*${colorText} ($ ${plant.price.toLocaleString('es-AR')}).`,
      `¿Tienen stock disponible en ${storeCity}?`
    ].join('\n');

    return `https://wa.me/${this.cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  },

  createPaymentProofLink(
    phone: string,
    alias: string,
    total: number,
    items: { plant: Plant; quantity: number; selectedColor?: string }[],
    customer?: { name?: string; phone?: string; email?: string }
  ): string {
    const plantsList = items.map(i => `${i.plant.name}${i.selectedColor ? ` (Flor ${i.selectedColor})` : ''}`).join(', ');
    const customerDetails = customer?.name
      ? [
          `*Cliente:* ${customer.name}`,
          customer.phone ? `*Teléfono:* ${customer.phone}` : '',
          customer.email ? `*Email:* ${customer.email}` : ''
        ].filter(Boolean).join('\n')
      : '';

    const message = [
      `¡Hola Koke Color! Ya realicé la transferencia por Mercado Pago.`,
      customerDetails ? `\n${customerDetails}` : '',
      `*Monto:* $ ${total.toLocaleString('es-AR')}`,
      `*Alias utilizado:* ${alias}`,
      `*Kokedamas:* ${plantsList}`,
      ``,
      `Adjunto aquí el comprobante para coordinar la entrega. ¡Muchas gracias!`
    ].filter(Boolean).join('\n');

    return `https://wa.me/${this.cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  },

  createCardPaymentProofLink(
    phone: string,
    paymentId: string | number,
    total: number,
    items: { plant: Plant; quantity: number; selectedColor?: string }[],
    customer?: { name?: string; phone?: string; email?: string }
  ): string {
    const plantsList = items.map(i => `${i.plant.name}${i.selectedColor ? ` (Flor ${i.selectedColor})` : ''}`).join(', ');
    const customerDetails = customer?.name
      ? [
          `*Cliente:* ${customer.name}`,
          customer.phone ? `*Teléfono:* ${customer.phone}` : '',
          customer.email ? `*Email:* ${customer.email}` : ''
        ].filter(Boolean).join('\n')
      : '';

    const message = [
      `¡Hola Koke Color! Acabo de abonar mi pedido con tarjeta por Mercado Pago.`,
      customerDetails ? `\n${customerDetails}` : '',
      `*ID de Operación:* #${paymentId}`,
      `*Monto:* $ ${total.toLocaleString('es-AR')}`,
      `*Kokedamas:* ${plantsList}`,
      ``,
      `Quisiera coordinar el envío o retiro de mi pedido. ¡Muchas gracias!`
    ].filter(Boolean).join('\n');

    return `https://wa.me/${this.cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  }
};
