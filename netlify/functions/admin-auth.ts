// Netlify Serverless Function para Autenticación Segura de Administrador
// Protege el PIN en el servidor, previene ataques de temporización y mitigación de fuerza bruta

import crypto from 'crypto';

// Registro en memoria de intentos fallidos por IP (mitigación de fuerza bruta)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutos de bloqueo

function timingSafeCompare(input: string, secret: string): boolean {
  const hashA = crypto.createHash('sha256').update(input).digest();
  const hashB = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Obtener IP del cliente desde los headers de Netlify
  const clientIp = req.headers.get('x-nf-client-connection-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   'unknown';

  const now = Date.now();
  const attemptRecord = failedAttempts.get(clientIp);

  // 1. Verificar si la IP está bloqueada por exceso de intentos
  if (attemptRecord && attemptRecord.lockedUntil > now) {
    const remainingSecs = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Demasiados intentos fallidos. Acceso bloqueado temporalmente por ${remainingSecs} segundos.`
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { pin } = body || {};

    if (!pin || typeof pin !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Debe ingresar una clave o PIN válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Claves válidas autorizadas
    const validPins = [
      process.env.ADMIN_PIN?.trim(),
      process.env.VITE_ADMIN_PIN?.trim(),
      '1976piranaman',
      'koke2026'
    ].filter(Boolean) as string[];

    // Comparación resistente a ataques de temporización (timing attack resistant)
    const isMatch = validPins.some(validPin => timingSafeCompare(pin.trim(), validPin));

    if (isMatch) {
      // Éxito: limpiar historial de fallos
      failedAttempts.delete(clientIp);

      // Generar token de sesión criptográficamente seguro
      const secureRandomBytes = crypto.randomBytes(24).toString('hex');
      const sessionToken = `koke_adm_${Date.now()}_${secureRandomBytes}`;

      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          message: 'Autenticación exitosa',
          expiresIn: 1800 // 30 minutos
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // Fallo de autenticación: registrar intento
    const currentFailures = (attemptRecord?.count || 0) + 1;
    if (currentFailures >= MAX_ATTEMPTS) {
      failedAttempts.set(clientIp, {
        count: currentFailures,
        lockedUntil: now + LOCKOUT_TIME_MS
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Límite de intentos alcanzado. Acceso bloqueado por 5 minutos por seguridad.'
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    failedAttempts.set(clientIp, {
      count: currentFailures,
      lockedUntil: 0
    });

    const attemptsLeft = MAX_ATTEMPTS - currentFailures;

    return new Response(
      JSON.stringify({
        success: false,
        error: `Clave o PIN incorrecto. Intentos restantes: ${attemptsLeft}`
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Error al procesar la solicitud de autenticación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
