import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Gauge, Calendar, Phone, Mail, Heart, Zap } from 'lucide-react';
import { useVehicle } from '../../hooks/usePublicVehicles';
import { formatVehicleTitle } from '../../services/vinService';
import { createLead } from '../../services/leadService';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicle, loading, error } = useVehicle(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vehículo No Encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            El vehículo que buscas no está disponible o ha sido vendido.
          </p>
          <button
            onClick={() => navigate('/inventory')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ver Inventario
          </button>
        </div>
      </div>
    );
  }

  const title = formatVehicleTitle(vehicle);
  const images = vehicle.images || [];
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createLead({
        ...formData,
        vehicleId: vehicle.id,
        vehicleInfo: {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          price: vehicle.price
        }
      });

      alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.');
      setShowContactForm(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      alert('Error al enviar el formulario. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inventario
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda - Imágenes e Info */}
          <div className="lg:col-span-2">
            {/* Galería de Imágenes */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              {/* Imagen Principal */}
              <div className="aspect-[16/10] bg-gray-200 relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url || primaryImage?.url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                )}

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-lg">
                  <Heart className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-blue-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Descripción y Características */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Descripción
              </h2>

              {vehicle.description ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  No hay descripción disponible para este vehículo.
                </p>
              )}

              {vehicle.features && vehicle.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Características
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {vehicle.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Info y Contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              {/* Título y Badge */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {title}
                </h1>
                
                {/* Badge de tipo de financiamiento */}
                {isInHouseFinancing && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-lg">
                    0% DE INTERESES
                  </span>
                )}
                
                {isCashOnly && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold shadow-lg">
                    SOLO EFECTIVO
                  </span>
                )}
              </div>

              {/* Precio o Información de Financiamiento */}
              <div className="mb-6">
                {isInHouseFinancing ? (
                  // Financiamiento en Casa
                  <>
                    {vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom && (
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 mb-3">
                        <p className="text-sm text-orange-700 font-medium mb-2">
                          Pago mensual desde
                        </p>
                        <p className="text-4xl font-bold text-orange-700">
                          ${vehicle.monthlyPaymentFrom}
                          <span className="text-lg font-normal">/mes</span>
                        </p>
                        {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                          <p className="text-sm text-orange-600 mt-2">
                            Enganche desde ${vehicle.downPaymentFrom?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : isCashOnly ? (
                  // Solo Efectivo
                  vehicle.showPrice !== false && vehicle.price ? (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 text-center">
                      <p className="text-sm text-green-700 font-medium mb-2">Precio</p>
                      <p className="text-5xl font-bold text-green-700">
                        ${vehicle.price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-800 font-semibold mt-3 pt-3 border-t border-green-200">
                        💵 Pago completo al contado
                      </p>
                    </div>
                  ) : null
                ) : null}
              </div>

              {/* Especificaciones - CON MPG */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Año</p>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Millaje</p>
                    <p className="font-semibold text-gray-900">{vehicle.mileage?.toLocaleString()} mi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Carrocería</p>
                    <p className="font-semibold text-gray-900">{vehicle.bodyClass || 'Sedan'}</p>
                  </div>
                </div>

                {/* NUEVO: MPG en lugar de Stock# */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">MPG</p>
                    <p className="font-semibold text-gray-900">{vehicle.mpg || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Botones de Contacto - NUEVO DISEÑO MINIMALISTA */}
              <div className="space-y-3">
                {/* Botón Principal: Llamar (siempre visible y prominente) */}
                <a
                  href="tel:+15038789550"
                  className={`w-full px-6 py-4 rounded-xl transition font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${
                    vehicle.showPrice === false 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  {vehicle.showPrice === false ? 'Llamar' : 'Llamar Ahora'}
                </a>

                {/* Botón Secundario: Mensaje */}
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold text-base flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </div>

              {/* Ubicación */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="font-semibold text-gray-900">915 12th ST SE Salem, OR 97302</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Contacto Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Contactar Vendedor
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Estoy interesado en el ${title}`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-bold"
              >
                {submitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}