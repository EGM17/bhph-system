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
import { deleteAllVehicleImages, uploadMultipleImages } from '../services/storageService';

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

  // ✅ FIX: addVehicle ahora maneja las imágenes correctamente
  const addVehicle = async (vehicleData) => {
    try {
      const { images, ...dataWithoutImages } = vehicleData;
      
      // 1. Crear vehículo SIN imágenes
      const vehicleId = await createVehicle({
        ...dataWithoutImages,
        images: []
      });
      
      console.log('✅ Vehículo creado con ID:', vehicleId);
      
      // 2. Subir imágenes con el ID del vehículo
      if (images && images.length > 0) {
        console.log(`📤 Subiendo ${images.length} imágenes para vehículo ${vehicleId}`);
        const processedImages = await uploadMultipleImages(images, vehicleId);
        
        // ✅ FIX: Guardar como objetos con estructura correcta
        const imageObjects = processedImages.map((img, index) => ({
          url: img.url,
          order: index,
          isPrimary: index === 0
        }));
        
        // 3. Actualizar vehículo con array de objetos
        await updateVehicle(vehicleId, { images: imageObjects });
        console.log('✅ Imágenes añadidas al vehículo:', imageObjects);
      }
      
      // 4. Recargar lista
      await loadVehicles();
      await loadStats();
      
      return vehicleId;
    } catch (err) {
      setError(err.message);
      console.error('❌ Error en addVehicle:', err);
      throw err;
    }
  };

  // ✅ FIX: editVehicle ahora maneja las imágenes correctamente
  const editVehicle = async (vehicleId, updates) => {
    try {
      const { images, ...dataWithoutImages } = updates;
      
      // Si hay imágenes para procesar
      if (images && images.length > 0) {
        console.log(`📤 Procesando ${images.length} imágenes para vehículo ${vehicleId}`);
        const processedImages = await uploadMultipleImages(images, vehicleId);
        
        // ✅ FIX: Guardar como objetos con estructura correcta
        const imageObjects = processedImages.map((img, index) => ({
          url: img.url,
          order: index,
          isPrimary: index === 0
        }));
        
        // Actualizar con array de objetos
        await updateVehicle(vehicleId, {
          ...dataWithoutImages,
          images: imageObjects
        });
        
        console.log('✅ Imágenes actualizadas:', imageObjects);
      } else {
        // Actualizar sin tocar imágenes
        await updateVehicle(vehicleId, dataWithoutImages);
      }
      
      await loadVehicles();
      await loadStats();
    } catch (err) {
      setError(err.message);
      console.error('❌ Error en editVehicle:', err);
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