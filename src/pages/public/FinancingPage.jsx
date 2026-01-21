import { DollarSign, CheckCircle, Clock, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function FinancingPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={language === 'es' ? 'Financiamiento' : 'Financing'}
        description={
          language === 'es'
            ? 'Opciones de financiamiento flexibles en Salem, Oregon. Buy Here Pay Here sin revisar crédito. Aprobación el mismo día sin importar tu historial.'
            : 'Flexible financing options in Salem, Oregon. Buy Here Pay Here with no credit check. Same-day approval regardless of your credit history.'
        }
        keywords={[
          'financiamiento sin credito',
          'buy here pay here',
          'aprobacion garantizada',
          'financing salem oregon',
          'no credit check',
          'bad credit financing'
        ]}
        type="website"
      />

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
                    : 'Driver\'s license, state ID or ID from your country.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Comprobante de ingresos' : 'Proof of Income'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Talones de cheque o carta de empleador.'
                    : 'Pay stubs or employer letter.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                  {language === 'es' ? 'Comprobante de domicilio' : 'Proof of Address'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'es' 
                    ? 'Factura de servicios o contrato de renta.'
                    : 'Utility bill or rental agreement.'}
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
                    ? '2-3 referencias personales con números de teléfono.'
                    : '2-3 personal references with phone numbers.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {language === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Necesito tener crédito?' 
                  : 'Do I need credit?'}
              </h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'No. Aprobamos a todos sin importar el historial de crédito. Incluso si nunca has tenido crédito o si tu crédito es malo, puedes calificar.'
                  : 'No. We approve everyone regardless of credit history. Even if you\'ve never had credit or if your credit is bad, you can qualify.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Cuánto necesito de enganche?' 
                  : 'How much do I need for down payment?'}
              </h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Los enganches comienzan desde $500, dependiendo del vehículo que elijas. Trabajamos contigo para encontrar un plan que se ajuste a tu presupuesto.'
                  : 'Down payments start from $500, depending on the vehicle you choose. We work with you to find a plan that fits your budget.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Puedo llevarme el auto el mismo día?' 
                  : 'Can I take the car the same day?'}
              </h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? '¡Sí! Una vez aprobado y con el enganche, puedes manejar tu auto el mismo día. El proceso es rápido y sencillo.'
                  : 'Yes! Once approved and with the down payment, you can drive your car the same day. The process is quick and simple.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'es' 
                  ? '¿Los pagos ayudan a mejorar mi crédito?' 
                  : 'Do payments help improve my credit?'}
              </h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Sí. Reportamos tus pagos a las agencias de crédito, lo que te ayuda a construir o reconstruir tu historial crediticio con cada pago puntual.'
                  : 'Yes. We report your payments to credit bureaus, which helps you build or rebuild your credit history with each on-time payment.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {language === 'es' 
              ? '¿Listo para empezar?' 
              : 'Ready to get started?'}
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Visítanos hoy mismo y obtén la aprobación en minutos. ¡Tu nuevo auto te está esperando!'
              : 'Visit us today and get approved in minutes. Your new car is waiting for you!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={language === 'es' ? '/es/inventario' : '/en/inventory'}
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition text-lg shadow-lg"
            >
              {language === 'es' ? 'Ver Inventario' : 'View Inventory'}
            </Link>
            <Link
              to={language === 'es' ? '/es/contacto' : '/en/contact'}
              className="inline-block px-8 py-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-400 transition text-lg border-2 border-white"
            >
              {language === 'es' ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}