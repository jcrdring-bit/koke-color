import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { CustomerLead, ConversationLog } from '../../types';
import {
  MessageSquare,
  Users,
  MessageCircle,
  Clock,
  Mail,
  Phone,
  Gift,
  Search,
  ExternalLink,
  Copy,
  Check,
  Tag
} from 'lucide-react';
import { whatsappService } from '../../services/whatsapp';

export const CrmTab: React.FC = () => {
  const [leads] = useState<CustomerLead[]>(() => dbService.getLeads());
  const [conversations] = useState<ConversationLog[]>(() => dbService.getConversations());
  const [selectedConv, setSelectedConv] = useState<ConversationLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const leadsWithOffers = leads.filter((l) => l.acceptsOffers);

  const filteredLeads = leads.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      l.selectedPlants.some((p) => p.toLowerCase().includes(q))
    );
  });

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold mb-1">
            <Users className="w-4 h-4 shrink-0" />
            <span>Clientes / Leads</span>
          </div>
          <span className="font-serif text-2xl font-bold text-emerald-950">
            {leads.length}
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold mb-1">
            <Gift className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Suscritos a Ofertas</span>
          </div>
          <span className="font-serif text-2xl font-bold text-amber-950">
            {leadsWithOffers.length}
          </span>
        </div>

        <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-1.5 text-[#78716C] text-xs font-semibold mb-1">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Chats Chatbot</span>
          </div>
          <span className="font-serif text-2xl font-bold text-[#1C1917]">
            {conversations.length}
          </span>
        </div>

        <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100">
          <div className="flex items-center gap-1.5 text-sky-800 text-xs font-semibold mb-1">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Derivados a WA</span>
          </div>
          <span className="font-serif text-2xl font-bold text-sky-950">
            {conversations.filter((c) => c.derivedToWhatsapp).length}
          </span>
        </div>
      </div>

      {/* 2. BASE DE DATOS DE CLIENTES Y SUSCRIPTORES A OFERTAS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#164e28]" />
              <span>Base de Clientes y Contactos Registrados</span>
            </h4>
            <p className="text-[11px] text-stone-500">
              Clientes que dejaron sus datos al comprar o consultar, con su preferencia de ofertas.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o planta..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28] w-full sm:w-64"
            />
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-[#78716C] text-xs bg-[#FAF8F5] rounded-2xl border border-surface-border">
            <Users className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p className="font-medium">No se encontraron clientes registrados.</p>
            <p className="text-[11px] text-stone-400">
              Cuando los clientes abonen su pedido o dejen su contacto aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
            {filteredLeads.map((lead) => {
              const waLink = lead.phone
                ? `https://wa.me/${whatsappService.cleanPhone(lead.phone)}`
                : null;

              return (
                <div
                  key={lead.id}
                  className="p-3.5 bg-white rounded-2xl border border-surface-border hover:border-emerald-200 transition-all shadow-2xs space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">
                        {lead.name}
                      </span>
                      {lead.acceptsOffers ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          Suscrito a ofertas
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600">
                          Sin suscripción a ofertas
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(lead.lastContact).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Datos de contacto */}
                  <div className="flex flex-wrap items-center gap-3 text-stone-600 text-[11px]">
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-mono font-medium text-stone-900">{lead.phone}</span>
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#164e28] hover:underline font-semibold ml-1"
                            title="Abrir WhatsApp"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {lead.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium text-stone-800">{lead.email}</span>
                        <button
                          onClick={() => handleCopyEmail(lead.email!)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                          title="Copiar email"
                        >
                          {copiedEmail === lead.email ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic">Email no especificado</span>
                    )}
                  </div>

                  {/* Kokedamas o notas */}
                  {lead.selectedPlants && lead.selectedPlants.length > 0 && (
                    <div className="pt-1 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-stone-500 font-medium">Kokedamas:</span>
                      {lead.selectedPlants.map((plant, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] bg-stone-100 text-stone-800 border border-stone-200"
                        >
                          <Tag className="w-2.5 h-2.5 text-stone-400" />
                          {plant}
                        </span>
                      ))}
                    </div>
                  )}

                  {lead.notes && (
                    <p className="text-[10px] text-stone-500 italic bg-[#FAF8F5] p-2 rounded-xl border border-stone-200/60">
                      {lead.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Visor de conversaciones del Chatbot */}
      <div className="space-y-3 pt-2 border-t border-surface-border">
        <h4 className="font-serif text-sm font-bold text-[#1C1917] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-stone-700" />
          <span>Historial de Consultas de Clientes (Chatbot KokeBot)</span>
        </h4>

        {conversations.length === 0 ? (
          <div className="text-center py-8 text-[#78716C] text-xs bg-[#FAF8F5] rounded-2xl border border-surface-border">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p>Aún no hay conversaciones registradas.</p>
            <p className="text-[11px] text-stone-400">Cuando los visitantes chateen con KokeBot aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[46vh] overflow-y-auto">
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
