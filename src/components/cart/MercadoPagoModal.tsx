import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, ExternalLink, ShieldCheck, QrCode, CreditCard, Sparkles } from 'lucide-react';
import { CartItem, StoreSettings } from '../../types';
import { mercadopagoService } from '../../services/mercadopago';
import { whatsappService } from '../../services/whatsapp';

interface MercadoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: CartItem[];
  settings: StoreSettings;
}

export const MercadoPagoModal: React.FC<MercadoPagoModalProps> = ({
  isOpen,
  onClose,
  total,
  items,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'alias'>('qr');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCvu, setCopiedCvu] = useState(false);

  if (!isOpen) return null;

  const cvu = settings.mercadopagoCvu || '0000003100040664164018';

  const handleCopyAlias = async () => {
    const success = await mercadopagoService.copyAlias(settings.mercadopagoAlias);
    if (success) {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2500);
    }
  };

  const handleCopyCvu = async () => {
    const success = await mercadopagoService.copyAlias(cvu);
    if (success) {
      setCopiedCvu(true);
      setTimeout(() => setCopiedCvu(false), 2500);
    }
  };

  const whatsappProofLink = whatsappService.createPaymentProofLink(
    settings.whatsappLine2,
    settings.mercadopagoAlias,
    total,
    items
  );

  // Generar URL del código QR (usa QR personalizado si se cargó en Ajustes, o genera uno interoperable)
  const qrCodeData = encodeURIComponent(
    `mercadopago://transfer?alias=${settings.mercadopagoAlias}&amount=${total}`
  );
  const qrImageUrl = settings.mercadopagoQrUrl && settings.mercadopagoQrUrl.trim().length > 5
    ? settings.mercadopagoQrUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${qrCodeData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-surface-border flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Mercado Pago */}
        <div className="bg-[#009EE3] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white text-[#009EE3] flex items-center justify-center font-bold text-sm shadow-xs">
              MP
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                Pagar con Mercado Pago
              </h3>
              <p className="text-xs text-sky-100">
                Escaneo QR o Transferencia con Alias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo de pago */}
        <div className="flex border-b border-surface-border bg-[#FAF8F5] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#009EE3]" />
            <span>Código QR</span>
          </button>

          <button
            onClick={() => setActiveTab('alias')}
            className={`flex-1 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'alias'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#164e28]" />
            <span>Alias / CBU</span>
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Total a pagar */}
          <div className="text-center bg-[#FAF8F5] p-3.5 rounded-2xl border border-surface-border">
            <span className="text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-0.5">
              Monto total del pedido
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C1917]">
              $ {total.toLocaleString('es-AR')}
            </span>
          </div>

          {/* VISTA 1: CÓDIGO QR */}
          {activeTab === 'qr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tarjeta de Código QR */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border-2 border-dashed border-[#009EE3]/40 shadow-xs relative">
                <div className="w-52 h-52 sm:w-56 sm:h-56 bg-stone-50 rounded-2xl p-2 flex items-center justify-center border border-stone-200 shadow-inner overflow-hidden">
                  <img
                    src={qrImageUrl}
                    alt="Código QR Mercado Pago Koke Color"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#009EE3] text-[11px] font-bold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Escanea con Mercado Pago</span>
                </div>
              </div>

              {/* Instrucciones del QR */}
              <div className="text-xs space-y-1 text-[#78716C] bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <p className="font-semibold text-[#1C1917] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ¿Cómo pagar con QR?
                </p>
                <p>1. Abre tu app de <strong>Mercado Pago</strong> en tu celular.</p>
                <p>2. Toca el botón <strong>"Escanear código QR"</strong>.</p>
                <p>3. Apunta a este código en tu pantalla e ingresa o confirma el monto de <strong>$ {total.toLocaleString('es-AR')}</strong>.</p>
              </div>
            </div>
          )}

          {/* VISTA 2: ALIAS Y CVU MANUAL */}
          {activeTab === 'alias' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C] block">
                  Alias de Mercado Pago
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-sky-50/70 border border-sky-200 rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-sky-950 truncate select-all">
                    {settings.mercadopagoAlias}
                  </div>
                  <button
                    onClick={handleCopyAlias}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                      copiedAlias
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#164e28] hover:bg-[#123f21] text-white active:scale-95'
                    }`}
                  >
                    {copiedAlias ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Alias</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CVU */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C] block">
                  CVU de Mercado Pago (22 dígitos)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-stone-50 border border-surface-border rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-[#1C1917] truncate select-all">
                    {cvu}
                  </div>
                  <button
                    onClick={handleCopyCvu}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                      copiedCvu
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 hover:bg-black text-white active:scale-95'
                    }`}
                  >
                    {copiedCvu ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar CVU</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-[#78716C] bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <p className="font-semibold text-[#1C1917] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Pasos con Alias o CVU:
                </p>
                <p>1. Copia el <strong>Alias</strong> o el <strong>CVU</strong>.</p>
                <p>2. Transfiere el total desde tu app bancaria o billetera virtual.</p>
                <p>3. Envíanos el comprobante por WhatsApp para coordinar la entrega en {settings.city}.</p>
              </div>
            </div>
          )}

          {/* Botón WhatsApp Comprobante */}
          <a
            href={whatsappProofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>Enviar comprobante de pago por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

        </div>

      </div>
    </div>
  );
};
