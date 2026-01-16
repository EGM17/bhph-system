import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

export default function SEO({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  article = null,
  noindex = false
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
  
  // Imagen por defecto (puedes cambiar esto)
  const defaultImage = `${baseUrl}/default-og-image.jpg`;
  const metaImage = image || defaultImage;
  
  // Locale según idioma
  const locale = language === 'es' ? 'es_ES' : 'en_US';
  const alternateLocale = language === 'es' ? 'en_US' : 'es_ES';
  
  // URLs alternativas para hreflang
  const esPath = currentPath.replace('/en/', '/es/');
  const enPath = currentPath.replace('/es/', '/en/');
  const esUrl = `${baseUrl}${esPath}`;
  const enUrl = `${baseUrl}${enPath}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Hreflang Tags (idiomas alternativos) */}
      <link rel="alternate" hreflang="es" href={esUrl} />
      <link rel="alternate" hreflang="en" href={enUrl} />
      <link rel="alternate" hreflang="x-default" href={esUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      {metaImage && <meta property="og:image:width" content="1200" />}
      {metaImage && <meta property="og:image:height" content="630" />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
      
      {/* Article específico (para posts de blog) */}
      {article && type === 'article' && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.length > 0 && 
            article.tags.map((tag, index) => (
              <meta key={index} property="article:tag" content={tag} />
            ))
          }
        </>
      )}
    </Helmet>
  );
}