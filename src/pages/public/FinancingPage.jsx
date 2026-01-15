import { DollarSign, CheckCircle, Clock, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🆕 NUEVO
import { Link } from 'react-router-dom'; // 🆕 NUEVO

export default function FinancingPage() {
  const { language, t } = useLanguage(); // 🆕 NUEVO

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero de Financiamiento */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 px-4">
            {t('financing.title')}
          </h1>
          <p className="text-base md:text-xl text-blue-100 max-w-2xl px-4">
            {t('financing.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {t('financing.benefit1')}
            </h3>
            <p className="text-base md:text-base text-gray-600 px-2">
              {language === 'es' 
                ? 'Sin importar tu historial de crédito' 
                : 'Regardless of your credit history'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {language === 'es' ? 'Aprobación rápida' : 'Fast Approval'}
            </h3>
            <p className="text-base md:text-base text-gray-600 px-2">
              {language === 'es' 
                ? 'Respuesta en minutos, no días' 
                : 'Response in minutes, not days'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {t('financing.benefit3')}
            </h3>
            <p className="text-base md:text-base text-gray-600 px-2">
              {language === 'es' 
                ? 'Ajustamos el pago a tu presupuesto' 
                : 'We adjust the payment to your budget'}
            </p>
          </div>
        </div>

        {/* Cómo Funciona */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('financing.howItWorks')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {t('financing.step1Title')}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t('financing.step1Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {t('financing.step2Title')}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t('financing.step2Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {t('financing.step3Title')}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {t('financing.step3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Documentos Requeridos */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {language === 'es' ? 'Documentos necesarios' : 'Required Documents'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Identificación válida' : 'Valid Identification'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Licencia de conducir, identificación estatal o de tu país.' 
                    : "Driver's license, state ID or ID from your country."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Enganche mínimo' : 'Minimum Down Payment'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Solamente debes cubrir el enganche correspondiente' 
                    : 'You only need to cover the corresponding down payment'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Comprobante de Domicilio' : 'Proof of Address'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Recibo de luz, agua o renta' 
                    : 'Utility bill, water or rent receipt'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Referencias' : 'References'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Nombres y teléfonos de al menos 3 referencias' 
                    : 'Names and phone numbers of at least 3 references'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {language === 'es' ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Qué pasa si tengo mal crédito?' 
                  : 'What if I have bad credit?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? '¡No hay problema! Cuando financiamos en casa, no checamos crédito. Solo te pedimos tu identificación válida, un comprobante de domicilio, el enganche y las referencias. ¡Estamos al servicio de toda la comunidad!'
                  : 'No problem! When we finance in-house, we don\'t check credit. We only ask for your valid ID, proof of address, down payment and references. We are at the service of the entire community!'}
              </p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Cuánto necesito de enganche?' 
                  : 'How much do I need for a down payment?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? 'El enganche varía según el vehículo que elijas. Generalmente oscila entre $500 y $2,000. Mientras mayor sea tu enganche, menor será tu pago mensual.'
                  : 'The down payment varies depending on the vehicle you choose. It generally ranges from $500 to $2,000. The larger your down payment, the lower your monthly payment will be.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Cuánto tiempo tardo en llevarme el auto?' 
                  : 'How long does it take to get the car?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? '¡El mismo día! La mayoría de nuestros clientes salen manejando su auto el mismo día que nos visitan. Solo necesitas traer los documentos requeridos y el enganche.'
                  : 'Same day! Most of our customers drive away with their car the same day they visit us. You just need to bring the required documents and the down payment.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Qué pasa si no tengo SSN o ITIN?' 
                  : 'What if I don\'t have SSN or ITIN?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? '¡No hay problema! No requerimos SSN ni ITIN para aprobarte. Solo necesitas una identificación válida de cualquier país, un comprobante de domicilio y tus referencias personales.'
                  : 'No problem! We don\'t require SSN or ITIN to approve you. You only need a valid ID from any country, proof of address and your personal references.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Cobran intereses?' 
                  : 'Do you charge interest?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? 'No, no cobramos intereses. El precio que ves es el precio final. Tu pago mensual es fijo y no aumenta con el tiempo.'
                  : 'No, we don\'t charge interest. The price you see is the final price. Your monthly payment is fixed and doesn\'t increase over time.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Puedo traer mi propio mecánico para revisar el auto?' 
                  : 'Can I bring my own mechanic to inspect the car?'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'es'
                  ? '¡Por supuesto! Estamos completamente de acuerdo en que traigas tu mecánico de confianza para que revise el vehículo antes de comprarlo.'
                  : 'Of course! We completely agree that you should bring your trusted mechanic to inspect the vehicle before buying it.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {language === 'es' 
              ? '¿Listo para manejar tu próximo auto?' 
              : 'Ready to drive your next car?'}
          </h2>
          <p className="text-base md:text-xl text-blue-100 mb-8">
            {language === 'es' 
              ? 'Visítanos hoy o llámanos para más información' 
              : 'Visit us today or call us for more information'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={language === 'es' ? '/es/inventario' : '/en/inventory'}
              className="px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-2xl"
            >
              {language === 'es' ? 'Ver inventario' : 'View Inventory'}
            </Link>
            <Link
              to={language === 'es' ? '/es/contacto' : '/en/contact'}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-bold text-lg"
            >
              {language === 'es' ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}