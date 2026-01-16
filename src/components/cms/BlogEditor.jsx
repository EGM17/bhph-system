import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Globe, Image as ImageIcon, Tag, Search as SearchIcon } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import {
  createBlogPost,
  updateBlogPost,
  getAllBlogCategories
} from '../../services/blogService';
import { uploadVehicleImage } from '../../services/storageService';

export default function BlogEditor({ post = null, onSave, onCancel }) {
  const isEditing = !!post;
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    language: post?.language || 'es',
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featured_image: post?.featured_image || '',
    category_id: post?.category_id || '',
    keywords: post?.keywords || [],
    status: post?.status || 'draft',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
  });

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  // Auto-generate SEO title from title
  useEffect(() => {
    if (!formData.seo_title && formData.title) {
      setFormData(prev => ({ 
        ...prev, 
        seo_title: formData.title.substring(0, 60) 
      }));
    }
  }, [formData.title]);

  const loadCategories = async () => {
    try {
      const data = await getAllBlogCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleContentChange = (html) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Usar el mismo servicio de storage que los vehículos
      // Crear un ID temporal para el blog post
      const tempId = `blog_${Date.now()}`;
      const result = await uploadVehicleImage(file, tempId, 0);
      
      setFormData(prev => ({ ...prev, featured_image: result.url }));
      setSuccess('Imagen subida correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setError('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    
    if (formData.keywords.includes(newKeyword.trim())) {
      setError('Esta keyword ya existe');
      return;
    }

    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim()]
    }));
    setNewKeyword('');
    setError('');
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return false;
    }

    if (!formData.slug.trim()) {
      setError('El slug es obligatorio');
      return false;
    }

    if (!formData.category_id) {
      setError('Debes seleccionar una categoría');
      return false;
    }

    if (!formData.content || formData.content === '<p></p>') {
      setError('El contenido no puede estar vacío');
      return false;
    }

    return true;
  };

  const handleSave = async (status) => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const postData = {
        ...formData,
        status,
        author: 'Admin' // TODO: Get from auth context
      };

      if (isEditing) {
        await updateBlogPost(post.id, postData);
      } else {
        await createBlogPost(postData);
      }

      setSuccess(`Post ${status === 'published' ? 'publicado' : 'guardado'} correctamente`);
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (error) {
      console.error('Error guardando post:', error);
      setError(error.message || 'Error al guardar el post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Editar Post' : 'Nuevo Post'}
                </h1>
                <p className="text-sm text-gray-600">
                  {formData.language === 'es' ? 'Español' : 'English'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                Guardar Borrador
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                <Eye className="w-4 h-4" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma del Post *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="es"
                    checked={formData.language === 'es'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <Globe className="w-4 h-4" />
                  <span>🇪🇸 Español</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={formData.language === 'en'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <Globe className="w-4 h-4" />
                  <span>🇬🇧 English</span>
                </label>
              </div>
            </div>

            {/* Title & Slug */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Post *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 5 Consejos para Comprar Auto sin Crédito"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="consejos-comprar-auto-sin-credito"
                  required
                  pattern="[a-z0-9\-]+"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blog/{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extracto (max 150 caracteres)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  maxLength={150}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve descripción del post..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/150 caracteres
                </p>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contenido *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="Escribe el contenido del post aquí..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {formData.language === 'es' ? cat.name_es : cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen Destacada
              </label>
              
              {formData.featured_image ? (
                <div className="space-y-3">
                  <img 
                    src={formData.featured_image} 
                    alt="Featured" 
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Eliminar imagen
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="featured-image"
                    disabled={uploadingImage}
                  />
                  <label 
                    htmlFor="featured-image"
                    className="cursor-pointer"
                  >
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadingImage ? 'Subiendo...' : 'Click para subir imagen'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, WebP (máx. 5MB)
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (SEO)
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Agregar keyword"
                />
                <button
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  +
                </button>
              </div>

              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {keyword}
                      <button
                        onClick={() => removeKeyword(index)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                SEO
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (max 60 chars)
                  </label>
                  <input
                    type="text"
                    name="seo_title"
                    value={formData.seo_title}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo_title.length}/60
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description (max 155 chars)
                  </label>
                  <textarea
                    name="seo_description"
                    value={formData.seo_description}
                    onChange={handleChange}
                    maxLength={155}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.seo_description.length}/155
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}