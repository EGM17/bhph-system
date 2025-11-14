import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

const INVENTORY_COLLECTION = 'inventory';

/**
 * Crea un nuevo vehículo en el inventario
 * @param {Object} vehicleData - Datos del vehículo
 * @returns {Promise<string>} ID del documento creado
 */
export const createVehicle = async (vehicleData) => {
  try {
    const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), {
      ...vehicleData,
      status: vehicleData.status || 'available',
      isPublished: vehicleData.isPublished || false,
      isFeatured: vehicleData.isFeatured || false, // ✅ Asegurar que siempre exista
      viewCount: 0,
      leadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Vehículo creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando vehículo:', error);
    throw error;
  }
};

/**
 * Actualiza un vehículo existente
 * @param {string} vehicleId - ID del vehículo
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
export const updateVehicle = async (vehicleId, updates) => {
  try {
    const vehicleRef = doc(db, INVENTORY_COLLECTION, vehicleId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('Vehículo actualizado:', vehicleId);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    throw error;
  }
};

/**
 * Elimina un vehículo del inventario
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<void>}
 */
export const deleteVehicle = async (vehicleId) => {
  try {
    await deleteDoc(doc(db, INVENTORY_COLLECTION, vehicleId));
    console.log('Vehículo eliminado:', vehicleId);
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    throw error;
  }
};

/**
 * Obtiene un vehículo por ID
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Object>} Datos del vehículo
 */
export const getVehicleById = async (vehicleId) => {
  try {
    const vehicleRef = doc(db, INVENTORY_COLLECTION, vehicleId);
    const vehicleDoc = await getDoc(vehicleRef);
    
    if (!vehicleDoc.exists()) {
      throw new Error('Vehículo no encontrado');
    }
    
    return {
      id: vehicleDoc.id,
      ...vehicleDoc.data()
    };
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    throw error;
  }
};

/**
 * Obtiene todos los vehículos del inventario (Admin)
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de vehículos
 */
export const getAllVehicles = async (filters = {}) => {
  try {
    let q = collection(db, INVENTORY_COLLECTION);
    const constraints = [];
    
    // Aplicar filtros
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.isPublished !== undefined) {
      constraints.push(where('isPublished', '==', filters.isPublished));
    }
    
    if (filters.make) {
      constraints.push(where('make', '==', filters.make));
    }
    
    // Ordenamiento
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    throw error;
  }
};

/**
 * 🔧 OPTIMIZADO: Obtiene vehículos publicados para el sitio público
 * Usa filtrado en memoria para evitar necesitar múltiples índices
 * ⭐ PRIORIZA vehículos destacados primero
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de vehículos disponibles
 */
export const getPublicVehicles = async (filters = {}) => {
  try {
    // ✅ Query simple - solo usa el índice: isPublished + status + createdAt
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      where('isPublished', '==', true),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    let vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 🔍 FILTROS EN MEMORIA (no requieren índices adicionales)
    
    // Filtro por marca
    if (filters.make) {
      vehicles = vehicles.filter(v => v.make === filters.make);
    }
    
    // Filtro por año
    if (filters.year) {
      const targetYear = parseInt(filters.year);
      vehicles = vehicles.filter(v => v.year === targetYear);
    }
    
    // Filtro por tipo de carrocería
    if (filters.bodyType) {
      vehicles = vehicles.filter(v => 
        v.bodyClass === filters.bodyType || v.bodyType === filters.bodyType
      );
    }
    
    // Filtro por rango de precio
    if (filters.minPrice || filters.maxPrice) {
      vehicles = vehicles.filter(v => {
        const price = v.price || 0;
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }
    
    // Filtro por millaje máximo
    if (filters.maxMileage) {
      vehicles = vehicles.filter(v => (v.mileage || 0) <= filters.maxMileage);
    }
    
    // Filtro por tipo de financiamiento
    if (filters.financingType) {
      vehicles = vehicles.filter(v => v.financingType === filters.financingType);
    }
    
    // 📊 ORDENAMIENTO
    const sortBy = filters.sortBy || 'featured'; // Default: destacados primero
    const sortOrder = filters.sortOrder || 'desc';
    
    vehicles.sort((a, b) => {
      // ⭐ PRIORIDAD 1: Destacados siempre primero (a menos que se ordene específicamente por otra cosa)
      if (sortBy === 'featured') {
        const aFeatured = a.isFeatured ? 1 : 0;
        const bFeatured = b.isFeatured ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured; // Destacados primero
        }
        // Si ambos son destacados o ninguno lo es, ordenar por fecha
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      }
      
      // Ordenamiento personalizado por campo específico
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Manejar fechas
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
        aVal = aVal?.toDate?.() || new Date(0);
        bVal = bVal?.toDate?.() || new Date(0);
      }
      
      // Manejar valores nulos/undefined
      if (aVal === null || aVal === undefined) aVal = 0;
      if (bVal === null || bVal === undefined) bVal = 0;
      
      // Comparación
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : (aVal < bVal ? -1 : 0);
      } else {
        return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
      }
    });
    
    // Límite
    if (filters.limit) {
      vehicles = vehicles.slice(0, filters.limit);
    }
    
    return vehicles;
    
  } catch (error) {
    console.error('Error obteniendo vehículos públicos:', error);
    throw error;
  }
};

