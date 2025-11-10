import { Phone, MapPin, Mail, Clock, Facebook, Instagram } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">EL COMPA GÜERO AUTO SALES</h3>
            <p className="text-sm mb-4">
              Tu dealer de confianza en Salem, Oregon. Financiamiento disponible para todos.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white transition">Inicio</a>
              </li>
              <li>
                <a href="/inventory" className="hover:text-white transition">Ver Inventario</a>
              </li>
              <li>
                <a href="/financing" className="hover:text-white transition">Financiamiento</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <a href="tel:5038789550" className="hover:text-white transition">
                    (503) 878-9550
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <a 
                    href="https://maps.google.com/?q=915+12th+St+SE+Salem+OR+97302" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    915 12th St SE<br />
                    Salem, OR 97302
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <a href="mailto:info@elcompaguero.com" className="hover:text-white transition">
                    info@elcompaguero.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">Horario</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Lunes - Viernes: 9AM - 6PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Sábado: 9AM - 5PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Domingo: Cerrado</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-600 rounded-lg">
              <p className="text-white text-xs font-medium">
                ¡Hablamos Español!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>
              © {currentYear} El Compa Güero Auto Sales LLC. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white transition">
                Política de Privacidad
              </a>
              <a href="/terms" className="hover:text-white transition">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}