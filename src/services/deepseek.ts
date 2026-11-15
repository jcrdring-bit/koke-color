import { Plant, StoreSettings } from '../types';
import { securityService } from './security';

interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const deepseekService = {
  buildSystemPrompt(plants: Plant[], settings: StoreSettings): string {
    const catalogSummary = plants.map(p => 
      `- ${p.name} (${p.scientificName}): $${p.price.toLocaleString('es-AR')}. Stock: ${p.inStock ? 'DISPONIBLE' : 'AGOTADO'}. Luz: ${p.light}. Riego: ${p.wateringGuide}`
    ).join('\n');

    return `Eres "KokeBot", el asistente botánico virtual experto y cordial de "Koke Color" (Naturaleza que flota), ubicado en ${settings.city}.
Tu objetivo es asesorar a los clientes sobre kokedamas artesanales, sus cuidados (riego por inmersión, luminosidad, temperatura), precios y disponibilidad de stock.

REGLAS DE ATENCIÓN:
1. Tono: Cálido, botánico, apasionado por la naturaleza viva y muy respetuoso.
2. Si el cliente pregunta por una planta específica, responde con su precio en $ ARS y su estado de stock real según el catálogo.
3. Si la planta está AGOTADA, infórmalo amablemente y sugiérele una alternativa similar que sí esté disponible.
4. Siempre que el cliente pregunte cómo comprar, coordinar entregas, pagar con Mercado Pago (Alias: ${settings.mercadopagoAlias}, CVU: ${settings.mercadopagoCvu || '0000003100040664164018'}) o hablar con una persona, invítalo a tocar el botón de WhatsApp o menciona que pueden comunicarse al WhatsApp oficial (${settings.whatsappLine2}).
5. Los pagos se realizan por Mercado Pago o transferencia al alias: ${settings.mercadopagoAlias} o CVU: ${settings.mercadopagoCvu || '0000003100040664164018'}.
6. Responde de forma concisa y clara, usando viñetas si explicas cuidados paso a paso.

CATÁLOGO ACTUALIZADO EN TIEMPO REAL:
${catalogSummary}
`;
  },

  async sendMessage(
    userMessage: string,
    history: { sender: 'user' | 'bot'; content: string }[],
    plants: Plant[],
    settings: StoreSettings
  ): Promise<string> {
    const cleanUserMessage = securityService.sanitizeInput(userMessage, 500);
    if (!cleanUserMessage) return 'Por favor escribe tu consulta sobre las kokedamas.';

    // Canal seguro: se envía al endpoint proxy local o de Netlify (/api/chat)
    // Protege la API Key de DeepSeek evitando que viaje expuesta en el navegador
    try {
      const messages: MessagePayload[] = [
        { role: 'system', content: this.buildSystemPrompt(plants, settings) }
      ];

      // Añadir últimos 6 mensajes del historial sanitizados
      const recentHistory = history.slice(-6);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: securityService.sanitizeInput(msg.content, 500)
        });
      }

      messages.push({ role: 'user', content: cleanUserMessage });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply;
      }
    } catch {
      // Si el proxy no está disponible, continúa limpiamente al motor local
    }

    // Fallback inteligente local (garantiza que el chatbot funcione al 100% incluso sin clave cargada)
    return this.smartLocalFallback(cleanUserMessage, plants, settings);
  },

  smartLocalFallback(query: string, plants: Plant[], settings: StoreSettings): string {
    const q = query.toLowerCase();

    // 1. WhatsApp / Contacto / Comprar
    if (q.includes('whatsapp') || q.includes('contacto') || q.includes('comprar') || q.includes('pedir') || q.includes('pedido') || q.includes('encargar') || q.includes('humano')) {
      return `¡Con mucho gusto! Puedes coordinar tu pedido o consultar dudas directamente por WhatsApp con nuestro equipo en José C. Paz. Haz clic en el botón de WhatsApp abajo o escríbenos a nuestro WhatsApp oficial (${settings.whatsappLine2}). ¡Te esperamos! 🌿`;
    }

    // 2. Mercado Pago / Pagos / Precio general
    if (q.includes('mercadopago') || q.includes('mercado pago') || q.includes('pago') || q.includes('alias') || q.includes('transferencia') || q.includes('cvu')) {
      const cvuText = settings.mercadopagoCvu ? `\n• **CVU:** \`${settings.mercadopagoCvu}\`` : '';
      return `Aceptamos pagos por Mercado Pago y transferencias directas:\n\n• **Alias oficial:** \`${settings.mercadopagoAlias}\`${cvuText}\n\nTambién puedes seleccionar tus kokedamas favoritas en el catálogo y presionar el botón "Consultar selección" para ver el total y pagar con QR o Alias en un clic. 💳`;
    }

    // 3. Riego y cuidados generales
    if (q.includes('regar') || q.includes('riego') || q.includes('inmersion') || q.includes('cuidar') || q.includes('cuidados') || q.includes('musgo')) {
      return `Las kokedamas se riegan con la técnica japonesa de **inmersión**:\n\n1. Sumerge la bola de musgo en un recipiente con agua fresca durante 10 a 15 minutos (hasta que dejen de salir burbujitas).\n2. Retírala y déjala escurrir suavemente sobre una rejilla o plato.\n3. Repite cada 7-10 días (o cada 12-15 días si es una suculenta como Jade o Echeveria).\n\n💡 *Tip de Koke Color:* Si al alzar tu kokedama la sientes muy liviana, ¡es momento de regarla!`;
    }

    // 4. Búsqueda de una planta específica en el catálogo
    for (const p of plants) {
      const matchName = q.includes(p.name.toLowerCase()) || 
                        q.includes(p.scientificName.toLowerCase()) || 
                        p.name.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word));
      
      if (matchName) {
        const stockStatus = p.inStock 
          ? `🟢 **En stock**: Sí, tenemos ejemplares disponibles.` 
          : `🔴 **Stock temporal**: Actualmente está agotada, pero puedes consultarnos por WhatsApp cuándo ingresa nueva tanda.`;

        return `**${p.name}** (*${p.scientificName}*):\n\n` +
               `• **Precio:** $ ${p.price.toLocaleString('es-AR')}\n` +
               `• ${stockStatus}\n` +
               `• **Luz requerida:** ${p.light} (${p.lightGuide})\n` +
               `• **Riego:** ${p.wateringGuide}\n\n` +
               `¿Te gustaría que te ayude a coordinar tu pedido por WhatsApp?`;
      }
    }

    // 5. Preguntas sobre stock disponible
    if (q.includes('stock') || q.includes('disponible') || q.includes('cuales tienen') || q.includes('que hay')) {
      const inStockPlants = plants.filter(p => p.inStock).map(p => `• ${p.name} ($ ${p.price.toLocaleString('es-AR')})`).slice(0, 6).join('\n');
      return `Actualmente tenemos varias kokedamas hermosas listas para entrega en José C. Paz:\n\n${inStockPlants}\n\n... ¡y más en el catálogo! ¿Te interesa alguna en particular o prefieres ver las de flor o suculentas?`;
    }

    // 6. Ubicación / Envíos
    if (q.includes('donde estan') || q.includes('ubicacion') || q.includes('donde queda') || q.includes('envio') || q.includes('entrega') || q.includes('paz')) {
      return `Nuestro punto de venta y taller artesanal se encuentra en **${settings.city}**. Realizamos entregas coordinadas y pedidos personalizados a través de nuestras dos líneas de WhatsApp. 📍`;
    }

    // 7. Respuesta genérica de bienvenida
    return `¡Hola! Soy KokeBot, el asistente de Koke Color. Puedo ayudarte con información sobre:\n\n` +
           `• Precios y stock de nuestras 15 kokedamas artesanales.\n` +
           `• Guías de riego por inmersión y luminosidad.\n` +
           `• Métodos de pago con Mercado Pago (Alias: ${settings.mercadopagoAlias}).\n` +
           `• Coordinación directa por WhatsApp.\n\n` +
           `¿Qué consulta tienes sobre nuestras plantas? 🌿`;
  }
};
