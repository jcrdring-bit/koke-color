// Netlify Serverless Function para Meta Webhook (WhatsApp Cloud API / Messenger / Lead Ads)

export default async (req: Request) => {
  const url = new URL(req.url);

  // 1. Verificación inicial de Meta (GET Request con hub.challenge)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = process.env.META_VERIFY_TOKEN || 'koke_color_verify_token';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('Meta Webhook verificado exitosamente!');
      return new Response(challenge || '', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Si no coincide o falta el token
    return new Response('Verificación fallida: token no coincide', { status: 403 });
  }

  // 2. Recepción de eventos y mensajes en tiempo real (POST Request)
  if (req.method === 'POST') {
    try {
      const data = await req.json();
      console.log('Evento de Meta recibido:', JSON.stringify(data));

      // Aquí se procesan mensajes entrantes de WhatsApp o consultas
      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
};
