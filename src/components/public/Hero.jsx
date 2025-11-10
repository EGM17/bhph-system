import { ArrowRight, CheckCircle, DollarSign, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                Autos con financiamiento en casa en Salem, Oregon.
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Financiamiento con
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                0% de interés.
                </span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Ofrecemos financiamiento fácil y rápido para todos. Sin importar tu crédito, sin ITIN, 
                sin SSN, sin licencia y sin intereses.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Aprobación inmediata</h3>
                  <p className="text-sm text-blue-100">Solo con tres requisitos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 rounded-full p-2">
                  <DollarSign className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enganches míninos</h3>
                  <p className="text-sm text-blue-100">Solo pagas un enganche mínimo</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-400 rounded-full p-2">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Garantía Incluida</h3>
                  <p className="text-sm text-blue-100">Protección en cada auto</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-500 rounded-full p-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sin checar crédito</h3>
                  <p className="text-sm text-blue-100">Todos son bienvenidos</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/inventory"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-2xl hover:shadow-3xl group"
              >
                Ver inventario
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="/financing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-bold text-lg backdrop-blur-sm"
              >
                Aplicar para financiamiento
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-blue-200">Clientes Felices</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm text-blue-200">Años de Experiencia</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">4.9★</p>
                <p className="text-sm text-blue-200">Rating en Google</p>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative lg:block hidden">
            <div className="relative">
              {/* Floating Card */}
              <div className="absolute -top-8 -right-8 bg-white text-gray-900 p-6 rounded-2xl shadow-2xl max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">¡Aprobado!</p>
                    <p className="text-sm text-gray-600">En 5 minutos</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">Pago mensual desde:</p>
                  <p className="text-3xl font-bold text-blue-600">$299</p>
                </div>
              </div>

              {/* Main Image Placeholder */}
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/30">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg">Tu Próximo Auto Te Espera</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 left-1/2 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
}