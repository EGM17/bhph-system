import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const TRANSLATIONS_COLLECTION = 'translations';

/**
 * Estructura de traducciones por defecto
 */
const DEFAULT_TRANSLATIONS = {
  es: {
    // Header
    header: {
      home: 'Inicio',
      inventory: 'Inventario',
      financing: 'Financiamiento',
      contact: 'Contacto'
    },
    // Footer
    footer: {
      rights: 'Todos los derechos reservados',
      address: 'Dirección',
      phone: 'Teléfono',
      email: 'Correo electrónico',
      hours: 'Horario',
      followUs: 'Síguenos'
    },
    // Hero Section
    hero: {
      title: 'Financi',
      subtitle: 'Ofrecemos financiamiento fácil y rápido en vehículos seminuevos. Sin revisar crédito, sin ITIN, sin SSN, sin licencia y sin intereses.',
      cta: 'Ver Inventario'
    },
    // Common
    common: {
      viewDetails: 'Ver Detalles',
      contactUs: 'Contáctanos',
      learnMore: 'Más Información',
      apply: 'Aplicar',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito'
    },
    // Vehicle
    vehicle: {
      year: 'Año',
      make: 'Marca',
      model: 'Modelo',
      mileage: 'Kilometraje',
      price: 'Precio',
      condition: 'Condición',
      status: 'Estado',
      features: 'Características',
      description: 'Descripción',
      // Conditions
      new: 'Nuevo',
      used: 'Usado',
      certified: 'Certificado',
      // Status
      available: 'Disponible',
      sold: 'Vendido',
      pending: 'Pendiente',
      reserved: 'Reservado'
    },
    // Forms
    forms: {
      name: 'Nombre',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      subject: 'Asunto',
      required: 'Campo requerido',
      invalidEmail: 'Correo inválido',
      invalidPhone: 'Teléfono inválido'
    },
    // Messages
    messages: {
      success: {
        sent: 'Mensaje enviado exitosamente',
        saved: 'Guardado exitosamente',
        updated: 'Actualizado exitosamente',
        deleted: 'Eliminado exitosamente'
      },
      error: {
        generic: 'Ocurrió un error. Por favor intenta de nuevo.',
        network: 'Error de conexión. Verifica tu internet.',
        notFound: 'No encontrado',
        unauthorized: 'No autorizado'
      }
    },
    // Financing Page
    financing: {
      title: 'Financiamiento Fácil',
      subtitle: 'Aprobación garantizada sin importar tu historial crediticio',
      howItWorks: '¿Cómo Funciona?',
      step1Title: 'Elige tu vehículo',
      step1Desc: 'Explora nuestro inventario y encuentra el auto perfecto para ti',
      step2Title: 'Aplica en línea',
      step2Desc: 'Llena una solicitud simple y rápida',
      step3Title: 'Aprobación inmediata',
      step3Desc: 'Recibe una respuesta en minutos',
      step4Title: 'Maneja hoy',
      step4Desc: 'Llévate tu auto el mismo día',
      benefits: 'Beneficios',
      benefit1: 'Sin verificación de crédito',
      benefit2: 'Enganche desde $500',
      benefit3: 'Pagos flexibles',
      benefit4: 'Ayudamos a reconstruir tu crédito'
    },
    // Contact Page
    contact: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte',
      sendMessage: 'Enviar Mensaje',
      visitUs: 'Visítanos',
      callUs: 'Llámanos',
      emailUs: 'Escríbenos'
    }
  },
  en: {
    // Header
    header: {
      home: 'Home',
      inventory: 'Inventory',
      financing: 'Financing',
      contact: 'Contact'
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      hours: 'Hours',
      followUs: 'Follow Us'
    },
    // Hero Section
    hero: {
      title: 'Find Your Dream Car Today!',
      subtitle: 'We offer easy and fast financing on pre-owned vehicles. No credit check, no ITIN, no SSN, no license and no interest.',
      cta: 'View Inventory'
    },
    // Common
    common: {
      viewDetails: 'View Details',
      contactUs: 'Contact Us',
      learnMore: 'Learn More',
      apply: 'Apply',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    },
    // Vehicle
    vehicle: {
      year: 'Year',
      make: 'Make',
      model: 'Model',
      mileage: 'Mileage',
      price: 'Price',
      condition: 'Condition',
      status: 'Status',
      features: 'Features',
      description: 'Description',
      // Conditions
      new: 'New',
      used: 'Used',
      certified: 'Certified',
      // Status
      available: 'Available',
      sold: 'Sold',
      pending: 'Pending',
      reserved: 'Reserved'
    },
    // Forms
    forms: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      subject: 'Subject',
      required: 'Required field',
      invalidEmail: 'Invalid email',
      invalidPhone: 'Invalid phone'
    },
    // Messages
    messages: {
      success: {
        sent: 'Message sent successfully',
        saved: 'Saved successfully',
        updated: 'Updated successfully',
        deleted: 'Deleted successfully'
      },
      error: {
        generic: 'An error occurred. Please try again.',
        network: 'Connection error. Check your internet.',
        notFound: 'Not found',
        unauthorized: 'Unauthorized'
      }
    },
    // Financing Page
    financing: {
      title: 'Easy Financing',
      subtitle: 'Guaranteed approval regardless of credit history',
      howItWorks: 'How It Works',
      step1Title: 'Choose your vehicle',
      step1Desc: 'Browse our inventory and find the perfect car for you',
      step2Title: 'Apply online',
      step2Desc: 'Fill out a simple and quick application',
      step3Title: 'Instant approval',
      step3Desc: 'Get a response in minutes',
      step4Title: 'Drive today',
      step4Desc: 'Take your car home the same day',
      benefits: 'Benefits',
      benefit1: 'No credit check',
      benefit2: 'Down payment from $500',
      benefit3: 'Flexible payments',
      benefit4: 'We help rebuild your credit'
    },
    // Contact Page
    contact: {
      title: 'Contact Us',
      subtitle: 'We are here to help you',
      sendMessage: 'Send Message',
      visitUs: 'Visit Us',
      callUs: 'Call Us',
      emailUs: 'Email Us'
    }
  }
};

