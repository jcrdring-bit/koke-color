import { Plant, StoreSettings } from '../types';
import { securityService } from './security';

interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const antigravityService = {
  buildSystemPrompt(plants: Plant[], settings: StoreSettings): string {
    const catalogSummary = plants.map(p => 
      `- ${p.name} (${p.scientificName}): $${p.price.toLocaleString('es-AR')}. Stock: ${p.inStock ? 'DISPONIBLE' : 'AGOTADO'}. Luz: ${p.light}. Riego: ${p.wateringGuide}`
    ).join('\n');

    return `Eres "KokeBot", el asistente botánico virtual de la tienda "Koke Color" (Naturaleza que flota), ubicada en ${settings.city}. Estás impulsado por la IA de Antigravity (Google DeepMind).

RESTRICCIÓN ESTRICTA DE ALCANCE (REGLA DE ORO OBLIGATORIA):
1. SOLO TIENES PERMITIDO responder sobre las kokedamas, precios y servicios que están dentro de esta aplicación:
   a) Las kokedamas artesanales que figuran EXCLUSIVAMENTE en el "CATÁLOGO ACTUALIZADO EN TIEMPO REAL" provisto más abajo (nombres, precios exactos en $ ARS y estado de stock).
   b) Cuidados específicos de kokedamas: técnica japonesa de riego por inmersión semanal (10-15 min) y luminosidad requerida.
   c) Formas de pago dentro de la app: Tarjeta de crédito en cuotas y débito (Mercado Pago), Código QR, o transferencia directa al Alias: ${settings.mercadopagoAlias} (CVU: ${settings.mercadopagoCvu || '0000003100040664164018'}).
   d) Ubicación del taller artesanal en ${settings.city} y contacto por WhatsApp oficial (${settings.whatsappLine2}).

PROHIBICIONES ABSOLUTAS:
- NO hables de plantas, especies, flores o productos que NO figuren en el catálogo adjunto.
- NO inventes precios ni productos.
- NO respondas sobre temas ajenos a Koke Color (política, deportes, recetas, tareas, tecnología general, cultura general, etc.).
- Si el usuario te pregunta por cualquier cosa, planta, precio o tema que NO esté en la app:
  DEBES NEGARTE AMABLEMENTE Y RESPONDER EXACTAMENTE:
  "Solo puedo responder consultas sobre las kokedamas, precios y servicios disponibles en nuestra tienda Koke Color. Si buscas otra variedad o tienes una consulta especial, puedes consultar directamente a nuestro WhatsApp oficial."
  Y finaliza SIEMPRE agregando la etiqueta: [WHATSAPP_ACTION]

REGLAS DE ATENCIÓN:
- Tono: Cálido, botánico, conciso y respetuoso.
- Si una planta está AGOTADA según el catálogo, indícalo amablemente y ofrece las que sí tienen stock.
- Siempre que el cliente quiera comprar o coordinar envío, sugiérele contactar al WhatsApp oficial de consultas (${settings.whatsappLine2}).

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
    if (!cleanUserMessage) return 'Por favor escribe tu consulta sobre las kokedamas de Koke Color.';

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
        body: JSON.stringify({
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.text || data.choices?.[0]?.message?.content;

      if (reply && typeof reply === 'string') {
        return reply.trim();
      }

      throw new Error('Respuesta vacía');
    } catch (err) {
      console.warn('Antigravity API no disponible o sin conexión. Usando asesor botánico local estricto:', err);
      return this.getLocalBotanicalAdvice(cleanUserMessage, plants, settings);
    }
  },

  /**
   * Asesor botánico local con estricta restricción de alcance a la app
   */
  getLocalBotanicalAdvice(query: string, plants: Plant[], settings: StoreSettings): string {
    const q = query.toLowerCase();

    // 1. WhatsApp / Contacto / Comprar
    if (q.includes('whatsapp') || q.includes('contacto') || q.includes('comprar') || q.includes('pedir') || q.includes('pedido') || q.includes('encargar') || q.includes('humano')) {
      return `¡Con mucho gusto! Puedes coordinar tu pedido o consultar dudas directamente por WhatsApp con nuestro equipo en José C. Paz. Haz clic en el botón de WhatsApp abajo o escríbenos a nuestro WhatsApp oficial (${settings.whatsappLine2}). ¡Te esperamos! 🌿\n\n[WHATSAPP_ACTION]`;
    }

    // 2. Mercado Pago / Pagos / Tarjetas
    if (q.includes('mercadopago') || q.includes('mercado pago') || q.includes('tarjeta') || q.includes('credito') || q.includes('cuotas') || q.includes('pago') || q.includes('alias') || q.includes('transferencia') || q.includes('cvu')) {
      const cvuText = settings.mercadopagoCvu ? `\n• **CVU:** \`${settings.mercadopagoCvu}\`` : '';
      return `Aceptamos todas las opciones de pago disponibles en la app:\n\n• **Tarjetas de crédito en cuotas** y débito por Mercado Pago.\n• **Código QR interoperable** para escanear con la app.\n• **Alias oficial:** \`${settings.mercadopagoAlias}\`${cvuText}\n\nPresiona el botón "Pagar con Mercado Pago" en tu carrito para elegir tu método favorito. 💳✨`;
    }

    // 3. Riego y cuidados generales de kokedamas
    if (q.includes('regar') || q.includes('riego') || q.includes('inmersion') || q.includes('cuidar') || q.includes('cuidados') || q.includes('musgo') || q.includes('luz')) {
      return `Las kokedamas de nuestro catálogo se riegan con la técnica japonesa de **inmersión**:\n\n1. Sumerge la bola de musgo en un recipiente con agua fresca durante 10 a 15 minutos (hasta que dejen de salir burbujitas).\n2. Retírala y déjala escurrir suavemente sobre una rejilla o plato.\n3. Repite cada 7-10 días (o cada 12-15 días si es una suculenta como Jade o Echeveria).\n\n💡 *Tip de Koke Color:* Si al alzar tu kokedama la sientes muy liviana, ¡es momento de regarla!`;
    }

    // 4. Búsqueda de una planta específica que SÍ esté en el catálogo
    for (const p of plants) {
      const matchName = q.includes(p.name.toLowerCase()) || 
                        q.includes(p.scientificName.toLowerCase()) || 
                        p.name.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word));
      
      if (matchName) {
        const stockStatus = p.inStock 
          ? `🟢 **En stock**: Disponible en nuestro catálogo.` 
          : `🔴 **Stock temporal**: Actualmente agotada en el catálogo.`;

        const colorNote = p.colorVariants && p.colorVariants.length > 0
          ? `• **Colores de flor disponibles:** ${p.colorVariants.map(v => v.name).join(', ')} (puedes seleccionarlo directamente en la tarjeta de la planta al comprar).\n`
          : '';

        return `**${p.name}** (*${p.scientificName}*):\n\n` +
               `• **Precio en la tienda:** $ ${p.price.toLocaleString('es-AR')}\n` +
               `• ${stockStatus}\n` +
               colorNote +
               `• **Luz requerida:** ${p.light} (${p.lightGuide})\n` +
               `• **Riego:** ${p.wateringGuide}\n\n` +
               `¿Te gustaría consultarnos por WhatsApp para coordinar tu entrega?`;
      }
    }

    // 5. Preguntas sobre stock disponible en el catálogo
    if (q.includes('stock') || q.includes('disponible') || q.includes('cuales tienen') || q.includes('que hay') || q.includes('catalogo') || q.includes('plantas')) {
      const inStockPlants = plants.filter(p => p.inStock).map(p => `• ${p.name} ($ ${p.price.toLocaleString('es-AR')})`).slice(0, 6).join('\n');
      return `Actualmente tenemos estas kokedamas disponibles en el catálogo de la app:\n\n${inStockPlants}\n\n... puedes verlas todas con sus fotos en la pantalla principal. ¿Te interesa alguna en particular?`;
    }

    // 6. Ubicación / Envíos
    if (q.includes('donde estan') || q.includes('ubicacion') || q.includes('donde queda') || q.includes('envio') || q.includes('entrega') || q.includes('paz')) {
      return `Nuestro punto de venta y taller artesanal se encuentra en **${settings.city}**. Realizamos entregas coordinadas a través de WhatsApp (${settings.whatsappLine2}). 📍`;
    }

    // 7. Si no es nada del catálogo ni de la app -> RECHAZO ESTRICTO CON OPCIÓN DE WHATSAPP
    return `Solo puedo responder consultas sobre las kokedamas, precios y servicios disponibles en nuestra tienda Koke Color. Si buscas otra variedad o tienes una consulta especial, puedes consultar directamente a nuestro WhatsApp oficial.\n\n[WHATSAPP_ACTION]`;
  }
};

// Compatibilidad hacia atrás
export const deepseekService = antigravityService;
