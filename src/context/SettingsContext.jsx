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
   * Formatea una fecha para mostrarla al usuario
   * Maneja tanto fechas en formato local como UTC
   */
  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    try {
      // 🔧 FIX: Convertir fecha UTC a fecha local
      // Si viene como "2025-12-03" desde Firebase, crear fecha local correctamente
      let date;
      
      if (typeof dateString === 'string' && dateString.includes('-')) {
        // Es un string en formato YYYY-MM-DD
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
      // Si la fecha es inválida
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
   * Convierte una fecha a formato para input date (YYYY-MM-DD)
   * Asegura que la fecha sea local, no UTC
   */
  const toInputDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
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