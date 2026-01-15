/**
 * 🎯 Cache Service - Sistema de Caché para BHPH
 * Reduce lecturas de Firebase en un 90% mediante caché inteligente
 * Invalidación automática cuando hay cambios en pagos, clientes o leads
 * ❌ INVENTARIO NO SE CACHEA - Siempre datos frescos
 */

const CACHE_KEYS = {
  // Datos principales
  CLIENTS_LIST: 'bhph_clients_list',
  PAYMENTS_LIST: 'bhph_payments_list',
  LEADS_LIST: 'bhph_leads_list',
  // ❌ INVENTARIO REMOVIDO - No se cachea
  
  // Estadísticas
  DASHBOARD_STATS: 'bhph_dashboard_stats',
  
  // Por cliente individual
  CLIENT_PAYMENTS: 'bhph_client_payments_', // + clientId
  
  // Versión global del caché
  CACHE_VERSION: 'bhph_cache_version'
};

const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutos - Para datos que cambian frecuentemente
  MEDIUM: 15 * 60 * 1000,    // 15 minutos - Para datos estables
  LONG: 60 * 60 * 1000       // 1 hora - Para datos muy estables
};

class CacheService {
  constructor() {
    this.storage = sessionStorage; // Usar sessionStorage para caché de sesión
    this.listeners = new Set();
    this.initializeVersion();
  }

  /**
   * Inicializa la versión del caché si no existe
   */
  initializeVersion() {
    if (!this.storage.getItem(CACHE_KEYS.CACHE_VERSION)) {
      this.storage.setItem(CACHE_KEYS.CACHE_VERSION, Date.now().toString());
    }
  }

  /**
   * Obtiene la versión actual del caché
   */
  getCacheVersion() {
    return this.storage.getItem(CACHE_KEYS.CACHE_VERSION) || Date.now().toString();
  }

  /**
   * 🗑️ Invalida toda la caché relacionada con pagos y clientes
   * Se llama cuando: crear/editar/eliminar pago, crear/editar/eliminar cliente
   */
  invalidatePaymentCache() {
    console.log('🗑️ Invalidando caché de pagos y clientes...');
    
    // Actualizar versión de caché (invalida todo)
    this.storage.setItem(CACHE_KEYS.CACHE_VERSION, Date.now().toString());
    
    // Eliminar cachés específicos
    this.storage.removeItem(CACHE_KEYS.CLIENTS_LIST);
    this.storage.removeItem(CACHE_KEYS.PAYMENTS_LIST);
    this.storage.removeItem(CACHE_KEYS.DASHBOARD_STATS);
    
    // Eliminar cachés de pagos individuales de clientes
    this.clearClientPaymentsCaches();
    
    // Notificar a listeners
    this.notifyListeners('payment');
  }

  /**
   * 🗑️ Invalida caché de leads
   * Se llama cuando: crear/editar/eliminar lead
   */
  invalidateLeadsCache() {
    console.log('🗑️ Invalidando caché de leads...');
    this.storage.removeItem(CACHE_KEYS.LEADS_LIST);
    this.notifyListeners('leads');
  }

  // ❌ INVENTARIO NO SE CACHEA - Método removido

