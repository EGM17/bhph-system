import { Phone, MapPin, Mail, Clock, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🆕 NUEVO
import { Link } from 'react-router-dom'; // 🆕 NUEVO

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage(); // 🆕 NUEVO

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 notranslate">
              EL COMPA GUERO AUTO SALES
            </h3>
            <p className="text-sm mb-4">
              {language === 'es' 
                ? 'Tu dealer de confianza en Salem, Oregon. Financiamiento en casa disponible para todos.'
                : 'Your trusted dealer in Salem, Oregon. In-house financing available for everyone.'}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/elcompagueroautosales/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {language === 'es' ? 'Enlaces rápidos' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to={language === 'es' ? '/es' : '/en'} 
                  className="hover:text-white transition"
                >
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to={language === 'es' ? '/es/inventario' : '/en/inventory'} 
                  className="hover:text-white transition"
                >
                  {t('header.inventory')}
                </Link>
              </li>
              <li>
                <Link 
                  to={language === 'es' ? '/es/financiamiento' : '/en/financing'} 
                  className="hover:text-white transition"
                >
                  {t('header.financing')}
                </Link>
              </li>
              <li>
                <Link 
                  to={language === 'es' ? '/es/contacto' : '/en/contact'} 
                  className="hover:text-white transition"
                >
                  {t('header.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.address')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p>915 12th St SE</p>
                  <p>Salem, OR 97302</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="tel:5038789550" className="hover:text-white transition">
                  (503) 878-9550
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:info@elcompaguero.com" className="hover:text-white transition">
                  info@elcompaguero.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.hours')}</h4>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">
                  {language === 'es' ? 'Lunes - Domingo' : 'Monday - Sunday'}
                </p>
                <p>10:00 AM - 7:00 PM</p>
                <p className="mt-2 text-xs">
                  {language === 'es' ? 'Atención personalizada.' : 'Personalized service.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>
              © {currentYear} El Compa Guero Auto Sales LLC. {t('footer.rights')}.
            </p>
            <div className="flex gap-6">
              <Link 
                to={language === 'es' ? '/es/privacidad' : '/en/privacy'} 
                className="hover:text-white transition"
              >
                {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
              </Link>
              <Link 
                to={language === 'es' ? '/es/terminos' : '/en/terms'} 
                className="hover:text-white transition"
              >
                {language === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}