import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Loader } from 'lucide-react';
import VINDecoder from './VINDecoder';
import ImageUploader from './ImageUploader';
import { uploadMultipleImages } from '../../services/storageService';
import { createVehicle, updateVehicle } from '../../services/inventoryService';
import { formatVehicleTitle } from '../../services/vinService';

export default function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    // Información del VIN (autocompletada)
    vin: '',
    stockNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    bodyClass: '',
    mpg: '',
    
    // Información del dealer
    price: 0,
    showPrice: true,
    mileage: 0,
    condition: 'used',
    status: 'available',
    
    // Tipo de financiamiento
    financingType: 'in-house',
    
    // Imágenes
    images: [],
    
    // Descripción (mantener retrocompatibilidad)
    description: '',
    features: [],
    
    // 🆕 NUEVO: Campos bilingües
    description_es: '',
    description_en: '',
    features_es: [],
    features_en: [],
    
    // Financiamiento
    downPaymentFrom: 0,
    monthlyPaymentFrom: 0,
    showDownPayment: true,
    showMonthlyPayment: true,
    
    // Metadata
    isFeatured: false,
    isPublished: false
  });

  const [images, setImages] = useState(vehicle?.images || []);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  
  // 🆕 NUEVO: Estados para features bilingües
  const [newFeature_es, setNewFeature_es] = useState('');
  const [newFeature_en, setNewFeature_en] = useState('');
  
  const [vinDecoded, setVinDecoded] = useState(!!vehicle);

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
      setImages(vehicle.images || []);
      setVinDecoded(true);
    }
  }, [vehicle]);

  const handleVehicleDecoded = (vehicleInfo) => {
    setFormData(prev => ({
      ...prev,
      ...vehicleInfo
    }));
    setVinDecoded(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : 
              value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  // 🆕 NUEVO: Funciones para características bilingües
  const addFeature_es = () => {
    if (newFeature_es.trim()) {
      setFormData(prev => ({
        ...prev,
        features_es: [...(prev.features_es || []), newFeature_es.trim()]
      }));
      setNewFeature_es('');
    }
  };

  const addFeature_en = () => {
    if (newFeature_en.trim()) {
      setFormData(prev => ({
        ...prev,
        features_en: [...(prev.features_en || []), newFeature_en.trim()]
      }));
      setNewFeature_en('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // 🆕 NUEVO: Funciones para eliminar características bilingües
  const removeFeature_es = (index) => {
    setFormData(prev => ({
      ...prev,
      features_es: (prev.features_es || []).filter((_, i) => i !== index)
    }));
  };

  const removeFeature_en = (index) => {
    setFormData(prev => ({
      ...prev,
      features_en: (prev.features_en || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vinDecoded) {
      alert('Por favor decodifica el VIN primero');
      return;
    }

    if (images.length === 0) {
      alert('Por favor agrega al menos una imagen');
      return;
    }

    setSaving(true);

    try {
      let uploadedImages = [];

      if (vehicle) {
        // Editar vehículo existente
        const newImages = images.filter(img => img.file);
        const existingImages = images.filter(img => !img.file);

        if (newImages.length > 0) {
          const uploaded = await uploadMultipleImages(newImages, vehicle.id);
          uploadedImages = [...existingImages, ...uploaded];
        } else {
          uploadedImages = existingImages;
        }

        await updateVehicle(vehicle.id, {
          ...formData,
          images: uploadedImages
        });
      } else {
        // Crear nuevo vehículo
        const tempId = `temp_${Date.now()}`;
        uploadedImages = await uploadMultipleImages(images, tempId);

        const vehicleId = await createVehicle({
          ...formData,
          images: []
        });

        uploadedImages = uploadedImages.map(img => ({
          ...img,
          url: img.url.replace(tempId, vehicleId)
        }));

        await updateVehicle(vehicleId, { images: uploadedImages });
      }

      onSave();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      alert('Error al guardar el vehículo: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </h1>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !vinDecoded}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Vehículo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* VIN Decoder */}
        {!vehicle && (
          <VINDecoder onVehicleDecoded={handleVehicleDecoded} />
        )}

        {vinDecoded && (
          <>
            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                🚗 Información del Vehículo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIN *
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="17 caracteres"
                    required
                    disabled={!!vehicle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Stock
                  </label>
                  <input
                    type="text"
                    name="stockNumber"
                    value={formData.stockNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generado si se deja vacío"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Toyota, Honda, Ford"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Camry, Civic, F-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versión/Trim
                  </label>
                  <input
                    type="text"
                    name="trim"
                    value={formData.trim}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: LX, EX, Sport"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Carrocería
                  </label>
                  <input
                    type="text"
                    name="bodyClass"
                    value={formData.bodyClass}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Sedan, SUV, Pickup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MPG
                  </label>
                  <input
                    type="text"
                    name="mpg"
                    value={formData.mpg}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 25 city / 32 hwy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Millaje *
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 50000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condición *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="new">Nuevo</option>
                    <option value="used">Usado</option>
                    <option value="certified">Certificado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="available">Disponible</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tipo de Financiamiento y Precio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                💰 Financiamiento y Precio
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Financiamiento *
                  </label>
                  <select
                    name="financingType"
                    value={formData.financingType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="in-house">Financiamiento en Casa (0% Interés)</option>
                    <option value="cash-only">Solo Efectivo</option>
                  </select>
                </div>

                {formData.financingType === 'in-house' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          name="showDownPayment"
                          checked={formData.showDownPayment}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        Mostrar Enganche
                      </label>
                      {formData.showDownPayment && (
                        <input
                          type="number"
                          name="downPaymentFrom"
                          value={formData.downPaymentFrom}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enganche desde..."
                        />
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          name="showMonthlyPayment"
                          checked={formData.showMonthlyPayment}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        Mostrar Pago Mensual
                      </label>
                      {formData.showMonthlyPayment && (
                        <input
                          type="number"
                          name="monthlyPaymentFrom"
                          value={formData.monthlyPaymentFrom}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Pago mensual desde..."
                        />
                      )}
                    </div>
                  </div>
                )}

                {formData.financingType === 'cash-only' && (
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <input
                        type="checkbox"
                        name="showPrice"
                        checked={formData.showPrice}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      Mostrar Precio
                    </label>
                    {formData.showPrice && (
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Precio del vehículo"
                      />
                    )}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Puedes ocultar cualquier dato individualmente sin afectar los demás.
                  </p>
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                📸 Imágenes del Vehículo
              </h2>
              <ImageUploader 
                images={images} 
                onChange={setImages}
                maxImages={20}
              />
            </div>

            {/* 🆕 NUEVO: Descripción y Características BILINGÜES */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                📝 Descripción y Características
              </h2>
              
              <div className="space-y-6">
                {/* Descripción en Español */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Vehículo (Español)
                  </label>
                  <textarea
                    name="description_es"
                    value={formData.description_es || formData.description || ''}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe el vehículo, su estado, historial, etc..."
                  />
                </div>

                {/* Descripción en Inglés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Vehículo (English)
                  </label>
                  <textarea
                    name="description_en"
                    value={formData.description_en || ''}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the vehicle, its condition, history, etc..."
                  />
                </div>

                {/* Características en Español */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características Especiales (Español)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature_es}
                      onChange={(e) => setNewFeature_es(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature_es();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Sistema de navegación GPS"
                    />
                    <button
                      type="button"
                      onClick={addFeature_es}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Agregar
                    </button>
                  </div>

                  {(formData.features_es || formData.features || []).length > 0 && (
                    <div className="space-y-2">
                      {(formData.features_es || formData.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                          <span className="flex-1">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature_es(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Características en Inglés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características Especiales (English)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature_en}
                      onChange={(e) => setNewFeature_en(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature_en();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: GPS Navigation System"
                    />
                    <button
                      type="button"
                      onClick={addFeature_en}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>

                  {(formData.features_en || []).length > 0 && (
                    <div className="space-y-2">
                      {(formData.features_en || []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                          <span className="flex-1">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature_en(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                ⚙️ Opciones de Publicación
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Publicar en el sitio web</p>
                    <p className="text-sm text-gray-600">El vehículo será visible para el público</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Marcar como destacado</p>
                    <p className="text-sm text-gray-600">Aparecerá en la sección de vehículos destacados</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {formData.make && formData.model && formData.year && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Vista Previa del Título
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatVehicleTitle(formData)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}