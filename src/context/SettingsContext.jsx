import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('bhph_settings');
    return saved ? JSON.parse(saved) : {
      dateFormat: 'en-US',
      currency: 'USD',
      theme: 'light'
    };
  });

  useEffect(() => {
    localStorage.setItem('bhph_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
    formatDate,
    toInputDate,
    formatCurrency
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};