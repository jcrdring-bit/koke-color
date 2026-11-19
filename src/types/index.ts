export interface PlantColorVariant {
  name: string;
  imageUrl: string;
  hex: string;
}

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  origin: string;
  light: string;
  price: number;
  categories: ('Todas' | 'Florales' | 'Colgantes' | 'Sombra' | 'Color')[];
  inStock: boolean;
  imageUrl: string;
  description: string;
  wateringGuide: string;
  lightGuide: string;
  careTips: string[];
  colorVariants?: PlantColorVariant[];
}

export interface CartItem {
  plant: Plant;
  quantity: number;
  selectedColor?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  action?: {
    type: 'whatsapp' | 'view_care' | 'view_catalog';
    payload?: any;
    label: string;
  };
}

export interface CustomerLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  acceptsOffers?: boolean;
  firstContact: string;
  lastContact: string;
  queriesCount: number;
  derivedToWhatsapp: boolean;
  whatsappLine?: string;
  selectedPlants: string[];
  notes?: string;
}

export interface ConversationLog {
  id: string;
  sessionId: string;
  customerName?: string;
  startedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  derivedToWhatsapp: boolean;
  whatsappLine?: string;
}

export interface StoreSettings {
  storeName: string;
  city: string;
  whatsappLine1: string;
  whatsappLine2: string;
  mercadopagoAlias: string;
  mercadopagoCvu?: string;
  mercadopagoQrUrl?: string;
  mercadopagoPublicKey?: string;
  mercadopagoAccessToken?: string;
  mercadopagoPaymentLink?: string;
  deepseekApiKey: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
