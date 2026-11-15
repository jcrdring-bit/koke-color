import React, { useState } from 'react';
import { Plant } from '../../types';
import { dbService } from '../../services/db';
import { Plus, Trash2, Check, RefreshCw } from 'lucide-react';

interface InventoryTabProps {
  plants: Plant[];
  onRefresh: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ plants, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // Nuevo formulario de planta
  const [newName, setNewName] = useState('');
  const [newScientific, setNewScientific] = useState('');
  const [newPrice, setNewPrice] = useState(20000);
  const [newLight, setNewLight] = useState('Luz brillante');
  const [newOrigin, setNewOrigin] = useState('Argentina');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80');

  const handleToggleStock = (plant: Plant) => {
    dbService.updatePlantStock(plant.id, !plant.inStock);
    onRefresh();
  };

  const handleSavePrice = (plant: Plant) => {
    if (editPrice > 0) {
      dbService.savePlant({ ...plant, price: editPrice });
      setEditingId(null);
      onRefresh();
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restablecer el catálogo completo a las 15 kokedamas originales de muestra?')) {
      dbService.resetPlants();
      onRefresh();
    }
  };

  const handleCreatePlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPlant: Plant = {
      id: `plant_${Date.now()}`,
      name: newName,
      scientificName: newScientific || 'Especie botánica',
      origin: newOrigin,
      light: newLight,
      price: newPrice,
      categories: ['Todas', 'Color'],
      inStock: true,
      imageUrl: newImage,
      description: 'Kokedama artesanal elaborada con técnica japonesa y musgo fresco seleccionado.',
      wateringGuide: 'Riego por inmersión semanal de 10-15 minutos.',
      lightGuide: newLight,
      careTips: [
        'Sumergir cuando la esfera se sienta liviana.',
        'Escurrir antes de apoyar en su plato de apoyo.',
        'Mantener en ambiente aireado.'
      ]
    };

    dbService.savePlant(newPlant);
    setShowAddForm(false);
    setNewName('');
    setNewScientific('');
    onRefresh();
  };

  return (
    <div className="space-y-5">
      
      {/* Barra superior de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div>
          <h4 className="font-serif text-base font-bold text-[#1C1917]">
            Inventario de Kokedamas ({plants.length})
          </h4>
          <p className="text-xs text-[#78716C]">
            Controla el stock en tiempo real y actualiza precios al instante.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 rounded-full bg-[#164e28] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#123f21] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Kokedama</span>
          </button>

          <button
            onClick={handleResetCatalog}
            className="p-1.5 rounded-full border border-surface-border hover:bg-stone-100 text-[#78716C] transition-colors"
            title="Restablecer catálogo original"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formulario para agregar nueva planta */}
      {showAddForm && (
        <form onSubmit={handleCreatePlant} className="p-4 bg-[#FAF8F5] rounded-2xl border border-surface-border space-y-3 text-xs animate-in slide-in-from-top-2">
          <h5 className="font-bold text-[#1C1917]">Agregar nueva planta</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#78716C] mb-1">Nombre común:</label>
              <input
                type="text"
                placeholder="ej. Monstera Deliciosa"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-surface-border bg-white"
              />
            </div>
            <div>
              <label className="block text-[#78716C] mb-1">Nombre científico:</label>
              <input
                type="text"
                placeholder="ej. Monstera deliciosa Liebm."
                value={newScientific}
                onChange={(e) => setNewScientific(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-surface-border bg-white"
              />
            </div>
            <div>
              <label className="block text-[#78716C] mb-1">Precio ($ ARS):</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-surface-border bg-white"
              />
            </div>
            <div>
              <label className="block text-[#78716C] mb-1">Requerimiento de luz:</label>
              <input
                type="text"
                value={newLight}
                onChange={(e) => setNewLight(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-surface-border bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded-xl text-stone-500 hover:bg-stone-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded-xl bg-[#164e28] text-white font-semibold"
            >
              Guardar en catálogo
            </button>
          </div>
        </form>
      )}

      {/* Tabla de plantas */}
      <div className="divide-y divide-surface-border/60 max-h-[50vh] overflow-y-auto">
        {plants.map((plant) => (
          <div key={plant.id} className="py-3 flex items-center justify-between gap-3 text-xs">
            
            {/* Foto y Nombre */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={plant.imageUrl}
                alt={plant.name}
                className="w-10 h-10 rounded-xl object-cover border border-surface-border shrink-0"
              />
              <div className="truncate">
                <p className="font-bold text-[#1C1917] truncate">{plant.name}</p>
                <p className="text-[#78716C] italic text-[11px] truncate">{plant.scientificName}</p>
              </div>
            </div>

            {/* Precio editable */}
            <div className="text-right">
              {editingId === plant.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 border rounded text-xs"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSavePrice(plant)}
                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span
                  onClick={() => {
                    setEditingId(plant.id);
                    setEditPrice(plant.price);
                  }}
                  className="font-mono font-bold text-[#1C1917] hover:underline cursor-pointer"
                  title="Clic para cambiar precio"
                >
                  $ {plant.price.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* Switch de Stock */}
            <div>
              <button
                onClick={() => handleToggleStock(plant)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  plant.inStock
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {plant.inStock ? 'Disponible' : 'Agotado'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
