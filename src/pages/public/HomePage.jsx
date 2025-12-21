import Hero from '../../components/public/Hero';
import FeaturedVehicles from '../../components/public/FeaturedVehicles';
import { CheckCircle, DollarSign, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedVehicles />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Más de 15 años ayudando a familias a obtener su auto ideal, sin crédito, sin ITIN, sin SSN y sin intereses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                Aprobación garantizada
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                Todos son aprobados sin importar su historial de crédito
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                Proceso rápido
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                Acude con los requisitos a nuestra sucursal y maneja el mismo día
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                Pagos flexibles
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                Planes de pago ajustados a tu presupuesto y sin intereses
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 px-8">
            ¿Listo para manejar<br className="sm:hidden" /> un nuevo auto?
          </h2>
          <p className="text-base md:text-lg lg:text-lg mb-8 px-6 max-w-2xl mx-auto">
            Visítanos hoy o llámanos para comenzar tu proceso de financiamiento
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <a
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
            >
              Ver inventario
            </a>
            <a
              href="tel:+15038789550"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}