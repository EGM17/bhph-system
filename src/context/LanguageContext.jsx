import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadTranslations } from '../services/translationService'; // 🆕 NUEVO

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
  const [loading, setLoading] = useState(true); // 🆕 NUEVO
  const navigate = useNavigate();
  const location = useLocation();

  // 🆕 NUEVO: Cargar traducciones desde Firestore al iniciar
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
      setLanguage('es'); // Default español
    }
  }, [location.pathname]);

  // Cambiar idioma y actualizar URL
  const changeLanguage = (newLang) => {
    if (newLang !== 'es' && newLang !== 'en') return;
    
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // Si la primera parte es un idioma, reemplazarlo
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
    loading, // 🆕 NUEVO
    isSpanish: language === 'es',
    isEnglish: language === 'en'
  };

  // 🆕 NUEVO: Mostrar loading mientras cargan traducciones
  if (loading) {
    return (
      <LanguageContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};