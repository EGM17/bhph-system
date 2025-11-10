import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Gauge } from 'lucide-react';
import { useFeaturedVehicles } from '../../hooks/usePublicVehicles';
import { formatVehicleTitle } from '../../services/vinService';

export default function FeaturedVehicles() {
  const { vehicles, loading } = useFeaturedVehicles(6);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando vehículos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            DESTACADOS
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Vehículos más populares
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra selección de autos más buscados con las mejores condiciones
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="w-full flex-shrink-0 px-2">
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {vehicles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-blue-600' 
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/inventory"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg hover:shadow-xl group"
          >
            Ver todo el inventario
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Vehicle Card Component
function VehicleCard({ vehicle }) {
  const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
  const title = formatVehicleTitle(vehicle);
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';

  return (
    <a 
      href={`/vehicle/${vehicle.id}`}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Image - SIN PRECIO */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            DESTACADO
          </span>
          
          {isInHouseFinancing && (
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              0% INTERESES
            </span>
          )}
          
          {isCashOnly && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              SOLO EFECTIVO
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
          {title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Salem, OR</span>
          </div>
        </div>

        {/* Información según tipo */}
        {isInHouseFinancing ? (
          vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-orange-700 font-medium">Pago mensual desde</p>
              <p className="text-2xl font-bold text-orange-700">
                ${vehicle.monthlyPaymentFrom}
                <span className="text-sm font-normal">/mes</span>
              </p>
              {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                <p className="text-xs text-orange-600 mt-1">
                  Enganche desde ${vehicle.downPaymentFrom?.toLocaleString()}
                </p>
              )}
            </div>
          ) : null
        ) : isCashOnly ? (
          vehicle.showPrice !== false && vehicle.price ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-green-700 font-medium">Precio</p>
              <p className="text-3xl font-bold text-green-700">
                ${vehicle.price?.toLocaleString()}
              </p>
               <p className="text-xs text-green-700 font-medium">
                PRECIO PROMOCIONAL
              </p>
            </div>
          ) : null
        ) : null}

        {/* CTA */}
        <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
          <span>Ver detalles</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </a>
  );
}