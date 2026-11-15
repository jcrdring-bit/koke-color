import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { CustomerLead, ConversationLog } from '../../types';
import { MessageSquare, Users, MessageCircle, Clock } from 'lucide-react';

export const CrmTab: React.FC = () => {
  const [leads] = useState<CustomerLead[]>(() => dbService.getLeads());
  const [conversations] = useState<ConversationLog[]>(() => dbService.getConversations());
  const [selectedConv, setSelectedConv] = useState<ConversationLog | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Prospectos / Clientes</span>
          </div>
          <span className="font-serif text-2xl font-bold text-emerald-950">
            {leads.length}
          </span>
        </div>

        <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2 text-[#78716C] text-xs font-semibold mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Conversaciones totales</span>
          </div>
          <span className="font-serif text-2xl font-bold text-[#1C1917]">
            {conversations.length}
          </span>
        </div>

        <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-sky-800 text-xs font-semibold mb-1">
            <MessageCircle className="w-4 h-4" />
            <span>Derivados a WhatsApp</span>
          </div>
          <span className="font-serif text-2xl font-bold text-sky-950">
            {conversations.filter(c => c.derivedToWhatsapp).length}
          </span>
        </div>
      </div>

      {/* Visor de conversaciones recientes */}
      <div className="space-y-3">
        <h4 className="font-serif text-sm font-bold text-[#1C1917]">
          Historial de Consultas de Clientes (Chatbot)
        </h4>

        {conversations.length === 0 ? (
          <div className="text-center py-10 text-[#78716C] text-xs bg-[#FAF8F5] rounded-2xl border border-surface-border">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p>Aún no hay conversaciones registradas.</p>
            <p className="text-[11px] text-stone-400">Cuando los visitantes chateen con KokeBot aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
            {/* Lista de chats */}
            <div className="space-y-2">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConv(c)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedConv?.id === c.id
                      ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                      : 'bg-white border-surface-border hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1C1917]">
                      {c.customerName || 'Cliente web anónimo'}
                    </span>
                    <span className="text-[10px] text-[#78716C]">
                      {new Date(c.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#78716C] truncate text-[11px]">
                    {c.messages[c.messages.length - 1]?.content || 'Sin mensajes'}
                  </p>
                  {c.derivedToWhatsapp && (
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full font-medium">
                      ✓ Pidió WhatsApp
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Detalle del chat seleccionado */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-surface-border p-3.5 flex flex-col justify-between">
              {selectedConv ? (
                <>
                  <div className="mb-2 pb-2 border-b border-surface-border flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C1917]">
                      Transcripción del chat
                    </span>
                    <span className="text-[10px] text-[#78716C]">
                      {selectedConv.messages.length} mensajes
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-60 text-xs pr-1">
                    {selectedConv.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-xl text-[11px] ${
                          m.sender === 'user'
                            ? 'bg-stone-800 text-white ml-4'
                            : 'bg-white border border-surface-border mr-4 text-[#1C1917]'
                        }`}
                      >
                        <span className="text-[9px] opacity-70 block mb-0.5 font-bold">
                          {m.sender === 'user' ? 'Cliente' : 'KokeBot'}:
                        </span>
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-stone-400 text-xs">
                  Selecciona una conversación a la izquierda para ver su detalle.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
