import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, StoreSettings } from '../../types';
import { whatsappService } from '../../services/whatsapp';

interface DeepSeekChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, userName?: string) => void;
  onClearChat: () => void;
  settings: StoreSettings;
}

export const DeepSeekChatbot: React.FC<DeepSeekChatbotProps> = ({
  isOpen,
  onToggle,
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [isAskingName, setIsAskingName] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, userName || undefined);
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    onSendMessage(q, userName || undefined);
  };

  const whatsappLink = whatsappService.createGeneralLink(settings.whatsappLine2, settings.city);

  return (
    <>
      {/* Botón flotante del Chatbot (Esquina inferior izquierda) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={onToggle}
          className={`h-12 px-4 rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-300 ${
            isOpen
              ? 'bg-stone-900 text-white'
              : 'bg-[#164e28] hover:bg-[#123f21] text-white hover:scale-105 ring-4 ring-[#164e28]/20'
          }`}
          title="Abrir chat botánico inteligente"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Consultar con KokeBot
          </span>
        </button>
      </div>

      {/* Ventana del Chatbot */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[530px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-surface-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header del Chat */}
          <div className="p-4 bg-[#164e28] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif text-sm font-bold leading-tight">KokeBot IA</h4>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
                    DeepSeek
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/80">
                  Asesor botánico y stock en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onClearChat}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
                title="Reiniciar conversación"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Questions Pills */}
          <div className="p-2.5 bg-[#FAF8F5] border-b border-surface-border/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            <button
              onClick={() => handleQuickQuestion('¿Cómo se riegan las kokedamas?')}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-emerald-50 text-[#1C1917] border border-surface-border px-2.5 py-1 rounded-full transition-colors shrink-0"
            >
              🌿 ¿Cómo se riegan?
            </button>
            <button
              onClick={() => handleQuickQuestion('¿Qué plantas tienen disponibles en stock?')}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-emerald-50 text-[#1C1917] border border-surface-border px-2.5 py-1 rounded-full transition-colors shrink-0"
            >
              📦 ¿Qué hay en stock?
            </button>
            <button
              onClick={() => handleQuickQuestion('¿Cómo puedo pagar con Mercado Pago?')}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-emerald-50 text-[#1C1917] border border-surface-border px-2.5 py-1 rounded-full transition-colors shrink-0"
            >
              💳 Pagar con Mercado Pago
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isUser ? 'bg-stone-800' : 'bg-[#164e28]'
                    }`}
                  >
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-emerald-200" />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-none'
                      : 'bg-[#FAF8F5] text-[#1C1917] border border-surface-border rounded-tl-none shadow-xs'
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Botón de acción WhatsApp si aplica */}
                    {msg.action?.type === 'whatsapp' && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#164e28] text-white text-[11px] font-semibold hover:bg-[#123f21] transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{msg.action.label}</span>
                      </a>
                    )}

                    <span className="text-[9px] opacity-50 block mt-1 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#164e28] text-emerald-300 flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-[#FAF8F5] px-3 py-2 rounded-2xl border border-surface-border flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-300"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-surface-border bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-full bg-[#FAF8F5] border border-surface-border focus:outline-none focus:border-[#164e28]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-full bg-[#164e28] text-white hover:bg-[#123f21] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
