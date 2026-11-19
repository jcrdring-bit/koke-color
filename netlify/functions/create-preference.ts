import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async (req: Request) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

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
    const body = await req.json();
    const { items, payer, originUrl, accessToken: clientToken } = body || {};

    const accessToken = (process.env.MP_ACCESS_TOKEN || clientToken || '').trim();
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Falta configurar tu Access Token de Mercado Pago (puedes pegarlo en el Panel de Administrador > Ajustes o en Netlify como MP_ACCESS_TOKEN).'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'La lista de productos está vacía.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 }
    });

    const preference = new Preference(client);

    // Determinar la URL base de retorno (del request origin o fallback)
    const requestOrigin =
      originUrl ||
      req.headers.get('origin') ||
      req.headers.get('referer') ||
      'http://localhost:5173';
    const cleanOrigin = requestOrigin.replace(/\/$/, '');

    const preferenceItems = items.map((item: any) => {
      const plant = item.plant || item;
      const colorText = item.selectedColor ? ` (Flor ${item.selectedColor})` : '';
      const unitPrice = Number(plant.price || item.unit_price || 0);

      return {
        id: String(plant.id || 'koke_item'),
        title: `${plant.name || 'Kokedama'}${colorText}`,
        quantity: Number(item.quantity || 1),
        unit_price: unitPrice,
        currency_id: 'ARS',
        description: `Kokedama artesanal ${plant.name}${colorText} - Koke Color José C. Paz`
      };
    });

    const preferenceResponse = await preference.create({
      body: {
        items: preferenceItems,
        payer: payer
          ? {
              name: payer.name,
              email: payer.email,
              phone: payer.phone ? { number: payer.phone } : undefined
            }
          : undefined,
        back_urls: {
          success: `${cleanOrigin}/?status=approved`,
          failure: `${cleanOrigin}/?status=failure`,
          pending: `${cleanOrigin}/?status=pending`
        },
        auto_return: 'approved',
        statement_descriptor: 'KOKE COLOR',
        payment_methods: {
          installments: 12 // Permitir hasta 12 cuotas con tarjeta
        },
        metadata: {
          origin: 'koke_color_checkout_pro'
        }
      }
    });

    return new Response(
      JSON.stringify({
        id: preferenceResponse.id,
        init_point: preferenceResponse.init_point,
        sandbox_init_point: preferenceResponse.sandbox_init_point
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Error creando preferencia en Mercado Pago Checkout Pro:', err);
    return new Response(
      JSON.stringify({
        error: err?.message || 'Error al generar la preferencia de pago en Mercado Pago.'
      }),
      { status: 400, headers: corsHeaders }
    );
  }
};
