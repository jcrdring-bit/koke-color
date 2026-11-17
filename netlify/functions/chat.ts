// Netlify Serverless Function para proxy seguro de DeepSeek con limitador de tasa (Rate Limiting)
// Previene el agotamiento de cuota por bots y oculta la API Key del cliente

const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 20; // Máximo 20 consultas por minuto por IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Ventana de 1 minuto

export default async (req: Request) => {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Control de Tasa (Rate Limiting) por IP
  const clientIp = req.headers.get('x-nf-client-connection-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   'unknown';

  const now = Date.now();
  const rateData = ipRateLimits.get(clientIp);

  if (rateData) {
    if (now > rateData.resetAt) {
      ipRateLimits.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      rateData.count++;
      if (rateData.count > RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({
            error: 'Límite de consultas excedido. Por favor espera un momento antes de enviar otro mensaje.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          }
        );
      }
    }
  } else {
    ipRateLimits.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  try {
    const body = await req.json();
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Formato de mensajes inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limitar longitud del historial para evitar ataques de consumo de tokens excesivos
    const sanitizedMessages = messages.slice(-10);

    // La API Key se lee exclusivamente en el entorno del servidor
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey || apiKey.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'API Key de DeepSeek no configurada en el servidor' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: sanitizedMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await dsResponse.json();

    return new Response(JSON.stringify(data), {
      status: dsResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno del servidor proxy' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