  /**
   * Limpiar cachés de pagos de clientes individuales
   */
  clearClientPaymentsCaches() {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.CLIENT_PAYMENTS)) {
        this.storage.removeItem(key);
      }
    });
  }

  /**
   * ✅ Obtener datos de caché
   * @param {string} key - Clave del caché
   * @param {number} maxAge - Edad máxima en milisegundos
   * @returns {any|null} Datos cacheados o null
   */
  get(key, maxAge = CACHE_DURATION.MEDIUM) {
    try {
      const cached = this.storage.getItem(key);
      if (!cached) return null;

      const { data, timestamp, version } = JSON.parse(cached);
      const currentVersion = this.getCacheVersion();
      
      // Verificar si la versión coincide
      if (version !== currentVersion) {
        this.storage.removeItem(key);
        console.log(`❌ Caché desactualizado: ${key}`);
        return null;
      }

      // Verificar si no ha expirado
      const age = Date.now() - timestamp;
      if (age > maxAge) {
        this.storage.removeItem(key);
        console.log(`⏰ Caché expirado: ${key} (${Math.round(age / 1000)}s)`);
        return null;
      }

      console.log(`✅ Caché hit: ${key} (edad: ${Math.round(age / 1000)}s)`);
      return data;
    } catch (error) {
      console.error('Error leyendo caché:', error);
      this.storage.removeItem(key);
      return null;
    }
  }

  /**
   * 💾 Guardar datos en caché
   * @param {string} key - Clave del caché
   * @param {any} data - Datos a guardar
   */
  set(key, data) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        version: this.getCacheVersion()
      };
      this.storage.setItem(key, JSON.stringify(cacheEntry));
      console.log(`💾 Datos guardados en caché: ${key}`);
    } catch (error) {
      console.error('Error guardando en caché:', error);
      // Si falla (ej: quota exceeded), limpiar caché antigua
      this.clearOldCache();
      // Reintentar
      try {
        this.storage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          version: this.getCacheVersion()
        }));
      } catch (retryError) {
        console.error('Error en reintento de guardado:', retryError);
      }
    }
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS POR TIPO DE DATO
  // ==========================================

  /**
   * 👥 CLIENTES
   */
  getClientsList() {
    return this.get(CACHE_KEYS.CLIENTS_LIST, CACHE_DURATION.MEDIUM);
  }

  setClientsList(clients) {
    this.set(CACHE_KEYS.CLIENTS_LIST, clients);
  }

  /**
   * 💰 PAGOS
   */
  getPaymentsList() {
    return this.get(CACHE_KEYS.PAYMENTS_LIST, CACHE_DURATION.SHORT);
  }

  setPaymentsList(payments) {
    this.set(CACHE_KEYS.PAYMENTS_LIST, payments);
  }

  /**
   * 💰 PAGOS DE CLIENTE INDIVIDUAL
   */
  getClientPayments(clientId) {
    return this.get(CACHE_KEYS.CLIENT_PAYMENTS + clientId, CACHE_DURATION.SHORT);
  }

  setClientPayments(clientId, payments) {
    this.set(CACHE_KEYS.CLIENT_PAYMENTS + clientId, payments);
  }

  /**
   * 📊 DASHBOARD
   */
  getDashboardStats() {
    return this.get(CACHE_KEYS.DASHBOARD_STATS, CACHE_DURATION.SHORT);
  }

  setDashboardStats(stats) {
    this.set(CACHE_KEYS.DASHBOARD_STATS, stats);
  }

  /**
   * 📧 LEADS
   */
  getLeadsList() {
    return this.get(CACHE_KEYS.LEADS_LIST, CACHE_DURATION.MEDIUM);
  }

  setLeadsList(leads) {
    this.set(CACHE_KEYS.LEADS_LIST, leads);
  }

  // ❌ INVENTARIO NO SE CACHEA - Métodos removidos

  // ==========================================
  // GESTIÓN DE LISTENERS
  // ==========================================

  /**
   * Suscribirse a invalidaciones de caché
   * @param {Function} callback - Función a ejecutar cuando se invalida la caché
   * @param {string} type - Tipo de invalidación ('payment', 'leads', 'inventory', 'all')
   * @returns {Function} Función para desuscribirse
   */
  subscribe(callback, type = 'all') {
    const listener = { callback, type };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notificar a listeners sobre invalidación
   * @param {string} type - Tipo de invalidación
   */
  notifyListeners(type = 'all') {
    this.listeners.forEach(listener => {
      if (listener.type === 'all' || listener.type === type) {
        try {
          listener.callback(type);
        } catch (error) {
          console.error('Error en listener de caché:', error);
        }
      }
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Limpiar caché antigua (por si se llena el storage)
   */
  clearOldCache() {
    console.log('🧹 Limpiando caché antigua...');
    const keys = Object.keys(this.storage);
    const bhphKeys = keys.filter(k => k.startsWith('bhph_'));
    
    bhphKeys.forEach(key => {
      try {
        const cached = this.storage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          // Eliminar si tiene más de 1 hora
          if (Date.now() - timestamp > CACHE_DURATION.LONG) {
            this.storage.removeItem(key);
            console.log(`🗑️ Eliminado: ${key}`);
          }
        }
      } catch (error) {
        // Si hay error parseando, eliminar
        this.storage.removeItem(key);
      }
    });
  }

  /**
   * Limpiar toda la caché del sistema
   */
  clearAll() {
    console.log('🗑️ Limpiando TODA la caché del sistema...');
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith('bhph_')) {
        this.storage.removeItem(key);
      }
    });
    // Reinicializar versión
    this.initializeVersion();
    this.notifyListeners('all');
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const keys = Object.keys(this.storage).filter(k => k.startsWith('bhph_'));
    let totalSize = 0;
    const items = [];

    keys.forEach(key => {
      try {
        const value = this.storage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;
        
        const { timestamp } = JSON.parse(value);
        const age = Math.round((Date.now() - timestamp) / 1000);
        
        items.push({
          key,
          size: (size / 1024).toFixed(2) + ' KB',
          age: age + 's'
        });
      } catch (error) {
        // Ignorar errores
      }
    });

    return {
      totalItems: keys.length,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      items
    };
  }

  /**
   * Imprimir estadísticas en consola
   */
  printStats() {
    const stats = this.getStats();
    console.log('📊 Estadísticas de Caché:');
    console.log(`   Total de items: ${stats.totalItems}`);
    console.log(`   Tamaño total: ${stats.totalSize}`);
    console.table(stats.items);
  }
}

// Exportar instancia singleton
export const cacheService = new CacheService();

// Exportar constantes para uso externo
export { CACHE_DURATION };

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.cacheService = cacheService;
  console.log('🎯 CacheService disponible globalmente: window.cacheService');
  console.log('💡 Usa window.cacheService.printStats() para ver estadísticas');
}