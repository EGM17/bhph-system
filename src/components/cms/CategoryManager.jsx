import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X, AlertCircle } from 'lucide-react';
import {
  getAllBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  reorderBlogCategories
} from '../../services/blogService';

export default function CategoryManager({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    name_es: '',
    name_en: '',
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.slug || !formData.name_es || !formData.name_en) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      if (editingCategory) {
        await updateBlogCategory(editingCategory.id, formData);
        setSuccess('Categoría actualizada correctamente');
      } else {
        const newOrder = categories.length + 1;
        await createBlogCategory({ ...formData, order: newOrder });
        setSuccess('Categoría creada correctamente');
      }
      
      await loadCategories();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error guardando categoría:', error);
      setError(error.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name_es: category.name_es,
      name_en: category.name_en,
      isActive: category.isActive
    });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteBlogCategory(categoryId);
      setSuccess('Categoría eliminada correctamente');
      await loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      setError(error.message || 'Error al eliminar la categoría');
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      name_es: '',
      name_en: '',
      isActive: true
    });
    setEditingCategory(null);
    setShowForm(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-generar slug desde name_es
    if (name === 'name_es' && !editingCategory) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    
    newCategories.splice(draggedItem, 1);
    newCategories.splice(index, 0, draggedCategory);
    
    setCategories(newCategories);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;
    
    // Actualizar orden en Firestore
    const categoriesWithOrder = categories.map((cat, index) => ({
      id: cat.id,
      order: index + 1
    }));
    
    try {
      await reorderBlogCategories(categoriesWithOrder);
      setSuccess('Orden actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error reordenando categorías:', error);
      setError('Error al actualizar el orden');
      await loadCategories(); // Recargar para revertir cambios visuales
    }
    
    setDraggedItem(null);
  };

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
              <h1 className="text-2xl font-bold text-gray-800">
                Categorías del Blog
              </h1>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Save className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre en Español *
                    </label>
                    <input
                      type="text"
                      name="name_es"
                      value={formData.name_es}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Consejos"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre en English *
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Tips"
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
                      placeholder="consejos"
                      required
                      pattern="[a-z0-9\-]+"
                      title="Solo letras minúsculas, números y guiones"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo letras minúsculas, números y guiones
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Categoría activa
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {saving ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Categorías ({categories.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Arrastra para reordenar
                </p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Cargando categorías...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-600">No hay categorías creadas</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Crear la primera categoría
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition cursor-move ${
                        draggedItem === index ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">
                            {category.name_es}
                          </h3>
                          <span className="text-sm text-gray-500">
                            / {category.name_en}
                          </span>
                          {!category.isActive && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-mono mt-1">
                          /{category.slug}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}