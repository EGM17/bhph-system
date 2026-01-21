import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedVehicles } from '../../hooks/usePublicVehicles';
import { formatVehicleTitle } from '../../services/vinService';
import { useLanguage } from '../../context/LanguageContext';

export default function FeaturedVehicles() {
  const { vehicles, loading } = useFeaturedVehicles(6);
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {language === 'es' ? 'Cargando vehículos destacados...' : 'Loading featured vehicles...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
              {language === 'es' ? 'Destacados' : 'Featured'}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {language === 'es' ? 'Vehículos destacados' : 'Featured Vehicles'}
          </h2>
          <p className="text-base md:text-lg lg:text-lg text-gray-600 max-w-2xl mx-auto px-6">
            {language === 'es' 
              ? 'Nuestra selección de vehículos más populares con las mejores condiciones'
              : 'Our selection of the most popular vehicles with the best conditions'}
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} language={language} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative mb-8 md:mb-12">
          <div 
            className="overflow-hidden rounded-xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="w-full flex-shrink-0 px-2">
                  <VehicleCard vehicle={vehicle} language={language} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center z-10 border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center z-10 border border-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {vehicles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-blue-600' 
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to={language === 'es' ? '/es/inventario' : '/en/inventory'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm hover:shadow-md"
          >
            {language === 'es' ? 'Ver todo el inventario' : 'View All Inventory'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// 🔥 COMPONENTE INTERNO CORREGIDO
function VehicleCard({ vehicle, language }) {
  const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
  const title = formatVehicleTitle(vehicle);
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';

  return (
    <Link 
      to={`${language === 'es' ? '/es/inventario' : '/en/inventory'}/${vehicle.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-gray-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
            {language === 'es' ? 'Destacado' : 'Featured'}
          </span>
          
          {isInHouseFinancing && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              {language === 'es' ? '0% Intereses' : '0% Interest'}
            </span>
          )}
          
          {isCashOnly && (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              {language === 'es' ? 'Solo Efectivo' : 'Cash Only'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
          {title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">Salem, OR</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 my-4"></div>

        {/* Pricing Information */}
        {isInHouseFinancing ? (
          vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom ? (
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl md:text-2xl font-bold text-gray-900">
                  ${vehicle.monthlyPaymentFrom}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {language === 'es' ? '/mes' : '/mo'}
                </span>
              </div>
              {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                <p className="text-xs text-gray-600">
                  {language === 'es' ? 'Enganche desde' : 'Down payment from'}{' '}
                  <span className="font-semibold text-gray-900">${vehicle.downPaymentFrom?.toLocaleString()}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 h-16"></div>
          )
        ) : isCashOnly ? (
          vehicle.showPrice !== false && vehicle.price ? (
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl md:text-2xl font-bold text-gray-900">
                  ${vehicle.price?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                {language === 'es' ? 'Pago al contado' : 'Cash payment'}
              </p>
            </div>
          ) : (
            <div className="mb-4 h-16"></div>
          )
        ) : (
          <div className="mb-4 h-16"></div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition">
            {language === 'es' ? 'Ver detalles' : 'View details'}
          </span>
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </Link>
  );
}