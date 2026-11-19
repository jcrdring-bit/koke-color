import React, { useState, useRef } from 'react';
import { Plant } from '../../types';
import { dbService } from '../../services/db';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import { Plus, Trash2, Check, RefreshCw, Upload, Camera, Image as ImageIcon, X, Link, Loader2 } from 'lucide-react';

interface InventoryTabProps {
  plants: Plant[];
  onRefresh: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ plants, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // Estados del formulario para nueva kokedama
  const [newName, setNewName] = useState('');
  const [newScientific, setNewScientific] = useState('');
  const [newPrice, setNewPrice] = useState<number>(22000);
  const [newLight, setNewLight] = useState('Luz indirecta brillante');
  const [newOrigin, setNewOrigin] = useState('Taller Koke Color');
  const [newDescription, setNewDescription] = useState('Kokedama artesanal elaborada con técnica japonesa y musgo fresco seleccionado.');
  const [newWatering, setNewWatering] = useState('Inmersión en agua 10-15 minutos cada 7-10 días.');
  const [newCategories, setNewCategories] = useState<('Florales' | 'Colgantes' | 'Sombra' | 'Color')[]>(['Color']);

  // Modo de carga de imagen: 'upload' (desde PC/móvil) o 'url' (enlace web)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [newImage, setNewImage] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Referencias a inputs de archivos
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);
  const [plantToUpdatePhoto, setPlantToUpdatePhoto] = useState<Plant | null>(null);

  // Manejar subida de archivo para nueva kokedama
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setImageError(null);

    try {
      const optimizedBase64 = await optimizeImageFile(file, 900, 900, 0.85);
      setNewImage(optimizedBase64);
    } catch (err: any) {
      console.error('Error al optimizar imagen:', err);
      setImageError(err?.message || 'No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsProcessingImage(false);
      // Reset input value to allow selecting same file again if needed
      e.target.value = '';
    }
  };

  // Manejar cambio de foto de una kokedama existente
  const handleEditExistingPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !plantToUpdatePhoto) return;

    try {
      const optimizedBase64 = await optimizeImageFile(file, 900, 900, 0.85);
      dbService.savePlant({ ...plantToUpdatePhoto, imageUrl: optimizedBase64 });
      setPlantToUpdatePhoto(null);
      onRefresh();
    } catch (err) {
      console.error('Error al actualizar foto existente:', err);
      alert('No se pudo actualizar la imagen. Intenta con otra foto.');
    } finally {
      e.target.value = '';
    }
  };

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

  const handleDeletePlant = (plant: Plant) => {
    if (confirm(`¿Estás seguro de eliminar "${plant.name}" del catálogo?`)) {
      dbService.deletePlant(plant.id);
      onRefresh();
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restablecer el catálogo completo a las 15 kokedamas originales de muestra?')) {
      dbService.resetPlants();
      onRefresh();
    }
  };

  const toggleCategory = (cat: 'Florales' | 'Colgantes' | 'Sombra' | 'Color') => {
    setNewCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCreatePlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Si no cargó imagen, usar una kokedama representativa por defecto
    const finalImage =
      newImage.trim() ||
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80';

    const newPlant: Plant = {
      id: `plant_${Date.now()}`,
      name: newName.trim(),
      scientificName: newScientific.trim() || 'Especie botánica',
      origin: newOrigin.trim() || 'Taller Koke Color',
      light: newLight.trim() || 'Luz indirecta brillante',
      price: Number(newPrice) || 20000,
      categories: ['Todas', ...newCategories],
      inStock: true,
      imageUrl: finalImage,
      description: newDescription.trim() || 'Kokedama artesanal elaborada con técnica japonesa.',
      wateringGuide: newWatering.trim() || 'Riego por inmersión semanal de 10-15 minutos.',
      lightGuide: newLight.trim() || 'Luz indirecta.',
      careTips: [
        'Sumergir cuando la esfera de musgo se sienta liviana.',
        'Escurrir el exceso de agua antes de volver a colocar en su plato.',
        'Ubicar en un espacio fresco y bien ventilado.'
      ]
    };

    dbService.savePlant(newPlant);

    // Resetear formulario
    setShowAddForm(false);
    setNewName('');
    setNewScientific('');
    setNewPrice(22000);
    setNewImage('');
    setNewCategories(['Color']);
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Input oculto para editar foto de kokedama existente */}
      <input
        type="file"
        ref={editImageInputRef}
        onChange={handleEditExistingPhoto}
        accept="image/*"
        className="hidden"
      />

      {/* Barra superior de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div>
          <h4 className="font-serif text-base font-bold text-[#1C1917]">
            Inventario de Kokedamas ({plants.length})
          </h4>
          <p className="text-xs text-[#78716C]">
            Agrega nuevas kokedamas con su foto, edita precios o ajusta el stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 rounded-full bg-[#164e28] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#123f21] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cerrar Formulario' : 'Nueva Kokedama'}</span>
          </button>

          <button
            onClick={handleResetCatalog}
            className="p-1.5 rounded-full border border-surface-border hover:bg-stone-100 text-[#78716C] transition-colors"
            title="Restablecer catálogo a las 15 kokedamas originales"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formulario para agregar nueva planta con carga de foto */}
      {showAddForm && (
        <form
          onSubmit={handleCreatePlant}
          className="p-4 sm:p-5 bg-[#FAF8F5] rounded-3xl border border-surface-border space-y-4 text-xs animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-[#1C1917] text-sm flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#164e28]" />
              <span>Crear nueva Kokedama y cargar foto</span>
            </h5>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SECCIÓN DE FOTO DE LA KOKEDAMA */}
          <div className="bg-white p-3.5 rounded-2xl border border-surface-border space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#164e28]" />
                <span>Foto de la Kokedama:</span>
              </label>

              {/* Selector de modo: Subir archivo o URL */}
              <div className="inline-flex rounded-xl bg-stone-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    imageMode === 'upload'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Subir foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    imageMode === 'url'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>Pegar enlace</span>
                </button>
              </div>
            </div>

            {/* Vista previa y zona de carga */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
              {/* Preview de la foto */}
              <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 overflow-hidden flex items-center justify-center shrink-0">
                {isProcessingImage ? (
                  <div className="flex flex-col items-center justify-center text-stone-400 text-center p-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#164e28] mb-1" />
                    <span className="text-[10px]">Optimizando...</span>
                  </div>
                ) : newImage ? (
                  <>
                    <img
                      src={newImage}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      title="Quitar foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2 text-stone-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] block leading-tight">Sin foto cargada</span>
                  </div>
                )}
              </div>

              {/* Botón de carga o input de URL */}
              <div className="flex-1 w-full space-y-2">
                {imageMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#164e28]/60 bg-emerald-50/50 hover:bg-emerald-50 text-[#164e28] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{newImage ? 'Cambiar foto seleccionada' : 'Seleccionar foto desde tu computadora o celular'}</span>
                    </button>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Acepta fotos tomadas con la cámara o descargadas (JPG, PNG, WebP). La imagen se optimiza automáticamente para cargar al instante.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/kokedama.jpg"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white text-xs"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Pega un enlace directo de una imagen de internet.
                    </p>
                  </div>
                )}

                {imageError && (
                  <p className="text-[11px] text-red-600 font-medium">{imageError}</p>
                )}
              </div>
            </div>
          </div>

          {/* DATOS DE LA PLANTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#78716C] mb-1 font-medium">Nombre de la kokedama:</label>
              <input
                type="text"
                placeholder="ej. Ficus Ginseng Bonsai"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[#78716C] mb-1 font-medium">Nombre científico (opcional):</label>
              <input
                type="text"
                placeholder="ej. Ficus microcarpa"
                value={newScientific}
                onChange={(e) => setNewScientific(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white italic"
              />
            </div>

            <div>
              <label className="block text-[#78716C] mb-1 font-medium">Precio ($ ARS):</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[#78716C] mb-1 font-medium">Requerimiento de luz:</label>
              <input
                type="text"
                value={newLight}
                onChange={(e) => setNewLight(e.target.value)}
                placeholder="ej. Luz indirecta brillante"
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#78716C] mb-1 font-medium">Frecuencia y guía de riego:</label>
              <input
                type="text"
                value={newWatering}
                onChange={(e) => setNewWatering(e.target.value)}
                placeholder="ej. Inmersión en agua 10-15 minutos cada 7 días."
                className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white"
              />
            </div>

            {/* Categorías */}
            <div className="sm:col-span-2">
              <label className="block text-[#78716C] mb-1.5 font-medium">Categorías de catálogo:</label>
              <div className="flex flex-wrap gap-2">
                {(['Florales', 'Colgantes', 'Sombra', 'Color'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      newCategories.includes(cat)
                        ? 'bg-[#164e28] text-white shadow-xs'
                        : 'bg-white border border-surface-border text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {newCategories.includes(cat) ? '✓ ' : '+ '}{cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-border/60">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="px-5 py-2 rounded-xl bg-[#164e28] hover:bg-[#123f21] text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar en el Catálogo</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista / Tabla de plantas existentes */}
      <div className="divide-y divide-surface-border/60 max-h-[52vh] overflow-y-auto pr-1">
        {plants.map((plant) => (
          <div key={plant.id} className="py-3.5 flex items-center justify-between gap-3 text-xs group">
            
            {/* Foto editable al hacer clic y Nombre */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative group/photo shrink-0 cursor-pointer" title="Haz clic para cambiar la foto">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-surface-border shadow-xs group-hover/photo:opacity-80 transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPlantToUpdatePhoto(plant);
                    editImageInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity"
                  title="Cambiar foto de esta kokedama"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="truncate">
                <p className="font-bold text-[#1C1917] text-sm truncate">{plant.name}</p>
                <p className="text-[#78716C] italic text-[11px] truncate">{plant.scientificName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md">
                    {plant.light}
                  </span>
                </div>
              </div>
            </div>

            {/* Precio editable */}
            <div className="text-right shrink-0">
              {editingId === plant.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-24 px-2 py-1 border rounded-lg text-xs font-mono font-bold"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSavePrice(plant)}
                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                    title="Guardar precio"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span
                  onClick={() => {
                    setEditingId(plant.id);
                    setEditPrice(plant.price);
                  }}
                  className="font-mono font-bold text-sm text-[#1C1917] hover:underline cursor-pointer block"
                  title="Clic para cambiar precio"
                >
                  $ {plant.price.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* Switch de Stock y Botón Eliminar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggleStock(plant)}
                className={`px-3 py-1.5 rounded-full font-semibold text-[11px] transition-all ${
                  plant.inStock
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
                title={plant.inStock ? 'Marcar como agotada' : 'Marcar como disponible'}
              >
                {plant.inStock ? 'Disponible' : 'Agotada'}
              </button>

              <button
                onClick={() => handleDeletePlant(plant)}
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title={`Eliminar ${plant.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
