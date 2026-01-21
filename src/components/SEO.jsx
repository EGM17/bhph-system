import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

export default function SEO({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  article = null,
  noindex = false,
  disableAlternates = false // 🆕 NUEVO: Para posts de blog sin traducción
}) {
  const { language } = useLanguage();
  const baseUrl = window.location.origin;
  const currentPath = window.location.pathname;
  const fullUrl = `${baseUrl}${currentPath}`;
  
  // Nombre del sitio
  const siteName = 'El Compa Güero Auto Sales';
  
  // Título completo
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  // Descripción por defecto
  const defaultDescription = language === 'es' 
    ? 'Financiamiento fácil y rápido para autos en Salem, Oregon. Buy Here Pay Here sin revisar crédito.'
    : 'Easy and fast car financing in Salem, Oregon. Buy Here Pay Here with no credit check.';
  
  const metaDescription = description || defaultDescription;
  
  // Imagen por defecto
  const defaultImage = `${baseUrl}/default-og-image.jpg`;
  const metaImage = image || defaultImage;
  
  // Locale según idioma
  const locale = language === 'es' ? 'es_ES' : 'en_US';
  const alternateLocale = language === 'es' ? 'en_US' : 'es_ES';
  
  // 🔥 Detectar si es un post de blog (por la ruta)
  const isBlogPost = currentPath.includes('/blog/') && currentPath.split('/').length > 3;
  
  // 🔥 Si es post de blog sin traducción, desactivar alternates
  const shouldDisableAlternates = disableAlternates || isBlogPost;
  
  // 🔥 Construir URLs alternativas correctamente (solo si NO es post de blog)
  const buildAlternateUrl = (targetLang) => {
    // Mapeo de rutas según idioma
    const routeMap = {
      es: {
        '/en': '/es',
        '/en/inventory': '/es/inventario',
        '/en/financing': '/es/financiamiento',
        '/en/contact': '/es/contacto',
        '/en/blog': '/es/blog'
      },
      en: {
        '/es': '/en',
        '/es/inventario': '/en/inventory',
        '/es/financiamiento': '/en/financing',
        '/es/contacto': '/en/contact',
        '/es/blog': '/en/blog'
      }
    };

    // Si es la página home
    if (currentPath === '/es' || currentPath === '/en' || currentPath === '/') {
      return `${baseUrl}/${targetLang}`;
    }

    // Para rutas dinámicas (vehículos)
    const pathParts = currentPath.split('/').filter(Boolean);
    
    if (pathParts.length >= 3 && pathParts[1] !== 'blog') {
      // Es una ruta dinámica de vehículo (ej: /es/inventario/abc123)
      const currentLang = pathParts[0]; // 'es' o 'en'
      const section = pathParts[1]; // 'inventario', 'inventory', etc
      const dynamicPart = pathParts.slice(2).join('/'); // 'abc123'
      
      // Traducir la sección
      let translatedSection = section;
      if (targetLang === 'es') {
        if (section === 'inventory') translatedSection = 'inventario';
      } else {
        if (section === 'inventario') translatedSection = 'inventory';
      }
      
      return `${baseUrl}/${targetLang}/${translatedSection}/${dynamicPart}`;
    }

    // Para rutas estáticas, usar el mapeo
    const mappedRoute = routeMap[targetLang][currentPath];
    if (mappedRoute) {
      return `${baseUrl}${mappedRoute}`;
    }

    // Fallback: Simple replace
    if (targetLang === 'es') {
      return `${baseUrl}${currentPath.replace('/en/', '/es/').replace('/en', '/es')}`;
    } else {
      return `${baseUrl}${currentPath.replace('/es/', '/en/').replace('/es', '/en')}`;
    }
  };

  const esUrl = !shouldDisableAlternates ? buildAlternateUrl('es') : fullUrl;
  const enUrl = !shouldDisableAlternates ? buildAlternateUrl('en') : fullUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* 🔥 CRÍTICO: Canonical URL - Siempre es la URL ACTUAL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* 🔥 Hreflang Tags - Solo si NO es post de blog sin traducción */}
      {!shouldDisableAlternates ? (
        <>
          <link rel="alternate" hreflang="es" href={esUrl} />
          <link rel="alternate" hreflang="en" href={enUrl} />
          <link rel="alternate" hreflang="x-default" href={language === 'es' ? esUrl : enUrl} />
        </>
      ) : (
        <>
          {/* Para posts de blog: Solo el idioma actual */}
          <link rel="alternate" hreflang={language} href={fullUrl} />
          <link rel="alternate" hreflang="x-default" href={fullUrl} />
        </>
      )}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />
      
      {/* Article Meta (si es un post de blog) */}
      {article && type === 'article' && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Additional SEO */}
      <meta name="author" content={siteName} />
      <meta httpEquiv="Content-Language" content={language} />
    </Helmet>
  );
}