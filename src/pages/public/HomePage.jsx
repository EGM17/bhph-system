import Hero from '../../components/public/Hero';
import FeaturedVehicles from '../../components/public/FeaturedVehicles';
import { CheckCircle, DollarSign, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🆕 NUEVO
import { Link } from 'react-router-dom'; // 🆕 NUEVO

export default function HomePage() {
  const { language } = useLanguage(); // 🆕 NUEVO

  return (
    <div>
      <Hero />
      <FeaturedVehicles />
      
      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-4">
              {language === 'es' ? '¿Por qué elegirnos?' : 'Why Choose Us?'}
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              {language === 'es' 
                ? 'Más de 15 años ayudando a familias a obtener su auto ideal, sin crédito, sin ITIN, sin SSN y sin intereses.'
                : 'Over 15 years helping families get their dream car, no credit, no ITIN, no SSN and no interest.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' ? 'Aprobación garantizada' : 'Guaranteed Approval'}
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                {language === 'es'
                  ? 'Todos son aprobados sin importar su historial de crédito'
                  : 'Everyone is approved regardless of credit history'}
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' ? 'Proceso rápido' : 'Fast Process'}
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                {language === 'es'
                  ? 'Acude con los requisitos a nuestra sucursal y maneja el mismo día'
                  : 'Come with the requirements to our branch and drive the same day'}
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl md:text-xl lg:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' ? 'Pagos flexibles' : 'Flexible Payments'}
              </h3>
              <p className="text-base md:text-base text-gray-600 px-4">
                {language === 'es'
                  ? 'Planes de pago ajustados a tu presupuesto y sin intereses'
                  : 'Payment plans tailored to your budget and interest-free'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 px-8">
            {language === 'es' ? (
              <>
                ¿Listo para manejar<br className="sm:hidden" /> un nuevo auto?
              </>
            ) : (
              <>
                Ready to drive<br className="sm:hidden" /> a new car?
              </>
            )}
          </h2>
          <p className="text-base md:text-lg lg:text-lg mb-8 px-6 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Visítanos hoy o llámanos para comenzar tu proceso de financiamiento'
              : 'Visit us today or call us to start your financing process'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link
              to={language === 'es' ? '/es/inventario' : '/en/inventory'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
            >
              {language === 'es' ? 'Ver inventario' : 'View Inventory'}
            </Link>
            <a
              href="tel:+15038789550"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
            >
              {language === 'es' ? 'Llamar ahora' : 'Call Now'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}