/**
 * Carga todas las traducciones desde Firestore
 * @returns {Promise<Object>} Objeto con traducciones {es: {...}, en: {...}}
 */
export const loadTranslations = async () => {
  try {
    const translationsRef = collection(db, TRANSLATIONS_COLLECTION);
    const snapshot = await getDocs(translationsRef);
    
    if (snapshot.empty) {
      // Si no hay traducciones, inicializar con las por defecto
      await initializeTranslations();
      return DEFAULT_TRANSLATIONS;
    }
    
    const translations = {};
    snapshot.docs.forEach(doc => {
      translations[doc.id] = doc.data();
    });
    
    return translations;
  } catch (error) {
    console.error('Error cargando traducciones:', error);
    // Retornar traducciones por defecto en caso de error
    return DEFAULT_TRANSLATIONS;
  }
};

/**
 * Guarda traducciones de un idioma en Firestore
 * @param {string} lang - Idioma ('es' o 'en')
 * @param {Object} data - Objeto con las traducciones
 * @returns {Promise<void>}
 */
export const saveTranslations = async (lang, data) => {
  try {
    const docRef = doc(db, TRANSLATIONS_COLLECTION, lang);
    await setDoc(docRef, data, { merge: true });
    console.log(`✅ Traducciones guardadas para ${lang}`);
  } catch (error) {
    console.error('Error guardando traducciones:', error);
    throw error;
  }
};

/**
 * Inicializa traducciones por defecto en Firestore
 * @returns {Promise<void>}
 */
export const initializeTranslations = async () => {
  try {
    await saveTranslations('es', DEFAULT_TRANSLATIONS.es);
    await saveTranslations('en', DEFAULT_TRANSLATIONS.en);
    console.log('✅ Traducciones inicializadas');
  } catch (error) {
    console.error('Error inicializando traducciones:', error);
    throw error;
  }
};

/**
 * Obtiene traducciones de un idioma específico
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {Promise<Object>}
 */
export const getTranslationsByLanguage = async (lang) => {
  try {
    const docRef = doc(db, TRANSLATIONS_COLLECTION, lang);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return DEFAULT_TRANSLATIONS[lang] || {};
    }
  } catch (error) {
    console.error(`Error obteniendo traducciones para ${lang}:`, error);
    return DEFAULT_TRANSLATIONS[lang] || {};
  }
};

/**
 * Actualiza una traducción específica
 * @param {string} lang - Idioma
 * @param {string} path - Ruta del texto (ej: 'header.home')
 * @param {string} value - Nuevo valor
 * @returns {Promise<void>}
 */
export const updateTranslation = async (lang, path, value) => {
  try {
    const translations = await getTranslationsByLanguage(lang);
    
    // Navegar por el path y actualizar
    const keys = path.split('.');
    let obj = translations;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    
    await saveTranslations(lang, translations);
  } catch (error) {
    console.error('Error actualizando traducción:', error);
    throw error;
  }
};

export { DEFAULT_TRANSLATIONS };