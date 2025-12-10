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
          
          {/* Right Content - IMAGEN (Se muestra PRIMERO en móvil con order-1, SEGUNDO en desktop sin order) */}
          <div className="relative lg:pl-12 order-1 lg:order-2">
            {/* Contenedor de imagen con aspect-ratio responsivo:
                - Móvil: aspect-[5/4] (más horizontal, altura = 80% del ancho)
                - Desktop: aspect-square (perfectamente cuadrada, 100% del ancho)
            */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[5/4] lg:aspect-square"
                 style={{ 
                   backgroundColor: settings.heroImage ? 'transparent' : 'rgba(59, 130, 246, 0.15)' 
                 }}>
              {settings.heroImage && (
                /* IMAGEN COMPLETA SIN TEXTO SUPERPUESTO NI PLACEHOLDER */
                <img 
                  src={settings.heroImage} 
                  alt={settings.heroImageAlt || 'Auto destacado'}
                  className="w-full h-full object-cover"
                  loading="eager" // Carga inmediata para evitar el flash
                />
              )}
              {/* Si no hay imagen, solo mostrar un fondo vacío sin texto ni iconos */}
              {!settings.heroImage && (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm">
                  {/* Espacio vacío sin contenido */}
                </div>
              )}
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -z-10"></div>
          </div>

          {/* Left Content - TEXTO (Se muestra SEGUNDO en móvil con order-2, PRIMERO en desktop sin order) */}
          <div className="space-y-8 order-2 lg:order-1 text-center lg:text-left">
            <div>
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                Autos seminuevos en Salem, Oregon.
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Financiamiento
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                sin intereses
                </span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-blue-100 leading-relaxed">
                Ofrecemos financiamiento fácil y rápido en vehículos seminuevos. Sin revisar crédito, sin ITIN, 
                sin SSN, sin licencia y sin intereses.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/inventory"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Ver inventario
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
              >
                Aplicar para financiamiento
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-6 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold">500+</p>
                <p className="text-xs md:text-sm text-blue-200">Clientes Felices</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold">15+</p>
                <p className="text-xs md:text-sm text-blue-200">Años de Experiencia</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-2xl md:text-3xl font-bold">4.9</span>
                  <span className="text-yellow-400 text-xl md:text-2xl">★</span>
                </div>
                <p className="text-xs md:text-sm text-blue-200">Rating en Google</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}