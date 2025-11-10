import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

const LEADS_COLLECTION = 'leads';

/**
 * Crea un nuevo lead desde el formulario de contacto
 * @param {Object} leadData - Datos del lead
 * @returns {Promise<string>} ID del lead creado
 */
export const createLead = async (leadData) => {
  try {
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...leadData,
      status: 'new', // new, contacted, qualified, converted, closed
      source: 'website', // website, phone, walk-in
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Lead creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando lead:', error);
    throw error;
  }
};

/**
 * Obtiene todos los leads (Admin)
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de leads
 */
export const getAllLeads = async (filters = {}) => {
  try {
    let q = collection(db, LEADS_COLLECTION);
    const constraints = [orderBy('createdAt', 'desc')];
    
    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    
    if (filters.vehicleId) {
      constraints.unshift(where('vehicleId', '==', filters.vehicleId));
    }
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo leads:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un lead
 * @param {string} leadId - ID del lead
 * @param {string} status - Nuevo estado
 * @param {string} notes - Notas opcionales
 * @returns {Promise<void>}
 */
export const updateLeadStatus = async (leadId, status, notes = '') => {
  try {
    const updates = {
      status,
      updatedAt: new Date()
    };
    
    if (notes) {
      updates.notes = notes;
    }
    
    await updateDoc(doc(db, LEADS_COLLECTION, leadId), updates);
  } catch (error) {
    console.error('Error actualizando lead:', error);
    throw error;
  }
};

/**
 * Elimina un lead
 * @param {string} leadId - ID del lead
 * @returns {Promise<void>}
 */
export const deleteLead = async (leadId) => {
  try {
    await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
  } catch (error) {
    console.error('Error eliminando lead:', error);
    throw error;
  }
};

/**
 * Incrementa el contador de leads de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<void>}
 */
export const incrementVehicleLeadCount = async (vehicleId) => {
  try {
    const { updateVehicle } = await import('./inventoryService');
    await updateVehicle(vehicleId, {
      leadCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementando contador de leads:', error);
  }
};