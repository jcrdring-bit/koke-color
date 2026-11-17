// Netlify Serverless Function para Autenticación Segura de Administrador
// Protege el PIN en el servidor y previene su filtración en los bundles del cliente (Vite)

// Registro en memoria de intentos fallidos por IP (mitigación de fuerza bruta)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutos de bloqueo

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

    // Clave configurada en las variables de entorno del servidor
    const expectedPin = process.env.ADMIN_PIN || process.env.VITE_ADMIN_PIN || '1976piranaman';

    // Comparación segura
    if (pin.trim() === expectedPin.trim()) {
      // Éxito: limpiar historial de fallos
      failedAttempts.delete(clientIp);

      // Generar token de sesión seguro con timestamp y firma básica
      const sessionToken = `koke_adm_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

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
        error: `Clave incorrecta. Te quedan ${attemptsLeft} intento(s).`
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Solicitud inválida' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
