/**
 * 💰 Payment Service - Operaciones CRUD para pagos
 * Con invalidación automática de caché
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { cacheService } from './cacheService';

const PAYMENTS_COLLECTION = 'payments';

/**
 * 📖 Obtiene todos los pagos (con caché)
 */
export const getAllPayments = async (forceRefresh = false) => {
  try {
    // Intentar obtener de caché primero
    if (!forceRefresh) {
      const cached = cacheService.getPaymentsList();
      if (cached) {
        console.log('✅ Usando lista de pagos en caché');
        return cached;
      }
    }

    // Si no hay caché, consultar Firebase
    console.log('📖 Cargando pagos desde Firebase...');
    const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('paymentDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Guardar en caché
    cacheService.setPaymentsList(payments);

    return payments;
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    throw error;
  }
};

/**
 * 📖 Obtiene pagos de un cliente específico (con caché)
 */
export const getClientPayments = async (clientId, forceRefresh = false) => {
  try {
    // Intentar obtener de caché primero
    if (!forceRefresh) {
      const cached = cacheService.getClientPayments(clientId);
      if (cached) {
        console.log(`✅ Usando pagos del cliente ${clientId} en caché`);
        return cached;
      }
    }

    // Si no hay caché, consultar Firebase
    console.log(`📖 Cargando pagos del cliente ${clientId} desde Firebase...`);
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('paymentDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Guardar en caché
    cacheService.setClientPayments(clientId, payments);

    return payments;
  } catch (error) {
    console.error('Error obteniendo pagos del cliente:', error);
    throw error;
  }
};

/**
 * ➕ Crea un nuevo pago
 */
export const createPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Pago creado con ID:', docRef.id);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return { id: docRef.id, ...paymentData };
  } catch (error) {
    console.error('Error creando pago:', error);
    throw error;
  }
};

/**
 * ✏️ Actualiza un pago existente
 */
export const updatePayment = async (paymentId, updates) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('✅ Pago actualizado:', paymentId);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return true;
  } catch (error) {
    console.error('Error actualizando pago:', error);
    throw error;
  }
};

/**
 * 🗑️ Elimina un pago
 */
export const deletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, PAYMENTS_COLLECTION, paymentId));
    
    console.log('✅ Pago eliminado:', paymentId);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return true;
  } catch (error) {
    console.error('Error eliminando pago:', error);
    throw error;
  }
};

/**
 * 🗑️ Elimina todos los pagos de un cliente
 */
export const deleteAllClientPayments = async (clientId) => {
  try {
    const q = query(collection(db, PAYMENTS_COLLECTION), where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    
    console.log(`✅ ${querySnapshot.docs.length} pagos eliminados del cliente ${clientId}`);
    
    // ⬅️ Invalidar caché
    cacheService.invalidatePaymentCache();
    
    return true;
  } catch (error) {
    console.error('Error eliminando pagos del cliente:', error);
    throw error;
  }
};

/**
 * 📊 Obtiene pagos de un mes específico
 */
export const getPaymentsByMonth = async (year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('paymentDate', '>=', startDate),
      where('paymentDate', '<=', endDate),
      orderBy('paymentDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo pagos del mes:', error);
    throw error;
  }
};

/**
 * 📊 Obtiene total cobrado en un período
 */
export const getTotalCollected = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('paymentDate', '>=', startDate),
      where('paymentDate', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const total = querySnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error('Error calculando total cobrado:', error);
    throw error;
  }
};