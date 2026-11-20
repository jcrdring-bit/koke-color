import { MercadoPagoConfig, Payment } from 'mercadopago';
import { validateAndPriceItems } from './_catalog';

// Mapeo amigable de respuestas de error de Mercado Pago para tarjetas
const STATUS_DETAIL_MESSAGES: Record<string, string> = {
  accredited: '¡Pago acreditado exitosamente!',
  pending_contingency: 'El pago está en proceso de revisión. Te avisaremos cuando se confirme.',
  pending_review_manual: 'El pago está en revisión por seguridad. Te avisaremos cuando se acredite.',
  cc_rejected_bad_filled_card_number: 'Revisa el número de la tarjeta.',
  cc_rejected_bad_filled_date: 'Revisa la fecha de vencimiento.',
  cc_rejected_bad_filled_security_code: 'Revisa el código de seguridad (CVV).',
  cc_rejected_bad_filled_other: 'Revisa los datos de la tarjeta.',
  cc_rejected_insufficient_amount: 'Fondos o límite insuficiente en la tarjeta.',
  cc_rejected_call_for_authorize: 'Debes autorizar el pago comunicándote con tu banco emisor.',
  cc_rejected_card_disabled: 'Tu tarjeta se encuentra inhabilitada. Comunícate con tu banco.',
  cc_rejected_duplicated_payment: 'Ya hiciste un pago con estos mismos datos. Espera unos minutos.',
  cc_rejected_high_risk: 'El pago fue rechazado por motivos de seguridad de Mercado Pago.',
  cc_rejected_max_attempts: 'Superaste el límite de intentos permitidos. Intenta con otra tarjeta.'
};

export default async (req: Request) => {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  
  const corsHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };

  if (origin) {
    try {
      const parsedUrl = new URL(origin);
      corsHeaders['Access-Control-Allow-Origin'] = parsedUrl.origin;
    } catch {
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Utiliza POST.' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Credenciales incompletas: MP_ACCESS_TOKEN no está configurado en las variables de entorno de Netlify / servidor.'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Cuerpo de solicitud inválido.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token || token.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Token de pago de tarjeta inválido o ausente.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // SEGURIDAD: Validación estricta del monto recalculando los productos en el servidor
    let finalAmount = 0;
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      try {
        const validated = validateAndPriceItems(body.items);
        finalAmount = validated.totalAmount;
      } catch (valErr: any) {
        return new Response(
          JSON.stringify({ error: `Validación de compra fallida: ${valErr.message}` }),
          { status: 400, headers: corsHeaders }
        );
      }
    } else {
      // Fallback si no vinieron items: validar el monto recibido contra límites estrictos
      const clientAmount = Number(body.transaction_amount);
      if (isNaN(clientAmount) || clientAmount < 1000 || clientAmount > 2000000) {
        return new Response(
          JSON.stringify({ error: 'Monto de transacción inválido o fuera del rango permitido.' }),
          { status: 400, headers: corsHeaders }
        );
      }
      finalAmount = clientAmount;
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 }
    });

    const payment = new Payment(client);

    const safeDescription = typeof body.description === 'string'
      ? body.description.slice(0, 200)
      : 'Compra en Koke Color';

    const paymentResponse = await payment.create({
      body: {
        token,
        issuer_id: body.issuer_id ? String(body.issuer_id) : undefined,
        payment_method_id: body.payment_method_id,
        transaction_amount: finalAmount, // Monto verificado por el servidor
        installments: Number(body.installments || 1),
        description: safeDescription,
        payer: {
          email: typeof body.payer?.email === 'string' ? body.payer.email.slice(0, 100) : 'cliente@koke-color.com',
          identification: body.payer?.identification ? {
            type: String(body.payer.identification.type || 'DNI').slice(0, 10),
            number: String(body.payer.identification.number || '').slice(0, 20)
          } : undefined
        },
        metadata: {
          origin: 'koke_color_card_bricks',
          verified_amount: finalAmount
        }
      }
    });

    const status = paymentResponse.status || 'unknown';
    const statusDetail = paymentResponse.status_detail || '';
    const friendlyMessage = STATUS_DETAIL_MESSAGES[statusDetail] || paymentResponse.message || 'Pago procesado.';

    return new Response(
      JSON.stringify({
        id: paymentResponse.id,
        status,
        status_detail: statusDetail,
        message: friendlyMessage,
        payment_method_id: paymentResponse.payment_method_id,
        transaction_amount: paymentResponse.transaction_amount
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Error al procesar el pago con tarjeta:', err);

    const errorMessage =
      err?.cause?.[0]?.description ||
      err?.message ||
      'No se pudo completar el procesamiento del pago.';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: corsHeaders }
    );
  }
};
