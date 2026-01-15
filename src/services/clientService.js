/**
 * 👥 Client Service - Operaciones CRUD para clientes
 * Con invalidación automática de caché
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { cacheService } from './cacheService';

const CLIENTS_COLLECTION = 'clients';

/**
 * 📖 Obtiene todos los clientes (con caché)
 */
export const getAllClients = async (forceRefresh = false) => {
  try {
    // Intentar obtener de caché primero
    if (!forceRefresh) {
      const cached = cacheService.getClientsList();
      if (cached) {
        console.log('✅ Usando lista de clientes en caché');
        return cached;
      }
    }

    // Si no hay caché, consultar Firebase
    console.log('📖 Cargando clientes desde Firebase...');
    const q = query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Guardar en caché
    cacheService.setClientsList(clients);

    return clients;
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};

/**
 * 📖 Obtiene un cliente por ID
 */
export const getClientById = async (clientId) => {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
    const clientSnap = await getDoc(clientRef);
    
    if (!clientSnap.exists()) {
      throw new Error('Cliente no encontrado');
    }
    
    return {
      id: clientSnap.id,
      ...clientSnap.data()
    };
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    throw error;
  }
};

/**
 * ➕ Crea un nuevo cliente
 */
export const createClient = async (clientData) => {
  try {
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Cliente creado con ID:', docRef.id);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return docRef.id;
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};

/**
 * ✏️ Actualiza un cliente existente
 */
export const updateClient = async (clientId, updates) => {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('✅ Cliente actualizado:', clientId);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return true;
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    throw error;
  }
};

/**
 * 🗑️ Elimina un cliente
 */
export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
    
    console.log('✅ Cliente eliminado:', clientId);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return true;
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    throw error;
  }
};

/**
 * 🔍 Busca clientes por criterios
 */
export const searchClients = async (searchTerm) => {
  try {
    // Obtener todos los clientes (con caché)
    const allClients = await getAllClients();
    
    // Filtrar en memoria
    const term = searchTerm.toLowerCase();
    return allClients.filter(client => 
      client.customerName?.toLowerCase().includes(term) ||
      client.phone?.includes(term) ||
      client.vinNumber?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error buscando clientes:', error);
    throw error;
  }
};

/**
 * 📊 Obtiene clientes por estado
 */
export const getClientsByStatus = async (status) => {
  try {
    // Obtener todos los clientes (con caché)
    const allClients = await getAllClients();
    
    // Filtrar en memoria
    return allClients.filter(client => client.status === status);
  } catch (error) {
    console.error('Error obteniendo clientes por estado:', error);
    throw error;
  }
};