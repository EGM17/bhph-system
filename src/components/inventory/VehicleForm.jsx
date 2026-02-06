import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Loader } from 'lucide-react';
import VINDecoder from './VINDecoder';
import ImageUploader from './ImageUploader';
import { formatVehicleTitle } from '../../services/vinService';

export default function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    vin: '',
    stockNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    bodyClass: '',
    mpg: '',
    price: 0,
    showPrice: true,
    mileage: 0,
    condition: 'used',
    status: 'available',
    financingType: 'in-house',
    images: [],
    description: '',
    features: [],
    downPaymentFrom: 0,
    monthlyPaymentFrom: 0,
    showDownPayment: true,
    showMonthlyPayment: true,
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

  // ✅ SOLUCIÓN: VehicleForm NO crea vehículos, solo prepara datos
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
      console.log('📝 Preparando datos del vehículo');
      
      // ✅ Simplemente pasar los datos al padre
      // El padre (useInventory) maneja la creación/actualización y subida de imágenes
      const vehicleDataToSave = {
        ...formData,
        images: images  // Pasar array completo de imágenes
      };

      await onSave(vehicleDataToSave);
      
      console.log('✅ Datos enviados exitosamente');

    } catch (error) {
      console.error('❌ Error guardando vehículo:', error);
      alert('Error al guardar el vehículo. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const vehicleTitle = formData.make && formData.model 
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
          
          {!vehicle && (
            <VINDecoder onVehicleDecoded={handleVehicleDecoded} />
          )}

          {vinDecoded && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  Información del Vehículo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VIN *</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Stock</label>
                    <input
                      type="text"
                      name="stockNumber"
                      value={formData.stockNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: A1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Toyota, Honda, Ford"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Camry, Civic, F-150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Versión/Trim</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Carrocería</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Millaje (mi)</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="85000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MPG</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condición</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="used">Usado</option>
                      <option value="certified">Certificado</option>
                      <option value="new">Nuevo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
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

              {/* Precios */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  💰 Precios y Financiamiento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio del Vehículo</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="18000"
                        />
                      </div>
                      <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="showPrice"
                          checked={formData.showPrice}
                          onChange={handleChange}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Mostrar</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Financiamiento</label>
                    <select
                      name="financingType"
                      value={formData.financingType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in-house">Financiamiento Interno (In-House)</option>
                      <option value="bank">Financiamiento Bancario</option>
                      <option value="cash-only">Solo Efectivo</option>
                    </select>
                  </div>

                  {formData.financingType === 'in-house' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enganche Desde</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="downPaymentFrom"
                              value={formData.downPaymentFrom}
                              onChange={handleChange}
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="2000"
                            />
                          </div>
                          <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              name="showDownPayment"
                              checked={formData.showDownPayment}
                              onChange={handleChange}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Mostrar</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mensualidad Desde</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              name="monthlyPaymentFrom"
                              value={formData.monthlyPaymentFrom}
                              onChange={handleChange}
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="350"
                            />
                          </div>
                          <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              name="showMonthlyPayment"
                              checked={formData.showMonthlyPayment}
                              onChange={handleChange}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Mostrar</span>
                          </label>
                        </div>
                      </div>
                    </>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el vehículo..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Características Especiales</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: GPS"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </div>
                    
                    {formData.features && formData.features.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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

              {/* Publicación */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                  ⚙️ Opciones de Publicación
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="rounded w-5 h-5"
                    />
                    <div>
                      <span className="block font-medium text-gray-800">⭐ Vehículo Destacado</span>
                      <span className="text-sm text-gray-600">Aparecerá en la sección de destacados</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="rounded w-5 h-5"
                    />
                    <div>
                      <span className="block font-medium text-gray-800">🌐 Publicar en el sitio web</span>
                      <span className="text-sm text-gray-600">Visible para clientes</span>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}