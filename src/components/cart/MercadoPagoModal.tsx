import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  QrCode,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Gift,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, StoreSettings } from '../../types';
import { mercadopagoService, PaymentProcessResult } from '../../services/mercadopago';
import { whatsappService } from '../../services/whatsapp';
import { dbService } from '../../services/db';
import { CardPaymentForm } from './CardPaymentForm';

interface MercadoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: CartItem[];
  settings: StoreSettings;
  onClearCart?: () => void;
}

export const MercadoPagoModal: React.FC<MercadoPagoModalProps> = ({
  isOpen,
  onClose,
  total,
  items,
  settings,
  onClearCart
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'qr' | 'alias'>('card');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCvu, setCopiedCvu] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<PaymentProcessResult | null>(null);

  // Guardar copia local de items y total para no perderlos si se limpia el carrito en checkout exitoso
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [purchasedTotal, setPurchasedTotal] = useState<number>(0);

  // Datos de contacto del cliente post-pago
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [acceptsOffers, setAcceptsOffers] = useState(true);
  const [isContactSaved, setIsContactSaved] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItems = purchasedItems.length > 0 ? purchasedItems : items;
  const currentTotal = purchasedTotal > 0 ? purchasedTotal : total;

  const cvu = settings.mercadopagoCvu || '0000003100040664164018';
  const publicKey =
    (settings.mercadopagoPublicKey && settings.mercadopagoPublicKey.trim()) ||
    import.meta.env.VITE_MP_PUBLIC_KEY ||
    import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ||
    '';

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

  const handlePaymentSuccess = (result: PaymentProcessResult) => {
    setPurchasedItems([...items]);
    setPurchasedTotal(total);
    setPaymentSuccessData(result);
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
    if (onClearCart) {
      onClearCart();
    }
  };

  const saveLeadData = (paymentNote?: string): boolean => {
    if (!customerName.trim()) {
      setContactError('Por favor ingresa tu nombre completo.');
      return false;
    }
    if (!customerPhone.trim()) {
      setContactError('Por favor ingresa tu número de teléfono / WhatsApp.');
      return false;
    }
    setContactError(null);

    const selectedDescriptions = currentItems.map(
      (i) => `${i.plant.name}${i.selectedColor ? ` (Flor ${i.selectedColor})` : ''}${i.quantity > 1 ? ` x${i.quantity}` : ''}`
    );

    const defaultNote = paymentSuccessData?.id
      ? `Pago con Tarjeta MP #${paymentSuccessData.id} - Aprobado ($ ${currentTotal.toLocaleString('es-AR')})`
      : paymentNote || `Compra MP ($ ${currentTotal.toLocaleString('es-AR')})`;

    dbService.registerLead(
      customerName.trim(),
      customerPhone.trim(),
      settings.whatsappLine2,
      selectedDescriptions,
      customerEmail.trim() || undefined,
      acceptsOffers,
      defaultNote
    );

    setIsContactSaved(true);
    return true;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveLeadData();
  };

  const handleOpenWhatsAppPostPayment = () => {
    // Si aún no guardó los datos pero los completó, los guardamos antes de abrir WhatsApp
    if (!isContactSaved) {
      const saved = saveLeadData();
      if (!saved) return;
    }

    const whatsappLink = paymentSuccessData?.id
      ? whatsappService.createCardPaymentProofLink(
          settings.whatsappLine2,
          paymentSuccessData.id,
          currentTotal,
          currentItems,
          {
            name: customerName.trim() || undefined,
            phone: customerPhone.trim() || undefined,
            email: customerEmail.trim() || undefined
          }
        )
      : whatsappService.createPaymentProofLink(
          settings.whatsappLine2,
          settings.mercadopagoAlias,
          currentTotal,
          currentItems,
          {
            name: customerName.trim() || undefined,
            phone: customerPhone.trim() || undefined,
            email: customerEmail.trim() || undefined
          }
        );

    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTransferWhatsApp = () => {
    // Si completó sus datos en la pestaña de transferencia o QR, los registramos
    if (customerName.trim() && customerPhone.trim()) {
      saveLeadData(`Transferencia o QR MP ($ ${currentTotal.toLocaleString('es-AR')})`);
    }

    const whatsappLink = whatsappService.createPaymentProofLink(
      settings.whatsappLine2,
      settings.mercadopagoAlias,
      currentTotal,
      currentItems,
      customerName.trim()
        ? {
            name: customerName.trim(),
            phone: customerPhone.trim() || undefined,
            email: customerEmail.trim() || undefined
          }
        : undefined
    );

    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  // Generar URL del código QR
  const qrCodeData = encodeURIComponent(
    `mercadopago://transfer?alias=${settings.mercadopagoAlias}&amount=${total}`
  );
  const qrImageUrl =
    settings.mercadopagoQrUrl && settings.mercadopagoQrUrl.trim().length > 5
      ? settings.mercadopagoQrUrl
      : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${qrCodeData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden border border-surface-border flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Mercado Pago */}
        <div className="bg-[#009EE3] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white text-[#009EE3] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              MP
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                Pagar con Mercado Pago
              </h3>
              <p className="text-xs text-sky-100">
                Tarjeta de Crédito, Débito, QR o Transferencia
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPaymentSuccessData(null);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            VISTA DE PAGO APROBADO: FORMULARIO DE CONTACTO + WHATSAPP
            ======================================================== */}
        {paymentSuccessData ? (
          <div className="p-5 sm:p-7 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-stone-900">
                ¡Pago Aprobado!
              </h4>
              <p className="text-xs text-stone-600">
                {paymentSuccessData.message || 'Tu pago con tarjeta se ha procesado con éxito.'}
              </p>
            </div>

            {/* Resumen del cobro */}
            <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-2xl text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-0.5 border-b border-stone-200/50">
                <span className="text-stone-500 font-medium">Nº de Operación:</span>
                <span className="font-mono font-bold text-stone-900">#{paymentSuccessData.id}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-stone-200/50">
                <span className="text-stone-500 font-medium">Total abonado:</span>
                <span className="font-bold text-stone-900 text-sm">$ {currentTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-stone-500 font-medium">Estado:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {paymentSuccessData.status || 'approved'}
                </span>
              </div>
            </div>

            {/* FORMULARIO DE DATOS DE CONTACTO DEL CLIENTE */}
            <div className="bg-[#FAF8F5] border border-emerald-200/70 rounded-3xl p-4 sm:p-5 text-left space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#164e28] text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold text-stone-900">
                    Datos de contacto para la entrega
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    Por favor completa tus datos para coordinar el despacho en {settings.city}.
                  </p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
                {/* Nombre y apellido */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Nombre y Apellido <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (contactError) setContactError(null);
                      }}
                      placeholder="Ej: María Gómez"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#164e28] bg-white font-medium text-stone-900 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Teléfono / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (contactError) setContactError(null);
                      }}
                      placeholder="Ej: 11 7609-2591"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#164e28] bg-white font-medium text-stone-900 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Correo Electrónico (Opcional para ofertas) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      Correo Electrónico
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">Opcional</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ej: maria@ejemplo.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#164e28] bg-white font-medium text-stone-900 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Checkbox para recibir ofertas de nuevos productos */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-white p-3 rounded-2xl border border-emerald-200/80 hover:border-emerald-400 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={acceptsOffers}
                    onChange={(e) => setAcceptsOffers(e.target.checked)}
                    className="mt-0.5 rounded text-[#164e28] focus:ring-[#164e28] w-4 h-4 shrink-0 accent-[#164e28]"
                  />
                  <div className="text-[11px] text-stone-700 leading-tight">
                    <span className="font-semibold text-emerald-950 flex items-center gap-1.5 mb-0.5">
                      <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Recibir ofertas de nuevos productos
                    </span>
                    <span className="text-stone-600">
                      Deseo recibir promociones exclusivas y avisos de nuevos kokedamas y colores en mi email 🌿
                    </span>
                  </div>
                </label>

                {contactError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{contactError}</span>
                  </div>
                )}

                {isContactSaved ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">
                      ¡Tus datos quedaron guardados con éxito!
                    </span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar y Guardar Mis Datos</span>
                  </button>
                )}
              </form>
            </div>

            {/* BOTÓN COORDINAR POR WHATSAPP */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleOpenWhatsAppPostPayment}
                className="w-full py-3.5 px-4 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>Coordinar envío por WhatsApp con este comprobante</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={() => {
                  setPaymentSuccessData(null);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Pestañas de modo de pago */}
            <div className="flex border-b border-surface-border bg-[#FAF8F5] p-1.5 gap-1.5">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'card'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#009EE3]" />
                <span>Tarjeta</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'alias'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Copy className="w-4 h-4 text-[#164e28]" />
                <span>Alias / CVU</span>
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {/* Total a pagar */}
              <div className="text-center bg-[#FAF8F5] p-3 rounded-2xl border border-surface-border">
                <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-0.5">
                  Monto total del pedido
                </span>
                <span className="font-serif text-3xl font-bold text-[#1C1917]">
                  $ {total.toLocaleString('es-AR')}
                </span>
              </div>

              {/* VISTA 1: TARJETA DE CRÉDITO / DÉBITO */}
              {activeTab === 'card' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {publicKey ? (
                    <CardPaymentForm
                      total={total}
                      items={items}
                      publicKey={publicKey}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={(err) => console.log('Error de pago:', err)}
                    />
                  ) : (
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3 text-xs text-amber-900">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Configuración de Tarjetas de Mercado Pago</span>
                      </div>
                      <p className="leading-relaxed text-amber-950">
                        Para habilitar el cobro seguro con tarjeta en tu tienda, necesitas ingresar tu <strong>Public Key</strong> de Mercado Pago.
                      </p>
                      <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80 space-y-1.5 text-[11px]">
                        <p className="font-semibold text-stone-800">¿Cómo activarlo?</p>
                        <p>1. Ingresa a <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noopener noreferrer" className="text-[#009EE3] underline font-semibold">Mercado Pago Developers</a>.</p>
                        <p>2. Copia tu <strong>Public Key</strong> (ej: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">TEST-xxxx</code> o <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">APP_USR-xxxx</code>).</p>
                        <p>3. Pégala en el <strong>Panel de Administrador &gt; Ajustes</strong> de tu web o configúrala en <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">.env.local</code> como <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">VITE_MP_PUBLIC_KEY</code>.</p>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        <span>Mientras tanto, también puedes recibir pagos inmediatamente mediante </span>
                        <button
                          onClick={() => setActiveTab('alias')}
                          className="font-bold text-[#009EE3] underline"
                        >
                          Alias / CVU
                        </button>
                        <span> o </span>
                        <button
                          onClick={() => setActiveTab('qr')}
                          className="font-bold text-[#009EE3] underline"
                        >
                          Código QR
                        </button>.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISTA 2: CÓDIGO QR */}
              {activeTab === 'qr' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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

                  <div className="text-xs space-y-1 text-[#78716C] bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                    <p className="font-semibold text-[#1C1917] flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ¿Cómo pagar con QR?
                    </p>
                    <p>1. Abre tu app de <strong>Mercado Pago</strong> en tu celular.</p>
                    <p>2. Toca el botón <strong>"Escanear código QR"</strong>.</p>
                    <p>3. Apunta a este código en tu pantalla e ingresa o confirma el monto de <strong>$ {total.toLocaleString('es-AR')}</strong>.</p>
                  </div>

                  {/* Datos opcionales del cliente para envío y ofertas */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2 text-xs">
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5 text-[11px]">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      Tus datos para la entrega (Opcional):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Tu Nombre completo"
                        className="px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Tu Teléfono / WhatsApp"
                        className="px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                      />
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Tu Email (Opcional, para recibir ofertas)"
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] text-stone-600 pt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptsOffers}
                        onChange={(e) => setAcceptsOffers(e.target.checked)}
                        className="rounded text-[#164e28] accent-[#164e28] w-3.5 h-3.5"
                      />
                      <span>Quiero recibir ofertas de nuevos productos en mi email 🌿</span>
                    </label>
                  </div>

                  <button
                    onClick={handleOpenTransferWhatsApp}
                    className="w-full py-3 px-4 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>Enviar comprobante de pago por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>
              )}

              {/* VISTA 3: ALIAS Y CVU MANUAL */}
              {activeTab === 'alias' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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

                  {/* Datos opcionales del cliente para envío y ofertas */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2 text-xs">
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5 text-[11px]">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      Tus datos para la entrega (Opcional):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Tu Nombre completo"
                        className="px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Tu Teléfono / WhatsApp"
                        className="px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                      />
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Tu Email (Opcional, para recibir ofertas)"
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#164e28]"
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] text-stone-600 pt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptsOffers}
                        onChange={(e) => setAcceptsOffers(e.target.checked)}
                        className="rounded text-[#164e28] accent-[#164e28] w-3.5 h-3.5"
                      />
                      <span>Quiero recibir ofertas de nuevos productos en mi email 🌿</span>
                    </label>
                  </div>

                  <button
                    onClick={handleOpenTransferWhatsApp}
                    className="w-full py-3 px-4 rounded-full bg-[#164e28] hover:bg-[#123f21] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>Enviar comprobante de pago por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
