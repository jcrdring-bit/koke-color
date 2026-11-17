-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE - KOKE COLOR
-- Seguridad Reforzada con Políticas RLS (Row Level Security)
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

-- ============================================================
-- POLÍTICAS DE SEGURIDAD ESTRICTAS (ROW LEVEL SECURITY - RLS)
-- Protegen contra robo de datos de clientes, alteración de precios e inyección de datos
-- ============================================================

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas para evitar duplicados
DROP POLICY IF EXISTS "Catálogo visible para todos" ON public.plants;
DROP POLICY IF EXISTS "Modificación de catálogo solo administradores" ON public.plants;
DROP POLICY IF EXISTS "Registrar prospectos de clientes" ON public.customers;
DROP POLICY IF EXISTS "Lectura de clientes solo administradores" ON public.customers;
DROP POLICY IF EXISTS "Permitir crear conversaciones" ON public.conversations;
DROP POLICY IF EXISTS "Lectura de conversaciones solo administradores" ON public.conversations;
DROP POLICY IF EXISTS "Permitir guardar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Lectura de mensajes solo administradores" ON public.messages;
DROP POLICY IF EXISTS "Configuración pública visible" ON public.settings;
DROP POLICY IF EXISTS "Modificar configuración solo administradores" ON public.settings;

-- A. TABLA PLANTAS: Lectura para todos, modificación solo administradores autenticados
CREATE POLICY "Catálogo visible para todos" ON public.plants
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Modificación de catálogo solo administradores" ON public.plants
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B. TABLA CLIENTES: Cualquiera puede registrarse (INSERT), pero NADIE con clave pública anon puede leer (SELECT)
CREATE POLICY "Registrar prospectos de clientes" ON public.customers
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Lectura de clientes solo administradores" ON public.customers
    FOR SELECT TO authenticated USING (true);

-- C. TABLA CONVERSACIONES: Inserción pública permitida, lectura reservada para administradores
CREATE POLICY "Permitir crear conversaciones" ON public.conversations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Lectura de conversaciones solo administradores" ON public.conversations
    FOR SELECT TO authenticated USING (true);

-- D. TABLA MENSAJES: Inserción pública permitida, lectura reservada para administradores
CREATE POLICY "Permitir guardar mensajes" ON public.messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Lectura de mensajes solo administradores" ON public.messages
    FOR SELECT TO authenticated USING (true);

-- E. TABLA CONFIGURACIÓN: Lectura de datos de tienda para todos, edición solo administradores
CREATE POLICY "Configuración pública visible" ON public.settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Modificar configuración solo administradores" ON public.settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
