// Netlify Serverless Function para Meta Webhook (WhatsApp Cloud API / Messenger / Lead Ads)
// Incluye validación de token y verificación criptográfica estricta de firma HMAC-SHA256 (X-Hub-Signature-256)

import crypto from 'crypto';

/**
 * Verifica la firma criptográfica HMAC-SHA256 enviada por Meta
 */
function verifySignature(signatureHeader: string | null, rawBody: string, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  try {
    const signature = signatureHeader.substring(7);
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    // Comparación segura contra ataques de temporización (timing attacks)
    const sigBuffer = Buffer.from(signature, 'utf8');
    const expBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch (err) {
    console.error('Error al verificar firma de Meta:', err);
    return false;
  }
}

export default async (req: Request) => {
  const url = new URL(req.url);

  // 1. Verificación inicial de Meta (GET Request con hub.challenge)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = process.env.META_VERIFY_TOKEN;
    if (!expectedToken) {
      return new Response('META_VERIFY_TOKEN no configurado en el servidor', { status: 500 });
    }

    if (mode === 'subscribe' && token) {
      const tokenBuf = Buffer.from(token, 'utf8');
      const expectedBuf = Buffer.from(expectedToken, 'utf8');
      
      const isMatch = tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf);

      if (isMatch) {
        console.log('Meta Webhook verificado exitosamente!');
        return new Response(challenge || '', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    return new Response('Verificación fallida: token no autorizado', { status: 403 });
  }

  // 2. Recepción de eventos en tiempo real (POST Request)
  if (req.method === 'POST') {
    try {
      const rawBody = await req.text();
      const appSecret = process.env.META_APP_SECRET;

      // SEGURIDAD: Exigir obligatoriamente la clave secreta y la firma de Meta
      if (!appSecret) {
        console.error('META_APP_SECRET no está configurado en las variables de entorno.');
        return new Response('Configuración de servidor incompleta', { status: 500 });
      }

      const signature = req.headers.get('x-hub-signature-256');
      const isValid = verifySignature(signature, rawBody, appSecret);

      if (!isValid) {
        console.warn('Firma de Meta inválida o ausente en solicitud entrante.');
        return new Response('Firma no autorizada', { status: 401 });
      }

      const data = JSON.parse(rawBody);
      console.log('Evento genuino y verificado de Meta recibido:', JSON.stringify(data));

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
