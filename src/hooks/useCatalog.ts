import { useState, useMemo, useEffect } from 'react';
import { Plant } from '../types';
import { dbService } from '../services/db';

export function useCatalog() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [careModalPlant, setCareModalPlant] = useState<Plant | null>(null);

  useEffect(() => {
    setPlants(dbService.getPlants());
  }, []);

  const refreshPlants = () => {
    setPlants(dbService.getPlants());
  };

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Filtro por categoría
      const matchesCategory = selectedCategory === 'Todas' || plant.categories.includes(selectedCategory as any);

      // Filtro por búsqueda
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        plant.name.toLowerCase().includes(q) || 
        plant.scientificName.toLowerCase().includes(q) ||
        plant.origin.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [plants, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todas: plants.length,
      Florales: plants.filter(p => p.categories.includes('Florales')).length,
      Colgantes: plants.filter(p => p.categories.includes('Colgantes')).length,
      Sombra: plants.filter(p => p.categories.includes('Sombra')).length,
      Color: plants.filter(p => p.categories.includes('Color')).length,
    };
    return counts;
  }, [plants]);

  return {
    plants,
    filteredPlants,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    careModalPlant,
    setCareModalPlant,
    refreshPlants
  };
}
