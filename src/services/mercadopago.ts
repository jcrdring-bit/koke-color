export interface CardPaymentPayload {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  description?: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PaymentProcessResult {
  success: boolean;
  id?: number | string;
  status?: string;
  status_detail?: string;
  message?: string;
  error?: string;
}

export const mercadopagoService = {
  copyAlias(alias: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(alias).then(() => true).catch(() => false);
    }
    return Promise.resolve(false);
  },

  getInstructions(alias: string, total: number) {
    return {
      title: 'Transferencia con Mercado Pago',
      alias,
      totalFormatted: `$ ${total.toLocaleString('es-AR')}`,
      steps: [
        `1. Abre tu app de Mercado Pago o Home Banking.`,
        `2. Selecciona "Transferir dinero" o "Con Alias/CVU".`,
        `3. Pega el Alias: ${alias}`,
        `4. Ingresa el monto exacto: $ ${total.toLocaleString('es-AR')}`,
        `5. Guarda el comprobante y presiona el botón para enviarlo por WhatsApp.`
      ]
    };
  },

  /**
   * Envía los datos tokenizados de la tarjeta al backend serverless
   */
  async processCardPayment(payload: CardPaymentPayload): Promise<PaymentProcessResult> {
    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Error de conexión al procesar el pago con tarjeta.'
        };
      }

      if (data.status === 'approved') {
        return {
          success: true,
          id: data.id,
          status: data.status,
          status_detail: data.status_detail,
          message: data.message || '¡Pago aprobado con éxito!'
        };
      } else if (data.status === 'in_process') {
        return {
          success: true,
          id: data.id,
          status: data.status,
          status_detail: data.status_detail,
          message: data.message || 'Tu pago está siendo procesado.'
        };
      } else {
        return {
          success: false,
          id: data.id,
          status: data.status,
          status_detail: data.status_detail,
          error: data.message || 'El pago no fue aprobado por el emisor.'
        };
      }
    } catch (err: any) {
      console.error('Error al llamar al endpoint de pago:', err);
      return {
        success: false,
        error: err?.message || 'Error de red al conectar con el servidor.'
      };
    }
  }
};
