import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Loader } from 'lucide-react';
import VINDecoder from './VINDecoder';
import ImageUploader from './ImageUploader';
import { uploadMultipleImages } from '../../services/storageService';
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
    mpg: '', // NUEVO: Millas por galón (opcional)
    
    // Información del dealer
    price: 0,
    showPrice: true, // Controla si se muestra el precio
    mileage: 0,
    condition: 'used',
    status: 'available',
    
    // NUEVO: Tipo de financiamiento
    financingType: 'in-house', // 'in-house' o 'cash-only'
    
    // Imágenes
    images: [],
    
    // Descripción
    description: '',
    features: [],
    
    // Financiamiento (INDEPENDIENTES entre sí)
    downPaymentFrom: 0,
    monthlyPaymentFrom: 0,
    showDownPayment: true, // Controla si se muestra enganche
    showMonthlyPayment: true, // Controla si se muestra pago mensual
    
    // Metadata
    isFeatured: false,
    isPublished: false
  });

  const [images, setImages] = useState(vehicle?.images || []);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
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

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vinDecoded) {
      alert('Por favor decodifica el VIN primero');
      return;
    }

    if (images.length === 0) {
      alert('Por favor agrega al menos una imagen del vehículo');
      return;
    }

    setSaving(true);

    try {
      let imageUrls = [];

      // Si hay imágenes nuevas (Files), subirlas
      const newImages = images.filter(img => img.file);
      const existingImages = images.filter(img => img.url && !img.file);

      if (newImages.length > 0) {
        // Generar ID temporal si es nuevo vehículo
        const vehicleId = vehicle?.id || `temp_${Date.now()}`;
        
        const uploadedImages = await uploadMultipleImages(
          newImages.map(img => img.file),
          vehicleId,
          (current, total) => {
            console.log(`Subiendo imagen ${current}/${total}`);
          }
        );

        imageUrls = [...existingImages, ...uploadedImages];
      } else {
        imageUrls = existingImages;
      }

      // Ordenar imágenes por orden y asegurar isPrimary
      const sortedImages = imageUrls
        .sort((a, b) => a.order - b.order)
        .map((img, index) => ({
          ...img,
          order: index,
          isPrimary: img.isPrimary || index === 0
        }));

      const vehicleData = {
        ...formData,
        images: sortedImages
      };

      await onSave(vehicleData);
      
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      alert('Error al guardar el vehículo: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const vehicleTitle = vinDecoded 
    ? formatVehicleTitle(formData)
    : 'Nuevo Vehículo';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {vehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">{vehicleTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {/* TODO: Preview */}}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <Eye className="w-4 h-4" />
                Vista Previa
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={saving || !vinDecoded}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {vehicle ? 'Actualizar' : 'Guardar'} Vehículo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* VIN Decoder - Solo si es nuevo */}
          {!vehicle && (
            <VINDecoder onVehicleDecoded={handleVehicleDecoded} />
          )}

          {/* Información del Vehículo */}
          {vinDecoded && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  Información del Vehículo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VIN *
                    </label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock # *
                    </label>
                    <input
                      type="text"
                      name="stockNumber"
                      value={formData.stockNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      required
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trim
                    </label>
                    <input
                      type="text"
                      name="trim"
                      value={formData.trim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="EX, LX, Sport, etc."
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
                      placeholder="Sedan, SUV, Truck, etc."
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
                      required
                    />
                  </div>

                  {/* NUEVO: MPG */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MPG (Opcional)
                    </label>
                    <input
                      type="text"
                      name="mpg"
                      value={formData.mpg}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 25 city / 30 hwy"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Millas por galón (ciudad/carretera)
                    </p>
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
                </div>
              </div>

              {/* NUEVO: Toggle Tipo de Financiamiento */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  🏦 Tipo de Venta
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.financingType === 'in-house' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="financingType"
                        value="in-house"
                        checked={formData.financingType === 'in-house'}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏦</span>
                          <span className="font-semibold text-gray-900">Financiamiento en Casa</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          0% intereses - Pagos semanales o quincenales
                        </p>
                      </div>
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.financingType === 'cash-only' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="financingType"
                        value="cash-only"
                        checked={formData.financingType === 'cash-only'}
                        onChange={handleChange}
                        className="w-5 h-5 text-green-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💵</span>
                          <span className="font-semibold text-gray-900">Solo Efectivo</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pago completo al momento de la compra
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Precio y Opciones de Visualización */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  💰 Precio y Opciones de Visualización
                </h2>
                
                <div className="space-y-6">
                  {/* Precio */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Venta *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showPrice"
                          checked={formData.showPrice !== false}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Mostrar precio público
                          </span>
                          <p className="text-xs text-gray-500">
                            Visible en el sitio web
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Opciones de Financiamiento - Solo visible si es in-house */}
                  {formData.financingType === 'in-house' && (
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          📊 Información de Financiamiento
                        </h3>
                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                          0% INTERESES
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pago Mensual Desde
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="monthlyPaymentFrom"
                              value={formData.monthlyPaymentFrom}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="350"
                            />
                          </div>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="showMonthlyPayment"
                              checked={formData.showMonthlyPayment !== false}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">
                              Mostrar en el sitio web
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enganche Desde
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="downPaymentFrom"
                              value={formData.downPaymentFrom}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="2000"
                            />
                          </div>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="showDownPayment"
                              checked={formData.showDownPayment !== false}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">
                              Mostrar en el sitio web
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>💡 Importante:</strong> Los checkboxes controlan qué información se muestra públicamente. 
                          Puedes ocultar cualquier dato individualmente sin afectar los demás.
                        </p>
                      </div>
                    </div>
                  )}
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

              {/* Descripción */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  📝 Descripción y Características
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del Vehículo
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el vehículo, su estado, historial, etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Características Especiales
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Bluetooth, Cámara de reversa, Asientos de cuero..."
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Agregar
                      </button>
                    </div>

                    {formData.features && formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuración de Publicación */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  ⚙️ Configuración de Publicación
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        ⭐ Vehículo Destacado
                      </span>
                      <p className="text-xs text-gray-500">
                        Aparecerá en la sección de destacados del homepage
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        🌐 Publicar en el sitio web
                      </span>
                      <p className="text-xs text-gray-500">
                        El vehículo será visible para el público
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Vehículo
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Disponible</option>
                      <option value="pending">Pendiente</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}