import { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { LoginResult } from '../services/security';

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => dbService.isAdminLoggedIn());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    // Verificar periódicamente validez de sesión (expiración a 30 mins)
    const interval = setInterval(() => {
      const valid = dbService.isAdminLoggedIn();
      if (!valid && isAdmin) {
        setIsAdmin(false);
      }
    }, 60000);

    const handleClose = () => {
      dbService.adminLogout();
    };

    window.addEventListener('beforeunload', handleClose);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleClose);
    };
  }, [isAdmin]);

  const login = async (pin: string): Promise<LoginResult> => {
    const result = await dbService.adminLogin(pin);
    if (result.success) {
      setIsAdmin(true);
    }
    return result;
  };

  const logout = () => {
    dbService.adminLogout();
    setIsAdmin(false);
  };

  return {
    isAdmin,
    isAdminModalOpen,
    setIsAdminModalOpen,
    login,
    logout
  };
}
