import { useState, useEffect } from 'react';
import { ChatMessage, Plant, StoreSettings, ConversationLog } from '../types';
import { deepseekService } from '../services/deepseek';
import { dbService } from '../services/db';

export function useChat(plants: Plant[], settings: StoreSettings) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      content: '¡Hola! 🌿 Soy KokeBot, el asistente de Koke Color. ¿En qué puedo ayudarte hoy? Puedes consultarme sobre cuidados de las kokedamas, precios, stock disponible o cómo coordinar tu entrega por WhatsApp.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Persistir en el CRM / conversaciones
  useEffect(() => {
    if (messages.length > 1) {
      const conv: ConversationLog = {
        id: sessionId,
        sessionId,
        startedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messages,
        derivedToWhatsapp: messages.some(m => m.action?.type === 'whatsapp')
      };
      dbService.saveConversation(conv);
    }
  }, [messages, sessionId]);

  const sendMessage = async (content: string, userLeadName?: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.sender === 'user' || m.sender === 'bot')
        .map(m => ({ sender: m.sender as 'user' | 'bot', content: m.content }));

      const botReply = await deepseekService.sendMessage(content, history, plants, settings);

      const isWhatsappIntent = content.toLowerCase().includes('comprar') || 
                               content.toLowerCase().includes('whatsapp') ||
                               content.toLowerCase().includes('pedido') ||
                               botReply.toLowerCase().includes('whatsapp');

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        sender: 'bot',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: isWhatsappIntent ? {
          type: 'whatsapp',
          label: 'Contactar por WhatsApp ahora'
        } : undefined
      };

      setMessages(prev => [...prev, botMsg]);

      // Si el usuario compartió su nombre o pidió WhatsApp, registrar en el CRM
      if (userLeadName || isWhatsappIntent) {
        dbService.registerLead(
          userLeadName || 'Interesado Web',
          undefined,
          'linea_1',
          []
        );
      }
    } catch (err) {
      console.error('Error generating chat reply', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'bot',
          content: 'Disculpa, tuve una breve desconexión. Puedes comunicarte directamente a nuestro WhatsApp oficial para cualquier consulta.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        content: '¡Conversación reiniciada! 🌿 ¿Qué kokedama te gustaría conocer o cuidar hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    clearChat
  };
}
