import { DollarSign, CheckCircle, Clock, Shield, Users } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Todos aprobados
            </h3>
            <p className="text-gray-600">
              Sin importar tu crédito, tenemos la opción ideal para ti
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

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Garantía Incluida
            </h3>
            <p className="text-gray-600">
              Protección en cada vehículo
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
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Elige tu nuevo auto
              </h3>
              <p className="text-gray-600">
                Explora nuestro inventario y selecciona el vehículo perfecto para ti
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Completa la Solicitud
              </h3>
              <p className="text-gray-600">
                Trae tu identificación, comprobante de domicilio y el enganche correspondiente
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Maneja el mismo día!
              </h3>
              <p className="text-gray-600">
                El 99.99% califica y se regresa a casa manejando en mismo día
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
                Los enganches varían según el vehículo y tu situación. Generalmente desde
                $1,500 a $3,000. ¡Pregúntanos por opciones flexibles para dar el enganche!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cuánto tiempo tarda la aprobación?
              </h3>
              <p className="text-gray-600">
                Realmente es inmediata, solo debes traer el enganche con
                tus documentos y podrías estar manejando el mismo día.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Qué pasa si me atraso en mi pago?
              </h3>
              <p className="text-gray-600">
                No somos igual que un banco, hablanos para programar un arreglo de pago,
                normalmente no cobraremos extra por esperar unos días.
              </p>
            </div>

                 <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Aceptan vehículos como enganche o cambio?
              </h3>
              <p className="text-gray-600">
                Por ahora no podemos, pero seguro pronto lo haremos.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para manejar un nuevo auto?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Visítanos hoy o llámanos para comenzar tu proceso de financiamiento
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inventory"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-2xl"
            >
              Ver inventario
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-bold text-lg"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}