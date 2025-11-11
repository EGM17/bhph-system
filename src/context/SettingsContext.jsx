import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import { getStorage } from 'firebase/storage';

const storage = getStorage();
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    dateFormat: 'en-US',
    currency: 'USD',
    theme: 'light',
    // Configuración del Hero
    heroImage: null, // URL de la imagen
    heroImageAlt: 'Tu Próximo Auto Te Espera',
    heroTitle: 'LATINO AL VOLANTE',
    heroSubtitle: 'Empieza hoy mismo el proceso y maneja tu auto en menos de 24 horas'
  });
  
  const [loading, setLoading] = useState(true);

  // Cargar configuración desde Firebase al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        setSettings(prev => ({ ...prev, ...settingsDoc.data() }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Guardar en Firebase
      await setDoc(doc(db, 'settings', 'general'), updatedSettings, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sube la imagen del Hero a Firebase Storage
   * @param {File} file - Archivo de imagen
   * @returns {Promise<string>} URL de la imagen subida
   */
  const uploadHeroImage = async (file) => {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('La imagen no debe superar 5MB');
      }

      // Generar nombre único
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `hero-image-${timestamp}.${extension}`;
      
      // Referencia en Storage
      const storageRef = ref(storage, `settings/hero/${filename}`);
      
      // Metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      };

      // Subir archivo
      await uploadBytes(storageRef, file, metadata);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      
      // Actualizar settings con la nueva URL
      await updateSettings({ heroImage: downloadURL });
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * 🔧 FIXED: Formatea una fecha para mostrarla al usuario SIN perder días por UTC
   * Maneja fechas en formato YYYY-MM-DD correctamente
   */
  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      
      // 🔧 FIX CRÍTICO: Si viene como string YYYY-MM-DD, crear fecha LOCAL
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Crear fecha en zona horaria LOCAL (no UTC)
        date = new Date(year, month - 1, day);
      } else {
        // Para otros formatos (timestamps, Date objects)
        date = new Date(dateString);
      }
      
      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      const defaultOptions = settings.dateFormat === 'en-US' 
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
      
      return date.toLocaleDateString(settings.dateFormat, { ...defaultOptions, ...options });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error en fecha';
    }
  };

  /**
   * 🔧 FIXED: Convierte una fecha a formato para input date (YYYY-MM-DD)
   * Asegura que la fecha sea local, no UTC
   */
  const toInputDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // 🔧 FIX: Si ya es YYYY-MM-DD, devolverlo tal cual
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Si es string con guiones, parsear localmente
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
      // Usar componentes locales (no UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error convirtiendo fecha:', error);
      return '';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return `$${Number(amount).toLocaleString(settings.dateFormat)}`;
  };

  const value = {
    settings,
    updateSettings,
    uploadHeroImage,
    formatDate,
    toInputDate,
    formatCurrency,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};