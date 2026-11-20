import { Plant, CustomerLead, ConversationLog, StoreSettings } from '../types';
import { INITIAL_PLANTS } from '../data/plants';
import { securityService, LoginResult } from './security';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  PLANTS: 'koke_color_plants_v4',
  SETTINGS: 'koke_color_settings_v1',
  CONVERSATIONS: 'koke_color_conversations_v1',
  LEADS: 'koke_color_leads_v1',
};

export const defaultSettings: StoreSettings = {
  storeName: import.meta.env.VITE_STORE_NAME || 'Koke Color',
  city: import.meta.env.VITE_STORE_CITY || 'José C. Paz, Buenos Aires',
  whatsappLine1: import.meta.env.VITE_WHATSAPP_LINE_1 || '5491162362532',
  whatsappLine2: import.meta.env.VITE_WHATSAPP_LINE_2 || '5491176092591',
  mercadopagoAlias: import.meta.env.VITE_MERCADOPAGO_ALIAS || 'gringo.peque.mp',
  mercadopagoCvu: import.meta.env.VITE_MERCADOPAGO_CVU || '0000003100040664164018',
  mercadopagoQrUrl: import.meta.env.VITE_MERCADOPAGO_QR_URL || '',
  mercadopagoPublicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || import.meta.env.VITE_MP_PUBLIC_KEY || '',
  mercadopagoAccessToken: '', // Protegido exclusivamente en el servidor (Netlify MP_ACCESS_TOKEN)
  mercadopagoPaymentLink: '',
  deepseekApiKey: '', // Protegida exclusivamente en el servidor (Netlify /api/chat)
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const dbService = {
  // === PLANTAS / CATÁLOGO ===
  getPlants(): Plant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANTS);
      if (data) {
        const parsed: Plant[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Asegurar que si falta la Espada de San Jorge se incorpore automáticamente
          if (!parsed.some(p => p.id === 'espada-de-san-jorge')) {
            const sanJorge = INITIAL_PLANTS.find(p => p.id === 'espada-de-san-jorge');
            if (sanJorge) {
              parsed.push(sanJorge);
              localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(parsed));
            }
          }

          // Asegurar que Kalanchoe y Begonia tengan las variantes de color actualizadas
          const kalanchoeIdx = parsed.findIndex(p => p.id === 'kalanchoe');
          const initialKalanchoe = INITIAL_PLANTS.find(p => p.id === 'kalanchoe');
          if (kalanchoeIdx >= 0 && initialKalanchoe) {
            parsed[kalanchoeIdx].colorVariants = initialKalanchoe.colorVariants;
            parsed[kalanchoeIdx].imageUrl = initialKalanchoe.imageUrl;
          }

          const begoniaIdx = parsed.findIndex(p => p.id === 'begonia');
          const initialBegonia = INITIAL_PLANTS.find(p => p.id === 'begonia');
          if (begoniaIdx >= 0 && initialBegonia) {
            parsed[begoniaIdx].colorVariants = initialBegonia.colorVariants;
            parsed[begoniaIdx].imageUrl = initialBegonia.imageUrl;
          }
          localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading plants from storage', e);
    }
    // Inicializar con el catálogo completo de muestra
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

  // === CONEXIÓN SUPABASE EN LA NUBE ===
  getSupabaseClient() {
    const settings = this.getSettings();
    const url = settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const key = settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key && url.startsWith('https://') && key.length > 20) {
      return createClient(url, key);
    }
    return null;
  },

  async syncPlantsFromSupabase(): Promise<Plant[] | null> {
    const client = this.getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.from('plants').select('*');
      if (!error && data && data.length > 0) {
        const mapped: Plant[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          scientificName: d.scientific_name,
          origin: d.origin,
          light: d.light,
          price: Number(d.price),
          categories: d.categories || [],
          inStock: d.in_stock,
          imageUrl: d.image_url,
          description: d.description,
          wateringGuide: d.watering_guide,
          lightGuide: d.light_guide,
          careTips: d.care_tips || [],
          colorVariants: d.color_variants || undefined
        }));
        this.savePlants(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Error al sincronizar plantas desde Supabase:', e);
    }
    return null;
  },

  // === AJUSTES DE COMERCIO ===
  getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.mercadopagoAccessToken) {
          delete parsed.mercadopagoAccessToken;
        }
        if (parsed.whatsappLine2 === '5491121848294' || parsed.whatsappLine2 === '1121848294') {
          parsed.whatsappLine2 = defaultSettings.whatsappLine2;
          this.saveSettings({ ...defaultSettings, ...parsed });
        }
        return { ...defaultSettings, ...parsed, mercadopagoAccessToken: '' };
      }
    } catch (e) {
      console.error('Error reading settings', e);
    }
    return defaultSettings;
  },

  saveSettings(settings: StoreSettings): void {
    const safeSettings: Partial<StoreSettings> = { ...settings };
    // Asegurar que claves privadas nunca se persistan en localStorage
    delete safeSettings.mercadopagoAccessToken;
    delete safeSettings.deepseekApiKey;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(safeSettings));
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

    // Sincronización en la nube con Supabase
    const client = this.getSupabaseClient();
    if (client) {
      Promise.resolve(
        client.from('conversations').insert({
          session_id: conv.sessionId,
          started_at: conv.startedAt,
          last_message_at: conv.lastMessageAt,
          derived_to_whatsapp: conv.derivedToWhatsapp,
          whatsapp_line: conv.whatsappLine
        })
      ).catch(() => {});
    }
  },

  getLeads(): CustomerLead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  registerLead(
    name: string,
    phone: string | undefined,
    whatsappLine: string,
    selectedPlants: string[] = [],
    email?: string,
    acceptsOffers?: boolean,
    notes?: string
  ): CustomerLead {
    const leads = this.getLeads();
    const existing = leads.find(l => (phone && l.phone === phone) || (email && l.email === email) || l.name.toLowerCase() === name.toLowerCase());
    const now = new Date().toISOString();

    let lead: CustomerLead;
    if (existing) {
      lead = {
        ...existing,
        name: name || existing.name,
        phone: phone || existing.phone,
        email: email || existing.email,
        acceptsOffers: acceptsOffers !== undefined ? acceptsOffers : existing.acceptsOffers,
        lastContact: now,
        queriesCount: (existing.queriesCount || 1) + 1,
        derivedToWhatsapp: true,
        whatsappLine,
        selectedPlants: Array.from(new Set([...existing.selectedPlants, ...selectedPlants])),
        notes: notes ? (existing.notes ? `${existing.notes} | ${notes}` : notes) : existing.notes
      };
      const updated = leads.map(l => l.id === existing.id ? lead : l);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    } else {
      lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        phone,
        email,
        acceptsOffers: Boolean(acceptsOffers),
        firstContact: now,
        lastContact: now,
        queriesCount: 1,
        derivedToWhatsapp: true,
        whatsappLine,
        selectedPlants,
        notes
      };
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify([lead, ...leads]));
    }

    // Sincronización en la nube con Supabase
    const client = this.getSupabaseClient();
    if (client) {
      Promise.resolve(
        client.from('customers').insert({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          accepts_offers: Boolean(lead.acceptsOffers),
          whatsapp_channel: lead.whatsappLine,
          notes: `${lead.notes || ''} [Email: ${lead.email || 'N/A'}] (Plantas: ${lead.selectedPlants.join(', ')}) [Ofertas: ${lead.acceptsOffers ? 'SÍ' : 'NO'}]`.trim()
        })
      ).catch(() => {});
    }

    return lead;
  },

  // === SEGURIDAD Y AUTENTICACIÓN CRIPTOGRÁFICA ===
  isAdminLoggedIn(): boolean {
    return securityService.isSessionValid();
  },

  async adminLogin(pinOrPass: string): Promise<LoginResult> {
    return await securityService.verifyAdminLogin(pinOrPass);
  },

  adminLogout(): void {
    securityService.clearSession();
  }
};
