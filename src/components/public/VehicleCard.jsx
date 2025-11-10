import { ArrowRight, Gauge, MapPin, Calendar, Heart } from 'lucide-react';
import { formatVehicleTitle } from "../../services/vinService";

export default function VehicleCard({ vehicle, featured = false }) {
  const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
  const title = formatVehicleTitle(vehicle);
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';

  return (
    <a 
      href={`/vehicle/${vehicle.id}`}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden block"
    >
      {/* Image Container - SIN PRECIO */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}

        {/* Badges - NUEVO SISTEMA */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {featured && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ DESTACADO
            </span>
          )}
          
          {/* Badge según tipo de financiamiento */}
          {isInHouseFinancing && (
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🏷️ 0% INTERESES
            </span>
          )}
          
          {isCashOnly && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              💵 SOLO EFECTIVO
            </span>
          )}

          {vehicle.condition === 'certified' && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ✓ CERTIFICADO
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Agregar a favoritos
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-lg opacity-0 group-hover:opacity-100"
        >
          <Heart className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
          {title}
        </h3>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Gauge className="w-4 h-4 flex-shrink-0" />
            <span>{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{vehicle.bodyClass || 'Sedan'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>Salem, OR</span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{vehicle.features.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Información según tipo de financiamiento */}
        {isInHouseFinancing ? (
          // Vehículos con Financiamiento en Casa
          vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-orange-700 font-medium mb-1">Pago mensual desde</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-orange-700">
                  ${vehicle.monthlyPaymentFrom}
                </p>
                <p className="text-sm text-orange-600">/mes</p>
              </div>
              {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                <p className="text-xs text-orange-600 mt-1">
                  Enganche desde ${vehicle.downPaymentFrom?.toLocaleString()}
                </p>
              )}
            </div>
          ) : null
        ) : isCashOnly ? (
          // Vehículos Solo Efectivo - Muestra precio si está habilitado
          vehicle.showPrice !== false && vehicle.price ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-green-700 font-medium mb-1">Precio</p>
              <p className="text-3xl font-bold text-green-700">
                ${vehicle.price?.toLocaleString()}
              </p>
              <p className="text-xs text-green-800 font-semibold mt-2">
                PRECIO PROMOCIONAL
              </p>
            </div>
          ) : null
        ) : null}

        {/* CTA Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition">
            Ver Detalles
          </span>
          <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </a>
  );
}