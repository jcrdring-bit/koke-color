// Netlify Serverless Function para proxy seguro de Antigravity (Google Gemini)
// con control de tasa (Rate Limiting) y protección de API Key en el servidor

import { GoogleGenAI } from '@google/genai';

const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 30; // Máximo 30 consultas por minuto por IP
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
    const { messages, systemInstruction } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Formato de mensajes inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // La API Key de Antigravity / Google Gemini se lee exclusivamente en el entorno del servidor
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.ANTIGRAVITY_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.DEEPSEEK_API_KEY;

    if (!apiKey || apiKey.trim().length < 5) {
      return new Response(
        JSON.stringify({
          error: 'API Key de Antigravity / Gemini no configurada en el servidor (GEMINI_API_KEY).'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // Extraer system prompt y formatear turnos de conversación
    let systemText = systemInstruction || '';
    const conversationTurns: { role: string; parts: { text: string }[] }[] = [];

    // Limitar longitud del historial para evitar consumo de tokens excesivo
    const sanitizedMessages = messages.slice(-10);

    for (const msg of sanitizedMessages) {
      if (msg.role === 'system') {
        systemText = (systemText ? systemText + '\n\n' : '') + msg.content;
      } else {
        conversationTurns.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Usar el modelo Gemini Flash de Antigravity
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: conversationTurns,
      config: {
        systemInstruction: systemText || undefined,
        temperature: 0.7,
        maxOutputTokens: 600
      }
    });

    const replyText = response.text || '';

    return new Response(
      JSON.stringify({
        provider: 'antigravity',
        model: modelName,
        choices: [
          {
            message: {
              role: 'assistant',
              content: replyText
            }
          }
        ],
        text: replyText
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (err: any) {
    console.error('Error en Antigravity / Gemini Chat Function:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Error al comunicarse con la IA de Antigravity' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
