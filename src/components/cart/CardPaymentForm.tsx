import React, { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { CartItem } from '../../types';
import { mercadopagoService, PaymentProcessResult } from '../../services/mercadopago';
import { Loader2, AlertCircle, ShieldCheck, Mail } from 'lucide-react';

interface CardPaymentFormProps {
  total: number;
  items: CartItem[];
  publicKey: string;
  onPaymentSuccess: (result: PaymentProcessResult) => void;
  onPaymentError: (errorMessage: string) => void;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  total,
  items,
  publicKey,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState('');

  // Inicializar SDK de Mercado Pago con la clave pública
  useEffect(() => {
    if (publicKey && publicKey.trim().length > 10) {
      try {
        initMercadoPago(publicKey.trim(), { locale: 'es-AR' });
        setIsSdkInitialized(true);
      } catch (err) {
        console.error('Error al inicializar Mercado Pago SDK:', err);
        setErrorMessage('No se pudo inicializar la pasarela de pagos. Revisa la Public Key.');
      }
    }
  }, [publicKey]);

  const handleSubmit = async (formData: any) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const emailToSend = payerEmail.trim() || formData.payer?.email || 'cliente@koke-color.com';

      const payload = {
        token: formData.token,
        issuer_id: formData.issuer_id,
        payment_method_id: formData.payment_method_id,
        transaction_amount: formData.transaction_amount || total,
        installments: formData.installments || 1,
        description: `Koke Color - Pedido de ${items.length} planta(s)`,
        payer: {
          email: emailToSend,
          identification: formData.payer?.identification
        },
        items: items.map(item => ({
          id: `${item.plant.id}${item.selectedColor ? `_${item.selectedColor}` : ''}`,
          title: `${item.plant.name}${item.selectedColor ? ` (Flor ${item.selectedColor})` : ''}`,
          quantity: item.quantity,
          unit_price: item.plant.price
        }))
      };

      const result = await mercadopagoService.processCardPayment(payload);

      if (result.success) {
        onPaymentSuccess(result);
      } else {
        const errorText = result.error || 'El pago no fue aprobado. Por favor, intenta nuevamente.';
        setErrorMessage(errorText);
        onPaymentError(errorText);
      }
    } catch (err: any) {
      const errorText = err?.message || 'Ocurrió un error inesperado al procesar el cobro.';
      setErrorMessage(errorText);
      onPaymentError(errorText);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSdkInitialized) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#009EE3]" />
        <p className="text-xs font-medium">Iniciando pasarela segura de Mercado Pago...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de correo electrónico del pagador */}
      <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-surface-border space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#009EE3]" />
          <span>Email para el comprobante de pago</span>
        </label>
        <input
          type="email"
          placeholder="ejemplo@correo.com"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-surface-border text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#009EE3]"
        />
        <p className="text-[10px] text-stone-500">
          Mercado Pago enviará el comprobante oficial a esta casilla.
        </p>
      </div>

      {/* Alerta de error si el pago fue rechazado */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">No se pudo completar el pago:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Pantalla de procesamiento */}
      {isProcessing && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center gap-3 text-xs text-sky-800">
          <Loader2 className="w-5 h-5 animate-spin text-[#009EE3]" />
          <span className="font-semibold">Procesando pago con tu banco y Mercado Pago...</span>
        </div>
      )}

      {/* Contenedor del Card Payment Brick */}
      <div className="relative bg-white rounded-2xl border border-stone-200/80 p-2 sm:p-3 shadow-xs">
        {!isBrickReady && (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#009EE3]" />
            <span className="text-xs">Cargando formulario seguro de tarjeta...</span>
          </div>
        )}

        <div className={!isBrickReady ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 transition-opacity duration-300'}>
          <CardPayment
            initialization={{
              amount: total,
              payer: payerEmail.trim() ? { email: payerEmail.trim() } : undefined
            }}
            customization={{
              paymentMethods: {
                maxInstallments: 12
              },
              visual: {
                style: {
                  theme: 'flat',
                  customVariables: {
                    baseColor: '#009EE3'
                  }
                }
              }
            }}
            onSubmit={handleSubmit}
            onReady={() => setIsBrickReady(true)}
            onError={(err) => {
              console.error('Error interno de CardPayment Brick:', err);
            }}
          />
        </div>
      </div>

      {/* Sello de seguridad */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Pago 100% encriptado y protegido por Mercado Pago</span>
      </div>
    </div>
  );
};
