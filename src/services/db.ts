import { Plant, CustomerLead, ConversationLog, StoreSettings } from '../types';
import { INITIAL_PLANTS } from '../data/plants';
import { securityService, LoginResult } from './security';

const STORAGE_KEYS = {
  PLANTS: 'koke_color_plants_v2',
  SETTINGS: 'koke_color_settings_v1',
  CONVERSATIONS: 'koke_color_conversations_v1',
  LEADS: 'koke_color_leads_v1',
  ADMIN_SESSION: 'koke_color_admin_session_v1', // in sessionStorage
  ADMIN_PIN: 'koke_color_admin_pin_v1',
};

export const defaultSettings: StoreSettings = {
  storeName: import.meta.env.VITE_STORE_NAME || 'Koke Color',
  city: import.meta.env.VITE_STORE_CITY || 'José C. Paz, Buenos Aires',
  whatsappLine1: import.meta.env.VITE_WHATSAPP_LINE_1 || '5491162362532',
  whatsappLine2: import.meta.env.VITE_WHATSAPP_LINE_2 || '5491121848294',
  mercadopagoAlias: import.meta.env.VITE_MERCADOPAGO_ALIAS || 'gringo.peque.mp',
  mercadopagoCvu: import.meta.env.VITE_MERCADOPAGO_CVU || '0000003100040664164018',
  mercadopagoQrUrl: import.meta.env.VITE_MERCADOPAGO_QR_URL || '',
  deepseekApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
};

export const dbService = {
  // === PLANTAS / CATÁLOGO ===
  getPlants(): Plant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading plants from storage', e);
    }
    // Inicializar con las 15 plantas de muestra
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(INITIAL_PLANTS));
    return INITIAL_PLANTS;
  },

  savePlants(plants: Plant[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
  },

  updatePlantStock(id: string, inStock: boolean): Plant[] {
    const plants = this.getPlants();
    const updated = plants.map(p => p.id === id ? { ...p, inStock } : p);
    this.savePlants(updated);
    return updated;
  },

  savePlant(plant: Plant): Plant[] {
    const plants = this.getPlants();
    const index = plants.findIndex(p => p.id === plant.id);
    let updated: Plant[];
    if (index >= 0) {
      updated = [...plants];
      updated[index] = plant;
    } else {
      updated = [plant, ...plants];
    }
    this.savePlants(updated);
    return updated;
  },

  deletePlant(id: string): Plant[] {
    const plants = this.getPlants().filter(p => p.id !== id);
    this.savePlants(plants);
    return plants;
  },

  resetPlants(): Plant[] {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(INITIAL_PLANTS));
    return INITIAL_PLANTS;
  },

  // === AJUSTES DE COMERCIO ===
  getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...defaultSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading settings', e);
    }
    return defaultSettings;
  },

  saveSettings(settings: StoreSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // === CRM & CONVERSACIONES ===
  getConversations(): ConversationLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveConversation(conv: ConversationLog): void {
    const all = this.getConversations();
    const idx = all.findIndex(c => c.id === conv.id);
    let updated: ConversationLog[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = conv;
    } else {
      updated = [conv, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated.slice(0, 100)));
  },

  getLeads(): CustomerLead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  registerLead(name: string, phone: string | undefined, whatsappLine: string, selectedPlants: string[] = []): CustomerLead {
    const leads = this.getLeads();
    const existing = leads.find(l => (phone && l.phone === phone) || l.name.toLowerCase() === name.toLowerCase());
    const now = new Date().toISOString();

    let lead: CustomerLead;
    if (existing) {
      lead = {
        ...existing,
        lastContact: now,
        queriesCount: (existing.queriesCount || 1) + 1,
        derivedToWhatsapp: true,
        whatsappLine,
        selectedPlants: Array.from(new Set([...existing.selectedPlants, ...selectedPlants]))
      };
      const updated = leads.map(l => l.id === existing.id ? lead : l);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    } else {
      lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        phone,
        firstContact: now,
        lastContact: now,
        queriesCount: 1,
        derivedToWhatsapp: true,
        whatsappLine,
        selectedPlants
      };
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify([lead, ...leads]));
    }
    return lead;
  },

  // === SEGURIDAD Y AUTENTICACIÓN CRIPTOGRÁFICA ===
  isAdminLoggedIn(): boolean {
    return securityService.isSessionValid();
  },

  getAdminPin(): string {
    return import.meta.env.VITE_ADMIN_PIN || 'koke2026';
  },

  async setAdminPin(newPin: string): Promise<void> {
    await securityService.updatePin(newPin);
  },

  async adminLogin(pinOrPass: string): Promise<LoginResult> {
    const configuredPin = this.getAdminPin();
    return await securityService.verifyAdminLogin(pinOrPass, configuredPin);
  },

  adminLogout(): void {
    securityService.clearSession();
  }
};
