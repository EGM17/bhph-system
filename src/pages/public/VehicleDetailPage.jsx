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
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inventario
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda - Imágenes e Info */}
          <div className="lg:col-span-2">
            {/* Galería de Imágenes */}
            <div className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-100">
              {/* Imagen Principal */}
              <div className="aspect-[16/10] bg-gray-50 relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url || primaryImage?.url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                )}

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition shadow-sm border border-gray-100">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2 bg-gray-50">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
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
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Características
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vehicle.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
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
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-4">
              {/* Título */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {title}
                </h1>
                
                {/* Badge discreto */}
                {isInHouseFinancing && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Sin intereses
                  </span>
                )}
                
                {isCashOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                    Solo efectivo
                  </span>
                )}
              </div>

              {/* Precio o Información de Financiamiento - Diseño Limpio */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                {isInHouseFinancing ? (
                  // Financiamiento en Casa
                  <>
                    {vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                          Pago mensual
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-4xl font-bold text-gray-900">
                            ${vehicle.monthlyPaymentFrom}
                          </span>
                          <span className="text-lg text-gray-500 font-medium">/mes</span>
                        </div>
                        {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                          <p className="text-sm text-gray-600">
                            Enganche desde <span className="font-semibold text-gray-900">${vehicle.downPaymentFrom?.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : isCashOnly ? (
                  // Solo Efectivo
                  vehicle.showPrice !== false && vehicle.price ? (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Precio
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${vehicle.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : null
                ) : null}
              </div>

              {/* Especificaciones */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">
                  Especificaciones
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Año</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Millaje</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.mileage?.toLocaleString()} mi</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500">Carrocería</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.bodyClass || 'Sedan'}</p>
                  </div>

                  {/* MPG */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">MPG</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.mpg || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Botones de Contacto - Diseño Limpio */}
              <div className="space-y-3">
                {/* Botón Principal: Llamar */}
                <a
                  href="tel:+15038789550"
                  className={`w-full px-6 py-3.5 rounded-lg transition font-semibold text-base flex items-center justify-center gap-2 ${
                    vehicle.showPrice === false 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  {vehicle.showPrice === false ? 'Llamar' : 'Llamar Ahora'}
                </a>

                {/* Botón Secundario: Mensaje */}
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition font-semibold text-base flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Enviar Mensaje
                </button>
              </div>

              {/* Ubicación */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="font-semibold text-gray-900">Salem, Oregon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Contacto Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Contactar Vendedor
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Estoy interesado en el ${title}`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-sm"
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