/**
 * 🐛 FIX BUG #1: Obtiene vehículos destacados para homepage
 * Ahora solo retorna vehículos que REALMENTE tienen isFeatured === true
 * @param {number} count - Número de vehículos a retornar
 * @returns {Promise<Array>} Vehículos destacados
 */
export const getFeaturedVehicles = async (count = 6) => {
  try {
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      where('isPublished', '==', true),
      where('status', '==', 'available'),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    const featuredVehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // ✅ FIX: Solo retornar si realmente hay vehículos destacados
    // NO retornar vehículos recientes si no hay destacados
    // El componente FeaturedVehicles manejará el caso de array vacío
    return featuredVehicles;
  } catch (error) {
    console.error('Error obteniendo vehículos destacados:', error);
    // Retornar array vacío en caso de error
    return [];
  }
};

/**
 * Incrementa el contador de vistas de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<void>}
 */
export const incrementViewCount = async (vehicleId) => {
  try {
    const vehicleRef = doc(db, INVENTORY_COLLECTION, vehicleId);
    await updateDoc(vehicleRef, {
      viewCount: increment(1),
      lastViewedAt: new Date()
    });
  } catch (error) {
    console.error('Error incrementando vistas:', error);
    // No lanzar error, es una métrica no crítica
  }
};

/**
 * Cambia el estado de publicación de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @param {boolean} isPublished - Nuevo estado
 * @returns {Promise<void>}
 */
export const togglePublishStatus = async (vehicleId, isPublished) => {
  try {
    await updateVehicle(vehicleId, { 
      isPublished,
      publishedAt: isPublished ? new Date() : null
    });
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    throw error;
  }
};

/**
 * Marca un vehículo como vendido
 * @param {string} vehicleId - ID del vehículo
 * @param {string} clientId - ID del cliente (opcional)
 * @returns {Promise<void>}
 */
export const markAsSold = async (vehicleId, clientId = null) => {
  try {
    const updates = {
      status: 'sold',
      soldAt: new Date()
    };
    
    if (clientId) {
      updates.soldToClientId = clientId;
    }
    
    await updateVehicle(vehicleId, updates);
  } catch (error) {
    console.error('Error marcando vehículo como vendido:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas del inventario
 * @returns {Promise<Object>} Estadísticas
 */
export const getInventoryStats = async () => {
  try {
    const vehicles = await getAllVehicles();
    
    const stats = {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      sold: vehicles.filter(v => v.status === 'sold').length,
      pending: vehicles.filter(v => v.status === 'pending').length,
      published: vehicles.filter(v => v.isPublished).length,
      totalValue: vehicles
        .filter(v => v.status === 'available')
        .reduce((sum, v) => sum + (v.price || 0), 0),
      avgPrice: 0,
      totalViews: vehicles.reduce((sum, v) => sum + (v.viewCount || 0), 0),
      totalLeads: vehicles.reduce((sum, v) => sum + (v.leadCount || 0), 0)
    };
    
    if (stats.available > 0) {
      stats.avgPrice = stats.totalValue / stats.available;
    }
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { 
      total: 0, 
      available: 0, 
      sold: 0, 
      pending: 0, 
      published: 0, 
      totalValue: 0,
      avgPrice: 0,
      totalViews: 0,
      totalLeads: 0
    };
  }
};

/**
 * Busca vehículos por término de búsqueda
 * @param {string} searchTerm - Término a buscar
 * @returns {Promise<Array>} Vehículos que coinciden
 */
export const searchVehicles = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    
    const vehicles = await getPublicVehicles();
    const term = searchTerm.toLowerCase().trim();
    
    return vehicles.filter(vehicle => {
      return (
        vehicle.make?.toLowerCase().includes(term) ||
        vehicle.model?.toLowerCase().includes(term) ||
        vehicle.year?.toString().includes(term) ||
        vehicle.vin?.toLowerCase().includes(term) ||
        vehicle.trim?.toLowerCase().includes(term) ||
        vehicle.bodyClass?.toLowerCase().includes(term)
      );
    });
  } catch (error) {
    console.error('Error buscando vehículos:', error);
    throw error;
  }
};

/**
 * Obtiene opciones únicas de filtros del inventario
 * @returns {Promise<Object>} Opciones de filtros
 */
export const getFilterOptions = async () => {
  try {
    const vehicles = await getPublicVehicles();
    
    const makes = [...new Set(vehicles.map(v => v.make))].filter(Boolean).sort();
    const years = [...new Set(vehicles.map(v => v.year))].filter(Boolean).sort((a, b) => b - a);
    const bodyTypes = [...new Set(vehicles.map(v => v.bodyType || v.bodyClass).filter(Boolean))].sort();
    
    // Rangos de precio
    const prices = vehicles.map(v => v.price || 0).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 100000;
    
    return {
      makes,
      years,
      bodyTypes,
      priceRange: { min: minPrice, max: maxPrice }
    };
  } catch (error) {
    console.error('Error obteniendo opciones de filtros:', error);
    return {
      makes: [],
      years: [],
      bodyTypes: [],
      priceRange: { min: 0, max: 100000 }
    };
  }
};