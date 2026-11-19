import React, { useState, useEffect } from 'react';
import { useCatalog } from './hooks/useCatalog';
import { useCart } from './hooks/useCart';
import { useAudio } from './hooks/useAudio';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { dbService } from './services/db';
import { StoreSettings } from './types';
import { PaymentProcessResult } from './services/mercadopago';

// Components
import { Header } from './components/layout/Header';
import { HeroSection } from './components/layout/HeroSection';
import { CategoryFilters } from './components/catalog/CategoryFilters';
import { ProductCard } from './components/catalog/ProductCard';
import { CareModal } from './components/catalog/CareModal';
import { FloatingCartBar } from './components/cart/FloatingCartBar';
import { ConsultationDrawer } from './components/cart/ConsultationDrawer';
import { MercadoPagoModal } from './components/cart/MercadoPagoModal';
import { AmbientAudioPlayer } from './components/audio/AmbientAudioPlayer';
import { DeepSeekChatbot } from './components/chatbot/DeepSeekChatbot';
import { AdminModal } from './components/admin/AdminModal';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>(() => dbService.getSettings());
  const [initialPaymentSuccess, setInitialPaymentSuccess] = useState<PaymentProcessResult | null>(null);

  // Modular Hooks
  const catalog = useCatalog();
  const cart = useCart();
  const audio = useAudio('/musica-relax.mp3');
  const chat = useChat(catalog.plants, settings);
  const auth = useAuth();

  useEffect(() => {
    // Detectar retorno de pago aprobado desde Mercado Pago Checkout Pro (Opción 1)
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || params.get('collection_status');
    const paymentId = params.get('payment_id') || params.get('collection_id');

    if (status === 'approved' && paymentId) {
      window.history.replaceState({}, '', window.location.pathname);
      setInitialPaymentSuccess({
        success: true,
        id: paymentId,
        status: 'approved',
        message: '¡Tu pago en Mercado Pago ha sido aprobado con éxito!'
      });
      cart.setIsMercadoPagoModalOpen(true);
    }
  }, []);

  const categories = ['Todas', 'Florales', 'Colgantes', 'Sombra', 'Color'];

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF8F5] text-[#1C1917]">
      
      {/* 1. Header con logo, buscador y acceso admin */}
      <Header
        searchQuery={catalog.searchQuery}
        setSearchQuery={catalog.setSearchQuery}
        isAdmin={auth.isAdmin}
        onOpenAdmin={() => auth.setIsAdminModalOpen(true)}
        onLogoutAdmin={auth.logout}
      />

      <main className="flex-1">
        
        {/* 2. Hero Section con título Fraunces, ubicación José C. Paz y WhatsApp */}
        <HeroSection settings={settings} />

        {/* 3. Filtros de Categorías y conteo dinámico */}
        <CategoryFilters
          categories={categories}
          selectedCategory={catalog.selectedCategory}
          onSelectCategory={catalog.setSelectedCategory}
          categoryCounts={catalog.categoryCounts}
          totalVisible={catalog.filteredPlants.length}
        />

        {/* 4. Grilla de Kokedamas (Catálogo de 15 plantas) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {catalog.filteredPlants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-4xl border border-surface-border">
              <p className="font-serif text-lg font-bold text-[#1C1917]">
                No encontramos kokedamas con ese criterio.
              </p>
              <p className="text-xs text-[#78716C] mt-1">
                Prueba buscando otro término o seleccionando la categoría "Todas".
              </p>
              <button
                onClick={() => {
                  catalog.setSelectedCategory('Todas');
                  catalog.setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-[#164e28] text-white rounded-full text-xs font-semibold"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalog.filteredPlants.map((plant) => (
                <ProductCard
                  key={plant.id}
                  plant={plant}
                  isSelected={cart.isSelected(plant.id)}
                  onToggleSelect={cart.toggleItem}
                  onOpenCare={(p) => catalog.setCareModalPlant(p)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* 5. Modal de Cuidados Botánicos */}
      <CareModal
        plant={catalog.careModalPlant}
        onClose={() => catalog.setCareModalPlant(null)}
        isSelected={catalog.careModalPlant ? cart.isSelected(catalog.careModalPlant.id) : false}
        onToggleSelect={(p, color) => cart.toggleItem(p, color)}
      />

      {/* 6. Barra Flotante de Carrito / Consulta */}
      <FloatingCartBar
        totalCount={cart.totalCount}
        totalAmount={cart.total}
        onOpen={() => cart.setIsDrawerOpen(true)}
      />

      {/* 7. Drawer Lateral de Consulta y Selección */}
      <ConsultationDrawer
        isOpen={cart.isDrawerOpen}
        onClose={() => cart.setIsDrawerOpen(false)}
        items={cart.items}
        total={cart.total}
        onRemoveItem={cart.removeItem}
        onOpenMercadoPago={() => cart.setIsMercadoPagoModalOpen(true)}
        settings={settings}
      />

      {/* 8. Modal de Cobro con Mercado Pago (Tarjeta, QR, Alias) */}
      <MercadoPagoModal
        isOpen={cart.isMercadoPagoModalOpen}
        onClose={() => {
          setInitialPaymentSuccess(null);
          cart.setIsMercadoPagoModalOpen(false);
        }}
        total={cart.total}
        items={cart.items}
        settings={settings}
        onClearCart={() => cart.clearCart()}
        initialPaymentSuccess={initialPaymentSuccess}
      />

      {/* 9. Reproductor Flotante de Música Ambiental Zen */}
      <AmbientAudioPlayer
        isPlaying={audio.isPlaying}
        onToggle={audio.toggle}
      />

      {/* 10. Chatbot Inteligente con IA de Antigravity (KokeBot) */}
      <DeepSeekChatbot
        isOpen={chat.isOpen}
        onToggle={() => chat.setIsOpen(!chat.isOpen)}
        messages={chat.messages}
        isLoading={chat.isLoading}
        onSendMessage={chat.sendMessage}
        onClearChat={chat.clearChat}
        settings={settings}
      />

      {/* 11. Panel de Administración y CRM (Protegido por PIN / Cierre de sesión al salir) */}
      <AdminModal
        isOpen={auth.isAdminModalOpen}
        onClose={() => auth.setIsAdminModalOpen(false)}
        isAdmin={auth.isAdmin}
        onLogin={auth.login}
        onLogout={auth.logout}
        plants={catalog.plants}
        onRefreshPlants={catalog.refreshPlants}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 12. Pie de Página */}
      <Footer
        settings={settings}
        onOpenAdmin={() => auth.setIsAdminModalOpen(true)}
      />

    </div>
  );
};
