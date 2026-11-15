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
  }
};
