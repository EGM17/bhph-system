import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/SEO'; // 🆕 NUEVO
import {
  getBlogPostBySlug,
  incrementBlogPostViews,
  getBlogCategoryById
} from '../../services/blogService';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const postData = await getBlogPostBySlug(slug);

      if (!postData) {
        setNotFound(true);
        return;
      }

      // Verificar que el post está publicado y en el idioma correcto
      if (postData.status !== 'published' || postData.language !== language) {
        setNotFound(true);
        return;
      }

      setPost(postData);

      // Incrementar vistas
      incrementBlogPostViews(postData.id);

      // Cargar categoría
      if (postData.category_id) {
        const categoryData = await getBlogCategoryById(postData.category_id);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error cargando post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      // Copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'es' ? 'URL copiada al portapapeles' : 'URL copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">
            {language === 'es' ? 'Post no encontrado' : 'Post not found'}
          </p>
          <Link
            to={`/${language}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'es' ? 'Volver al blog' : 'Back to blog'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO 
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt || post.title}
        keywords={post.keywords || []}
        image={post.featured_image}
        type="article"
        article={{
          publishedTime: post.publishedAt ? post.publishedAt.toDate().toISOString() : null,
          modifiedTime: post.updatedAt ? post.updatedAt.toDate().toISOString() : null,
          author: post.author || 'El Compa Güero Auto Sales',
          section: category ? (language === 'es' ? category.name_es : category.name_en) : null,
          tags: post.keywords || []
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to={`/${language}/blog`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'es' ? 'Volver al blog' : 'Back to blog'}
        </Link>

        {/* Featured Image */}
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          {category && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              <Tag className="w-4 h-4" />
              {language === 'es' ? category.name_es : category.name_en}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt)}
          </span>
          <span>•</span>
          <span>{post.views || 0} {language === 'es' ? 'vistas' : 'views'}</span>
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            <Share2 className="w-4 h-4" />
            {language === 'es' ? 'Compartir' : 'Share'}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Keywords */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'es' ? 'Etiquetas:' : 'Tags:'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to={`/${language}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'es' ? 'Ver más posts' : 'View more posts'}
          </Link>
        </div>
      </article>

      {/* Add prose styles for content */}
      <style dangerouslySetInnerHTML={{__html: `
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }

        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }

        .prose h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }

        .prose p {
          margin: 1em 0;
          line-height: 1.75;
          color: #374151;
        }

        .prose ul,
        .prose ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }

        .prose li {
          margin: 0.5em 0;
          line-height: 1.75;
        }

        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1em;
          margin: 1.5em 0;
          color: #6b7280;
          font-style: italic;
        }

        .prose pre {
          background: #1f2937;
          color: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1em;
          overflow-x: auto;
          margin: 1.5em 0;
        }

        .prose code {
          background: #f3f4f6;
          color: #1f2937;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }

        .prose pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2em 0;
        }

        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }

        .prose a:hover {
          color: #1d4ed8;
        }

        .prose strong {
          font-weight: 600;
          color: #1f2937;
        }

        .prose em {
          font-style: italic;
        }
      `}} />
    </div>
  );
}