import { useState, useEffect } from 'react';
import { 
  getAllVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  togglePublishStatus,
  markAsSold,
  getInventoryStats
} from '../services/inventoryService';
import { deleteAllVehicleImages } from '../services/storageService';

/**
 * Hook personalizado para manejar el inventario de vehículos
 */
export const useInventory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Cargar vehículos al montar
  useEffect(() => {
    loadVehicles();
    loadStats();
  }, []);

  const loadVehicles = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVehicles(filters);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando vehículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getInventoryStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const addVehicle = async (vehicleData) => {
    try {
      const vehicleId = await createVehicle(vehicleData);
      await loadVehicles();
      await loadStats();
      return vehicleId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editVehicle = async (vehicleId, updates) => {
    try {
      await updateVehicle(vehicleId, updates);
      await loadVehicles();
      await loadStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeVehicle = async (vehicleId, deleteImages = true) => {
    try {
      if (deleteImages) {
        await deleteAllVehicleImages(vehicleId);
      }
      await deleteVehicle(vehicleId);
      await loadVehicles();
      await loadStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const togglePublish = async (vehicleId, isPublished) => {
    try {
      await togglePublishStatus(vehicleId, isPublished);
      await loadVehicles();
      await loadStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const sellVehicle = async (vehicleId, clientId = null) => {
    try {
      await markAsSold(vehicleId, clientId);
      await loadVehicles();
      await loadStats();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    vehicles,
    loading,
    error,
    stats,
    loadVehicles,
    addVehicle,
    editVehicle,
    removeVehicle,
    togglePublish,
    sellVehicle,
    refreshStats: loadStats
  };
};
