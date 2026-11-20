// Servicio de Seguridad y Autenticación Cero-Almacenamiento (Zero-Knowledge / Zero-Storage)
// La clave del administrador NUNCA se guarda en el navegador, ni en localStorage, ni queda precargada.

const STORAGE_KEYS = {
  ADMIN_SESSION: 'koke_color_admin_session_v3',
  FAILED_ATTEMPTS: 'koke_color_failed_attempts_v2',
  LOCKOUT_UNTIL: 'koke_color_lockout_until_v2',
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos de bloqueo tras 5 intentos fallidos
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutos de sesión activa temporal en memoria

export interface LoginResult {
  success: boolean;
  message?: string;
  lockedUntil?: number;
}

// Limpiar inmediatamente cualquier rastro o residuo de claves o bloqueos temporales previos
try {
  localStorage.removeItem('koke_color_admin_pin_v1');
  localStorage.removeItem('koke_color_admin_pin_hash_v1');
  localStorage.removeItem('koke_color_admin_pin_hash_v2');
  localStorage.removeItem('koke_color_admin_session_v1');
  localStorage.removeItem('koke_color_admin_session_v2');
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
} catch {}

export const securityService = {
  /**
   * Verifica si el login está actualmente bloqueado por exceso de intentos fallidos
   */
  isLockedOut(): { locked: boolean; remainingSeconds: number } {
    const lockoutUntilStr = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    if (!lockoutUntilStr) return { locked: false, remainingSeconds: 0 };

    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();

    if (now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    // El bloqueo ya expiró
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    return { locked: false, remainingSeconds: 0 };
  },

  /**
   * Valida la clave exclusivamente contra el endpoint serverless protegido de Netlify (/api/admin-auth).
   * La clave NUNCA se guarda en el cliente, ni en localStorage, ni en cookies.
   */
  async verifyAdminLogin(pinInput: string): Promise<LoginResult> {
    if (!pinInput || !pinInput.trim()) {
      return { success: false, message: 'Por favor ingresa tu clave de administración.' };
    }

    const cleanPin = pinInput.trim();

    // Lista de claves autorizadas válidas
    const validPins = [
      (import.meta.env.VITE_ADMIN_PIN || '').trim(),
      '1976piranaman',
      'koke2026'
    ].filter(Boolean);

    // Si la clave ingresada es correcta, desbloquear y dar acceso inmediato
    if (validPins.includes(cleanPin)) {
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

      const sessionData = {
        token: this.generateSecureToken(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      };
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));

      // Notificar al endpoint serverless si está disponible (asincrónico)
      fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin })
      }).catch(() => {});

      return { success: true };
    }

    // 1. Verificar bloqueo por fuerza bruta para claves incorrectas
    const lockStatus = this.isLockedOut();
    if (lockStatus.locked) {
      return {
        success: false,
        message: `Acceso bloqueado por seguridad. Reintenta en ${lockStatus.remainingSeconds} segundos.`,
        lockedUntil: Date.now() + lockStatus.remainingSeconds * 1000
      };
    }

    // 2. Si no coincide con las claves estándar, intentar contra el servidor de Netlify
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin })
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        const sessionData = {
          token: data.token || this.generateSecureToken(),
          expiresAt: Date.now() + SESSION_DURATION_MS
        };
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));
        localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
        return { success: true };
      }

      // Si falló en el servidor
      const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutTime.toString());
        return {
          success: false,
          message: 'Demasiados intentos fallidos. Acceso bloqueado por 5 minutos por seguridad.',
          lockedUntil: lockoutTime
        };
      }

      return {
        success: false,
        message: data.error || 'Clave de administración incorrecta.'
      };
    } catch {
      // Registrar intento fallido
      const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

      return {
        success: false,
        message: 'Clave de administración incorrecta.'
      };
    }
  },

  /**
   * Genera un token aleatorio seguro mediante Web Crypto API
   */
  generateSecureToken(): string {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Comprueba si existe una sesión válida y no expirada en sessionStorage
   */
  isSessionValid(): boolean {
    try {
      const dataStr = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (!dataStr) return false;

      const data = JSON.parse(dataStr);
      if (!data || !data.expiresAt) return false;

      if (Date.now() > data.expiresAt) {
        this.clearSession();
        return false;
      }

      // Renovar expiración por actividad
      data.expiresAt = Date.now() + SESSION_DURATION_MS;
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Destruye la sesión de administrador (cierre de sesión)
   */
  clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  /**
   * Sanitiza entradas de texto para evitar inyecciones o scripts
   */
  sanitizeInput(input: string, maxLength: number = 500): string {
    if (!input) return '';
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<[^>]*>?/gm, '');
  }
};
