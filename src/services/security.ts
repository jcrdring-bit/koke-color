// Servicio de Seguridad Criptográfica y Protección contra ataques de fuerza bruta

const STORAGE_KEYS = {
  ADMIN_PIN_HASH: 'koke_color_admin_pin_hash_v2',
  ADMIN_SESSION: 'koke_color_admin_session_v2',
  FAILED_ATTEMPTS: 'koke_color_failed_attempts_v1',
  LOCKOUT_UNTIL: 'koke_color_lockout_until_v1',
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutos de bloqueo tras 5 fallos
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutos de sesión activa

export interface LoginResult {
  success: boolean;
  message?: string;
  lockedUntil?: number;
}

export const securityService = {
  /**
   * Genera un hash criptográfico SHA-256 del texto ingresado
   */
  async hashString(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Inicializa el hash del PIN configurado en el almacenamiento seguro
   */
  async initializePinHash(configuredPin: string): Promise<void> {
    const existingHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH);
    if (!existingHash && configuredPin) {
      const hash = await this.hashString(configuredPin.trim());
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, hash);
    }
  },

  /**
   * Cambia el PIN almacenando exclusivamente su hash SHA-256
   */
  async updatePin(newPin: string): Promise<void> {
    if (!newPin || newPin.trim().length < 4) {
      throw new Error('El PIN debe tener al menos 4 caracteres');
    }
    const hash = await this.hashString(newPin.trim());
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, hash);
  },

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
   * Valida el PIN contra el hash SHA-256 con protección de fuerza bruta
   */
  async verifyAdminLogin(pinInput: string, fallbackConfiguredPin: string): Promise<LoginResult> {
    // 1. Verificar bloqueo por fuerza bruta
    const lockStatus = this.isLockedOut();
    if (lockStatus.locked) {
      return {
        success: false,
        message: `Acceso bloqueado por seguridad. Reintenta en ${lockStatus.remainingSeconds} segundos.`,
        lockedUntil: Date.now() + lockStatus.remainingSeconds * 1000
      };
    }

    if (!pinInput || !pinInput.trim()) {
      return { success: false, message: 'Por favor ingresa tu clave o PIN.' };
    }

    // 2. Obtener el hash esperado
    let expectedHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH);
    if (!expectedHash) {
      // Si aún no se inicializó, hashear el PIN configurado
      expectedHash = await this.hashString((fallbackConfiguredPin || 'koke2026').trim());
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, expectedHash);
    }

    // 3. Hashear el PIN ingresado por el usuario
    const inputHash = await this.hashString(pinInput.trim());

    if (inputHash === expectedHash) {
      // Éxito: Limpiar intentos fallidos y crear sesión con token criptográfico y expiración
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

      const sessionToken = this.generateSecureToken();
      const sessionData = {
        token: sessionToken,
        expiresAt: Date.now() + SESSION_DURATION_MS
      };
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));

      return { success: true };
    }

    // 4. Fallo: Registrar intento fallido
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutTime.toString());
      return {
        success: false,
        message: 'Demasiados intentos fallidos. Acceso bloqueado por 3 minutos.',
        lockedUntil: lockoutTime
      };
    }

    const remaining = MAX_FAILED_ATTEMPTS - attempts;
    return {
      success: false,
      message: `PIN incorrecto. Te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'}.`
    };
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
   * Comprueba si existe una sesión válida y no expirada
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

      // Deslizar expiración por actividad (30 minutos más)
      data.expiresAt = Date.now() + SESSION_DURATION_MS;
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Destruye la sesión de administrador
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
      .replace(/<[^>]*>?/gm, ''); // Elimina tags HTML
  }
};
