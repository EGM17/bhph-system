import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadTranslations } from '../services/translationService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar traducciones desde Firestore al iniciar
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translationsData = await loadTranslations();
        setTranslations(translationsData);
        console.log('✅ Traducciones cargadas:', translationsData);
      } catch (error) {
        console.error('❌ Error cargando traducciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // Detectar idioma de la URL al cargar
  useEffect(() => {
    const pathLang = location.pathname.split('/')[1];
    if (pathLang === 'en' || pathLang === 'es') {
      setLanguage(pathLang);
    } else {
      setLanguage('es');
    }
  }, [location.pathname]);

  // 🔥 CRÍTICO: Resetear scroll cuando cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Cambiar idioma y actualizar URL
  const changeLanguage = (newLang) => {
    if (newLang !== 'es' && newLang !== 'en') return;
    
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    if (pathParts[0] === 'es' || pathParts[0] === 'en') {
      pathParts[0] = newLang;
    } else {
      pathParts.unshift(newLang);
    }
    
    const newPath = '/' + pathParts.join('/');
    navigate(newPath);
    setLanguage(newLang);
  };

  // Función para obtener traducción
  const t = (key, fallback = key) => {
    if (!translations[language]) return fallback;
    
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }
    
    return typeof value === 'string' ? value : fallback;
  };

  const value = {
    language,
    changeLanguage,
    t,
    translations,
    setTranslations,
    loading,
    isSpanish: language === 'es',
    isEnglish: language === 'en'
  };

  // 🔥 CAMBIO: Renderizar children aunque esté loading
  // El loading screen (si es necesario) debe estar en App.jsx, NO aquí
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};