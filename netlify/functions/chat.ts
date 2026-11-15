// Netlify Serverless Function para proxy seguro de DeepSeek (evita exponer la API key al navegador del cliente)

export default async (req: Request) => {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Formato de mensajes inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
        messages,
        temperature: 0.7,
        max_tokens: 600
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
