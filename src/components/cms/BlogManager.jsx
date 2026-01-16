import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Globe, FileText, X } from 'lucide-react';
import {
  getAllBlogPosts,
  deleteBlogPost,
  getAllBlogCategories
} from '../../services/blogService';

export default function BlogManager({ onClose, onNew, onEdit, onView }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category_id: '',
    language: '',
    status: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getAllBlogPosts(filters),
        getAllBlogCategories()
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('¿Estás seguro de eliminar este post? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      await loadData();
    } catch (error) {
      console.error('Error eliminando post:', error);
      alert('Error al eliminar el post');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || ''
    }));
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      language: '',
      status: ''
    });
    setSearchTerm('');
  };

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower)
    );
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_es : 'Sin categoría';
  };

  const hasActiveFilters = filters.category_id || filters.language || filters.status || searchTerm;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Posts del Blog</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>

            <button
              onClick={onNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Nuevo Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name_es}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los idiomas</option>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value=""
                  checked={filters.status === ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={filters.status === 'published'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Publicados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={filters.status === 'draft'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Borradores</span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay posts
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters 
                ? 'No se encontraron posts con los filtros seleccionados' 
                : 'Comienza creando tu primer post'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={onNew}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Crear Primer Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                        
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {post.language === 'es' ? 'Español' : 'English'}
                        </span>
                        
                        {post.category_id && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {getCategoryName(post.category_id)}
                          </span>
                        )}
                      </div>
                    </div>

                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {post.publishedAt 
                          ? new Date(post.publishedAt.toDate()).toLocaleDateString('es-ES')
                          : new Date(post.createdAt.toDate()).toLocaleDateString('es-ES')}
                      </span>
                      <span>•</span>
                      <span>{post.views || 0} vistas</span>
                      {post.keywords && post.keywords.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{post.keywords.length} keywords</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onView(post)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(post)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}