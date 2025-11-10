import { useState, useEffect } from 'react';
import { 
  getPublicVehicles, 
  getFeaturedVehicles, 
  getVehicleById,
  incrementViewCount,
  searchVehicles,
  getFilterOptions
} from '../services/inventoryService';

/**
 * Hook para obtener vehículos públicos con filtros
 */
export const usePublicVehicles = (initialFilters = {}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicVehicles(filters);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando vehículos públicos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    vehicles,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh: loadVehicles
  };
};

/**
 * Hook para obtener vehículos destacados
 */
export const useFeaturedVehicles = (count = 6) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeaturedVehicles();
  }, [count]);

  const loadFeaturedVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeaturedVehicles(count);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando vehículos destacados:', err);
    } finally {
      setLoading(false);
    }
  };

  return { vehicles, loading, error, refresh: loadFeaturedVehicles };
};

/**
 * Hook para obtener un vehículo específico
 */
export const useVehicle = (vehicleId) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicleById(vehicleId);
      setVehicle(data);
      
      // Incrementar contador de vistas
      await incrementViewCount(vehicleId);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando vehículo:', err);
    } finally {
      setLoading(false);
    }
  };

  return { vehicle, loading, error, refresh: loadVehicle };
};

/**
 * Hook para búsqueda de vehículos
 */
export const useVehicleSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchVehicles(searchTerm);
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Error buscando vehículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clear };
};

/**
 * Hook para obtener opciones de filtros
 */
export const useFilterOptions = () => {
  const [options, setOptions] = useState({
    makes: [],
    years: [],
    bodyTypes: [],
    priceRange: { min: 0, max: 100000 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await getFilterOptions();
      setOptions(data);
    } catch (err) {
      console.error('Error cargando opciones de filtros:', err);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, refresh: loadOptions };
};
