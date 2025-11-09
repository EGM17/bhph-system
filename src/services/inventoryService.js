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
 * Obtiene vehículos publicados para el sitio público
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de vehículos disponibles
 */
export const getPublicVehicles = async (filters = {}) => {
  try {
    const constraints = [
      where('isPublished', '==', true),
      where('status', '==', 'available')
    ];
    
    // Filtros adicionales
    if (filters.make) {
      constraints.push(where('make', '==', filters.make));
    }
    
    if (filters.year) {
      constraints.push(where('year', '==', parseInt(filters.year)));
    }
    
    if (filters.bodyType) {
      constraints.push(where('bodyType', '==', filters.bodyType));
    }
    
    // Ordenamiento por defecto: más recientes primero
    const orderField = filters.sortBy || 'createdAt';
    const orderDirection = filters.sortOrder || 'desc';
    constraints.push(orderBy(orderField, orderDirection));
    
    // Límite
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    const q = query(collection(db, INVENTORY_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtros adicionales que no se pueden hacer en Firestore
    let filteredVehicles = vehicles;
    
    // Filtro de precio
    if (filters.minPrice || filters.maxPrice) {
      filteredVehicles = filteredVehicles.filter(v => {
        const price = v.price || 0;
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }
    
    // Filtro de millaje
    if (filters.maxMileage) {
      filteredVehicles = filteredVehicles.filter(v => 
        (v.mileage || 0) <= filters.maxMileage
      );
    }
    
    return filteredVehicles;
  } catch (error) {
    console.error('Error obteniendo vehículos públicos:', error);
    throw error;
  }
};

/**
 * Obtiene vehículos destacados para homepage
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // Si no hay vehículos con isFeatured, retornar los más recientes
    console.log('No featured vehicles, returning recent ones');
    return getPublicVehicles({ limit: count });
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
    const updates = {
      isPublished,
      updatedAt: new Date()
    };
    
    if (isPublished) {
      updates.publishedAt = new Date();
    }
    
    await updateVehicle(vehicleId, updates);
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    throw error;
  }
};

/**
 * Marca un vehículo como vendido y opcionalmente lo vincula a un cliente
 * @param {string} vehicleId - ID del vehículo
 * @param {string} clientId - ID del cliente (opcional)
 * @returns {Promise<void>}
 */
export const markAsSold = async (vehicleId, clientId = null) => {
  try {
    const updates = {
      status: 'sold',
      soldAt: new Date(),
      isPublished: false,
      updatedAt: new Date()
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
 * Busca vehículos por texto
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Vehículos que coinciden
 */
export const searchVehicles = async (searchTerm) => {
  try {
    // Obtener todos los vehículos publicados
    const vehicles = await getPublicVehicles();
    
    // Filtrar por término de búsqueda (case insensitive)
    const term = searchTerm.toLowerCase();
    
    return vehicles.filter(v => {
      const searchableText = `
        ${v.year} 
        ${v.make} 
        ${v.model} 
        ${v.trim || ''} 
        ${v.stockNumber || ''} 
        ${v.vin || ''}
      `.toLowerCase();
      
      return searchableText.includes(term);
    });
  } catch (error) {
    console.error('Error buscando vehículos:', error);
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
    
    const makes = [...new Set(vehicles.map(v => v.make))].sort();
    const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
    const bodyTypes = [...new Set(vehicles.map(v => v.bodyType).filter(Boolean))].sort();
    
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