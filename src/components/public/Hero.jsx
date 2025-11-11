import { ArrowRight, CheckCircle, DollarSign } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
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

            {/* Features - Reducido a solo 2 características principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Aprobación inmediata</h3>
                  <p className="text-sm text-blue-100">Solo con tres requisitos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-gray-900" />
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

            {/* Trust Badges - Mejorados para estar siempre visibles */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/20 relative z-20">
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
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-3xl font-bold">4.9</span>
                  <span className="text-yellow-400 text-2xl">★</span>
                </div>
                <p className="text-sm text-blue-200">Rating en Google</p>
              </div>
            </div>
          </div>

          {/* Right Content - Card con imagen personalizable */}
          <div className="relative lg:pl-12">
            <div className="relative z-10 bg-gradient-to-br from-blue-500/40 to-blue-600/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
              
              {/* Imagen personalizable o placeholder */}
              {settings.heroImage ? (
                <div className="relative">
                  <img 
                    src={settings.heroImage} 
                    alt={settings.heroImageAlt || 'Tu Próximo Auto Te Espera'}
                    className="w-full h-64 object-cover"
                  />
                  {/* Overlay con gradiente para asegurar legibilidad del texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
                  
                  {/* Texto sobre la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <h3 className="text-2xl font-bold mb-2">
                      {settings.heroTitle || 'LATINO AL VOLANTE'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {settings.heroSubtitle || 'Empieza hoy mismo el proceso y maneja tu auto en menos de 24 horas'}
                    </p>
                  </div>
                </div>
              ) : (
                // Diseño por defecto si no hay imagen configurada
                <div className="p-8">
                  <div className="flex items-center justify-center w-24 h-24 bg-blue-400/50 rounded-full mx-auto mb-6">
                    <svg 
                      className="w-12 h-12 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 18.5a1.5 1.5 0 0 1-1 1.5 1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1 1.5m1.5-9-1.76-4.53A1 1 0 0 0 16.81 4H7.19a1 1 0 0 0-.93.47L4.5 9H2v4h1v6c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-6h1V9h-2.5M7.88 5.5h8.25l1.5 3.5h-11.25l1.5-3.5M6 18.5a1.5 1.5 0 0 1-1 1.5A1.5 1.5 0 0 1 3.5 18.5 1.5 1.5 0 0 1 5 17a1.5 1.5 0 0 1 1 1.5z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center mb-4">
                    {settings.heroTitle || 'Tu Próximo Auto Te Espera'}
                  </h3>
                  
                  <p className="text-blue-100 text-center mb-6">
                    {settings.heroSubtitle || 'Empieza hoy mismo el proceso y maneja tu auto en menos de 24 horas'}
                  </p>
                </div>
              )}
              
              {/* Lista de beneficios - siempre visible */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Sin revisión de crédito</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Proceso 100% en español</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Entrega inmediata</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}