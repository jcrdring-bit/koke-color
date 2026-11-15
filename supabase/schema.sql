-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE - KOKE COLOR
-- ============================================================

-- 1. Tabla de Plantas / Kokedamas (Inventario)
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scientific_name TEXT,
    origin TEXT,
    light TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    categories TEXT[] DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    watering_guide TEXT,
    light_guide TEXT,
    care_tips TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Clientes / Prospectos (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    whatsapp_channel TEXT DEFAULT 'linea_1',
    notes TEXT,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Conversaciones del Chatbot
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    last_message_at TIMESTAMPTZ DEFAULT now(),
    derived_to_whatsapp BOOLEAN DEFAULT false,
    whatsapp_line TEXT,
    selected_plants JSONB DEFAULT '[]'
);

-- 4. Tabla de Mensajes (Historial detallado)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Configuración General
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Valores iniciales de configuración
INSERT INTO public.settings (key, value) VALUES 
('store_info', '{"name": "Koke Color", "city": "José C. Paz, Buenos Aires", "alias_mp": "gringo.peque.mp", "whatsapp_1": "5491162362532", "whatsapp_2": "5491121848294"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo
CREATE POLICY "Catálogo visible para todos" ON public.plants
    FOR SELECT USING (true);

-- Políticas para insertar mensajes desde la web
CREATE POLICY "Permitir crear conversaciones" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir guardar mensajes" ON public.messages
    FOR INSERT WITH CHECK (true);
