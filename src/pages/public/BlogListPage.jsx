import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/SEO'; // 🆕 NUEVO
import {
  getPublishedBlogPosts,
  getActiveBlogCategories,
  getBlogCategoryById
} from '../../services/blogService';

export default function BlogListPage() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [language, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = {
        language,
        limit: 20
      };

      if (selectedCategory) {
        filters.category_id = selectedCategory;
      }

      const [postsData, categoriesData] = await Promise.all([
        getPublishedBlogPosts(filters),
        getActiveBlogCategories()
      ]);

      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando posts:', error);
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return language === 'es' ? category.name_es : category.name_en;
  };

  const getPostUrl = (slug) => {
    return `/${language}/blog/${slug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <SEO 
        title={language === 'es' ? 'Blog' : 'Blog'}
        description={
          language === 'es'
            ? 'Consejos, noticias y guías sobre financiamiento automotriz en Salem, Oregon. Aprende todo sobre Buy Here Pay Here y compra de autos sin crédito.'
            : 'Tips, news and guides about auto financing in Salem, Oregon. Learn everything about Buy Here Pay Here and buying cars with no credit.'
        }
        keywords={[
          'blog autos salem',
          'consejos financiamiento',
          'buy here pay here',
          'comprar auto sin credito',
          'guias automotrices'
        ]}
        type="website"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'es' ? 'Blog' : 'Blog'}
          </h1>
          <p className="text-xl text-blue-100">
            {language === 'es' 
              ? 'Consejos, noticias y guías sobre financiamiento automotriz'
              : 'Tips, news and guides about auto financing'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {language === 'es' ? 'Todos' : 'All'}
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {language === 'es' ? category.name_es : category.name_en}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">
                {language === 'es' ? 'Cargando posts...' : 'Loading posts...'}
              </p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {language === 'es' 
                ? 'No hay posts disponibles'
                : 'No posts available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Featured Image */}
                {post.featured_image && (
                  <Link to={getPostUrl(post.slug)}>
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover hover:opacity-90 transition"
                    />
                  </Link>
                )}

                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {post.category_id && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {getCategoryName(post.category_id)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={getPostUrl(post.slug)}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <Link
                    to={getPostUrl(post.slug)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    {language === 'es' ? 'Leer más' : 'Read more'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}