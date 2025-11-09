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
    
    // Información del dealer
    price: 0,
    mileage: 0,
    condition: 'used',
    status: 'available',
    
    // Imágenes
    images: [],
    
    // Descripción
    description: '',
    features: [],
    
    // Financiamiento (opcional)
    downPaymentFrom: 0,
    monthlyPaymentFrom: 0,
    
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

              {/* Precio y Financiamiento */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  💰 Precio y Financiamiento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enganche Desde (opcional)
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pago Mensual Desde (opcional)
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
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="hover:text-blue-900"
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
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Publicar en sitio web</p>
                      <p className="text-sm text-gray-600">El vehículo será visible para el público</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Vehículo destacado</p>
                      <p className="text-sm text-gray-600">Aparecerá en la sección de destacados del inicio</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Inventario
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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