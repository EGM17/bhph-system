import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Gauge, Calendar, Phone, Mail, Heart } from 'lucide-react';
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
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inventario
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Imágenes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Imagen Principal */}
              <div className="relative aspect-video bg-gray-200">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url || primaryImage?.url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Descripción y Características */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
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
              {/* Título y Precio */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h1>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Precio</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${vehicle.price?.toLocaleString()}
                </p>
              </div>

              {/* Especificaciones Básicas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Año</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Millaje</p>
                    <p className="font-semibold">{vehicle.mileage?.toLocaleString()} mi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="font-semibold">Salem, OR</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="font-semibold">{vehicle.bodyClass || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Pago Mensual */}
              {vehicle.monthlyPaymentFrom && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700 font-medium mb-1">
                    Pago mensual desde
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    ${vehicle.monthlyPaymentFrom}
                    <span className="text-base font-normal">/mes</span>
                  </p>
                  {vehicle.downPaymentFrom && (
                    <p className="text-sm text-green-600 mt-2">
                      Enganche desde ${vehicle.downPaymentFrom.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  {showContactForm ? 'Cerrar Formulario' : 'Me Interesa Este Auto'}
                </button>

                <a
                  href="tel:5038789550"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold text-lg shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  Llamar Ahora
                </a>

                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  <Heart className="w-5 h-5" />
                  Guardar en Favoritos
                </button>
              </div>

              {/* Formulario de Contacto */}
              {showContactForm && (
                <form onSubmit={handleContactSubmit} className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Contáctanos
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre completo *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Teléfono *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Mensaje (opcional)"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-bold"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}