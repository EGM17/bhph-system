import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Gauge, Fuel, Settings, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVehicleById, incrementViewCount } from '../../services/inventoryService';
import { formatVehicleTitle } from '../../services/vinService';
import { useLanguage } from '../../context/LanguageContext';
import { createLead } from '../../services/leadService';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await getVehicleById(id);
      if (data) {
        setVehicle(data);
        await incrementViewCount(id);
      } else {
        navigate(language === 'es' ? '/es/inventario' : '/en/inventory');
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      navigate(language === 'es' ? '/es/inventario' : '/en/inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const title = formatVehicleTitle(vehicle);
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';
  const primaryImage = vehicle.images?.[selectedImageIndex];

  // 🆕 NUEVO: Obtener descripción según idioma
  const description = language === 'es' 
    ? (vehicle.description_es || vehicle.description) 
    : (vehicle.description_en || vehicle.description);

  // 🆕 NUEVO: Obtener características según idioma
  const features = language === 'es'
    ? (vehicle.features_es || vehicle.features || [])
    : (vehicle.features_en || vehicle.features || []);

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={language === 'es' ? '/es/inventario' : '/en/inventory'}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'es' ? 'Volver al inventario' : 'Back to inventory'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Imágenes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagen Principal */}
            <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-50">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                )}

                {vehicle.images && vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg hover:bg-white transition flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg hover:bg-white transition flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {vehicle.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === selectedImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${language === 'es' ? 'Vista' : 'View'} ${index + 1}`}
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
                {language === 'es' ? 'Descripción' : 'Description'}
              </h2>

              {description ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  {language === 'es' 
                    ? 'No hay descripción disponible para este vehículo.' 
                    : 'No description available for this vehicle.'}
                </p>
              )}

              {/* Características */}
              {features && features.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'es' ? 'Características' : 'Features'}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Información y Precio */}
          <div className="space-y-6">
            {/* Información Principal */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {title}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {isInHouseFinancing && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {language === 'es' ? 'Financiamiento 0% Interés' : '0% Interest Financing'}
                  </span>
                )}
                {isCashOnly && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {language === 'es' ? 'Solo Efectivo' : 'Cash Only'}
                  </span>
                )}
                {vehicle.condition === 'certified' && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {language === 'es' ? 'Certificado' : 'Certified'}
                  </span>
                )}
              </div>

              {/* Precio */}
              <div className="mb-6">
                {isInHouseFinancing ? (
                  vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom ? (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        {language === 'es' ? 'Pago mensual' : 'Monthly payment'}
                      </p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-gray-900">
                          ${vehicle.monthlyPaymentFrom}
                        </span>
                        <span className="text-lg text-gray-500 font-medium">
                          {language === 'es' ? '/mes' : '/mo'}
                        </span>
                      </div>
                      {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                        <p className="text-sm text-gray-600">
                          {language === 'es' ? 'Enganche desde' : 'Down payment from'}{' '}
                          <span className="font-semibold text-gray-900">${vehicle.downPaymentFrom?.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  ) : null
                ) : isCashOnly ? (
                  vehicle.showPrice !== false && vehicle.price ? (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        {language === 'es' ? 'Precio' : 'Price'}
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
                  {language === 'es' ? 'Especificaciones' : 'Specifications'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{language === 'es' ? 'Año' : 'Year'}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{language === 'es' ? 'Kilometraje' : 'Mileage'}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.mileage?.toLocaleString()} mi</p>
                  </div>

                  {vehicle.mpg && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">MPG</span>
                      </div>
                      <p className="font-semibold text-gray-900">{vehicle.mpg}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{language === 'es' ? 'Condición' : 'Condition'}</span>
                    </div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {vehicle.condition === 'new' ? (language === 'es' ? 'Nuevo' : 'New') :
                       vehicle.condition === 'used' ? (language === 'es' ? 'Usado' : 'Used') :
                       vehicle.condition === 'certified' ? (language === 'es' ? 'Certificado' : 'Certified') :
                       vehicle.condition}
                    </p>
                  </div>

                  {vehicle.vin && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">VIN</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm break-all">{vehicle.vin}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <a
                  href="tel:5038789550"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  {language === 'es' ? 'Llamar ahora' : 'Call Now'}
                </a>

                <Link
                  to={language === 'es' ? '/es/contacto' : '/en/contact'}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition font-bold"
                >
                  <Mail className="w-5 h-5" />
                  {language === 'es' ? 'Enviar mensaje' : 'Send Message'}
                </Link>
              </div>

              {/* Ubicación */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">El Compa Güero Auto Sales</p>
                    <p>915 12th St SE</p>
                    <p>Salem, OR 97302</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}