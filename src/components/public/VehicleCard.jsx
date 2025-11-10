import { ArrowRight, Gauge, MapPin, Calendar } from 'lucide-react';
import { formatVehicleTitle } from "../../services/vinService";

export default function VehicleCard({ vehicle, featured = false }) {
  const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
  const title = formatVehicleTitle(vehicle);
  const isInHouseFinancing = vehicle.financingType === 'in-house';
  const isCashOnly = vehicle.financingType === 'cash-only';

  return (
    <a 
      href={`/vehicle/${vehicle.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}

        {/* Badges Minimalistas */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {featured && (
            <span className="bg-gray-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              Destacado
            </span>
          )}
          
          {isInHouseFinancing && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              0% Intereses
            </span>
          )}
          
          {isCashOnly && (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              Solo Efectivo
            </span>
          )}

          {vehicle.condition === 'certified' && (
            <span className="bg-indigo-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
              Certificado
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
          {title}
        </h3>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium truncate">{vehicle.bodyClass || 'Sedan'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">Salem, OR</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 my-4"></div>

        {/* Pricing Information - Diseño Limpio */}
        {isInHouseFinancing ? (
          // Financiamiento en Casa
          vehicle.showMonthlyPayment !== false && vehicle.monthlyPaymentFrom ? (
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">
                  ${vehicle.monthlyPaymentFrom}
                </span>
                <span className="text-sm text-gray-500 font-medium">/mes</span>
              </div>
              {vehicle.showDownPayment !== false && vehicle.downPaymentFrom && (
                <p className="text-xs text-gray-600">
                  Enganche desde <span className="font-semibold text-gray-900">${vehicle.downPaymentFrom?.toLocaleString()}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 h-16"></div>
          )
        ) : isCashOnly ? (
          // Solo Efectivo
          vehicle.showPrice !== false && vehicle.price ? (
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">
                  ${vehicle.price?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                Pago al contado
              </p>
            </div>
          ) : (
            <div className="mb-4 h-16"></div>
          )
        ) : (
          <div className="mb-4 h-16"></div>
        )}

        {/* CTA Button */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition">
            Ver detalles
          </span>
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </a>
  );
}