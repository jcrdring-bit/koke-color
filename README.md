# 🌿 KOKE COLOR - Naturaleza que flota (José C. Paz)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jcrdring-bit/koke-color)

Aplicación web y de escritorio para el catálogo artesanal de kokedamas vivas, con chatbot inteligente con IA (DeepSeek), pagos integrados con Mercado Pago, reproducción de música zen botánica y panel CRM de administración.

---

## 🚀 Inicio Rápido en tu PC (Local)

1. **Abrir la terminal en la carpeta del proyecto:**
   ```bash
   cd "C:\Users\jcrdr\.gemini\antigravity\scratch\koke-color"
   ```

2. **Instalar dependencias (solo la primera vez):**
   ```bash
   npm install
   ```

3. **Iniciar la aplicación en tu PC:**
   ```bash
   npm run dev
   ```
   Abre en tu navegador la dirección indicada (por defecto `http://localhost:5173`).

---

## 🔐 Configuración Segura de DeepSeek (Opción 1)

Tu clave de API se mantiene 100% privada en tu propia computadora:
1. Abre el archivo `.env.local` en esta carpeta con el Bloc de notas.
2. Agrega tu clave privada de DeepSeek:
   ```env
   VITE_DEEPSEEK_API_KEY=sk-tu_clave_real_aqui
   ```
3. Guarda el archivo. ¡Listo! KokeBot usará tu API Key de DeepSeek.
*(Si no tienes clave aún, KokeBot continuará funcionando con su motor botánico inteligente local sin fallar).*

---

## 💳 Pagos con Mercado Pago

- **Alias configurado:** `gringo.peque.mp`
- Al seleccionar una o varias kokedamas y hacer clic en **"Consultar selección"**, el cliente podrá:
  1. Presionar **"Pagar con Mercado Pago"** para ver el Alias con botón de copiado de un clic y monto exacto.
  2. Enviar el comprobante directo por WhatsApp para coordinar retiro o entrega en José C. Paz.

---

## 🔒 Panel de Administración y CRM

- **Acceso:** En la esquina superior derecha o en el pie de página, haz clic en **"Administrador"**.
- **Clave de acceso inicial:** `koke2026` o `admin`.
- **Cierre de sesión automático:** Por seguridad, en cuanto sales o cierras la ventana de la aplicación, la sesión de administrador se destruye de inmediato (`sessionStorage`).
- **Módulos incluidos:**
  - **Inventario:** Modificar precios al instante, pausar o activar stock y agregar nuevas plantas.
  - **CRM:** Historial de todas las conversaciones de clientes, consultas realizadas e intenciones de compra.
  - **Ajustes:** Cambiar números de WhatsApp (Línea 1 y Línea 2), Alias de Mercado Pago y clave de DeepSeek.

---

## ☁️ Migración a Supabase y Netlify

- **Base de datos Supabase:**
  El archivo `supabase/schema.sql` contiene todas las tablas listas (`plants`, `customers`, `conversations`, `messages`, `settings`) con sus políticas RLS. Solo debes crear un proyecto en Supabase y ejecutar el script en el *SQL Editor*.
- **Despliegue en Netlify:**
  El archivo `netlify.toml` ya está configurado con las reglas de redirección SPA. Puedes subir el proyecto directamente a Netlify con 1 clic.
