import Hero from '../../components/public/Hero';
import FeaturedVehicles from '../../components/public/FeaturedVehicles';
import { CheckCircle, DollarSign, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedVehicles />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-xl text-gray-600">
              Más de 15 años ayudando a familias a obtener su auto ideal, sin crédito, sin ITIN, sin SSN y sin intereses. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aprobación garantizada
              </h3>
              <p className="text-gray-600">
                Todos son aprobados sin importar su historial de crédito
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Proceso rápido
              </h3>
              <p className="text-gray-600">
                Acude con los requisitos a nuestra sucursal y maneja el mismo día
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pagos flexibles
              </h3>
              <p className="text-gray-600">
                Planes de pago ajustados a tu presupuesto y sin intereses
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Garantía incluida
              </h3>
              <p className="text-gray-600">
                Protección en todos nuestros vehículos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para manejar un nuevo auto?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Visítanos hoy o llámanos para comenzar tu proceso de financiamiento
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inventory"
              className="px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-2xl"
            >
              Ver inventario
            </a>

            <a
              href="tel:5038789550"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-bold text-lg"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}