import { MercadoPagoConfig, Preference } from 'mercadopago';
import { validateAndPriceItems } from './_catalog';

export default async (req: Request) => {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  
  // Headers de seguridad CORS restrictivos
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
    // SEGURIDAD: El Access Token se obtiene EXCLUSIVAMENTE del entorno seguro del servidor
    const accessToken = (process.env.MP_ACCESS_TOKEN || '').trim();
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Configuración incompleta en el servidor: MP_ACCESS_TOKEN no está definido en las variables de entorno de Netlify.'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { items: rawItems, payer, originUrl } = body || {};

    // SEGURIDAD: Validación estricta y asignación inmutable de precios oficiales del servidor
    // Mitiga Price Tampering / Manipulación de Precios
    let validatedData;
    try {
      validatedData = validateAndPriceItems(rawItems);
    } catch (valErr: any) {
      return new Response(
        JSON.stringify({ error: valErr.message || 'Datos de productos inválidos.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { items: validatedItems } = validatedData;

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 }
    });

    const preference = new Preference(client);

    // Determinar la URL base de retorno
    let cleanOrigin = 'http://localhost:5173';
    if (originUrl) {
      try {
        cleanOrigin = new URL(originUrl).origin;
      } catch {}
    } else if (origin) {
      try {
        cleanOrigin = new URL(origin).origin;
      } catch {}
    }

    const preferenceItems = validatedItems.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price, // Precio fijado por el catálogo del servidor
      currency_id: 'ARS',
      description: `Kokedama artesanal ${item.title} - Koke Color José C. Paz`
    }));

    const preferenceResponse = await preference.create({
      body: {
        items: preferenceItems,
        payer: payer
          ? {
              name: typeof payer.name === 'string' ? payer.name.slice(0, 100) : undefined,
              email: typeof payer.email === 'string' ? payer.email.slice(0, 100) : undefined,
              phone: payer.phone ? { number: String(payer.phone).slice(0, 20) } : undefined
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
          installments: 12
        },
        metadata: {
          origin: 'koke_color_checkout_pro',
          total_items: validatedItems.length
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
    console.error('Error al generar preferencia en Mercado Pago:', err);
    return new Response(
      JSON.stringify({
        error: err?.message || 'Error interno al comunicarse con Mercado Pago.'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
