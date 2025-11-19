import { DollarSign, CheckCircle, Clock, Users } from 'lucide-react';

export default function FinancingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero de Financiamiento */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Financiamiento fácil y rápido
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Aprobamos a todos sin importar tu historial de crédito. ¡Maneja hoy mismo!
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Todos aprobados
            </h3>
            <p className="text-gray-600">
              Sin importar tu historial de crédito
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aprobación rápida
            </h3>
            <p className="text-gray-600">
              Respuesta en minutos, no días
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pagos flexibles
            </h3>
            <p className="text-gray-600">
              Ajustamos el pago a tu presupuesto
            </p>
          </div>
        </div>

        {/* Cómo Funciona */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Cómo funciona el financiamiento en casa?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                1. Visítanos
              </h3>
              <p className="text-gray-600">
                Ven a nuestra oficina con tu identificación, comprobante de domicilio y referencias
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                2. Te aprobamos
              </h3>
              <p className="text-gray-600">
                El 99% regresa a casa manejando el mismo día
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                3. Firma y maneja
              </h3>
              <p className="text-gray-600">
                Firma los documentos, cubre el enganche y sal manejando tu auto
              </p>
            </div>
          </div>
        </div>

        {/* Documentos Requeridos */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Documentos necesarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Identificación válida</h4>
                <p className="text-sm text-gray-600">Licencia de conducir, identificación estatal o de tu país.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Enganche mínimo</h4>
                <p className="text-sm text-gray-600">Solamente debes cubrir el enganche correspondiente</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Comprobante de Domicilio</h4>
                <p className="text-sm text-gray-600">Recibo de luz, agua o renta</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Referencias</h4>
                <p className="text-sm text-gray-600">Nombres y teléfonos de al menos 3 referencias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Preguntas frecuentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Qué pasa si tengo mal crédito?
              </h3>
              <p className="text-gray-600">
                ¡No hay problema! Cuando financiamos en casa, no checamos crédito. Solo te pedimos tu identificación válida,
                un comprobante de domicilio, el enganche y las referencias. ¡Estamos al servicio de toda la comunidad!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cuánto necesito de enganche?
              </h3>
              <p className="text-gray-600">
                El enganche varía según el vehículo que elijas. Generalmente oscila entre $500 y $2,000. 
                Mientras mayor sea tu enganche, menor será tu pago mensual.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cuánto tiempo tardo en llevarme el auto?
              </h3>
              <p className="text-gray-600">
                ¡El mismo día! La mayoría de nuestros clientes salen manejando su auto el mismo día que nos visitan.
                Solo necesitas traer los documentos requeridos y el enganche.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Qué pasa si no tengo SSN o ITIN?
              </h3>
              <p className="text-gray-600">
                ¡No hay problema! No requerimos SSN ni ITIN para aprobarte. Solo necesitas una identificación válida
                de cualquier país, un comprobante de domicilio y tus referencias personales.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cobran intereses?
              </h3>
              <p className="text-gray-600">
                No, no cobramos intereses. El precio que ves es el precio final. Tu pago mensual es fijo
                y no aumenta con el tiempo.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Puedo traer mi propio mecánico para revisar el auto?
              </h3>
              <p className="text-gray-600">
                ¡Por supuesto! Estamos completamente de acuerdo en que traigas tu mecánico de confianza
                para que revise el vehículo antes de comprarlo.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para manejar tu próximo auto?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Visítanos hoy o llámanos para más información
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inventory"
              className="px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-2xl"
            >
              Ver inventario
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-bold text-lg"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}