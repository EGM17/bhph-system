import { useState, useRef, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { createLead } from '../../services/leadService';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'phone'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const errorMessageRef = useRef(null);

  // Check if form was just submitted (after page reload)
  useEffect(() => {
    const wasSubmitted = sessionStorage.getItem('contactFormSubmitted');
    if (wasSubmitted === 'true') {
      sessionStorage.removeItem('contactFormSubmitted');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 8000);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll to error message when it appears
  useEffect(() => {
    if (error && errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      await createLead({
        ...formData,
        source: 'contact_page'
      });

      // Store success flag in sessionStorage before reload
      sessionStorage.setItem('contactFormSubmitted', 'true');
      
      // Reload page to avoid Google Translate DOM conflicts
      window.location.reload();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError(true);
      setTimeout(() => setError(false), 8000);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-blue-100">
            Estamos aquí para ayudarte. ¡Llama ahora o envíanos mensaje!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success message at top of page */}
        {submitted && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-900 font-bold text-lg">
                  ¡Gracias por tu mensaje!
                </p>
                <p className="text-green-700 mt-1">
                  Nos pondremos en contacto contigo pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de Contacto */}
          <div className="lg:col-span-1 space-y-6">
            {/* Teléfono */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Teléfono</h3>
                  <a
                    href="tel:5038789550"
                    className="text-blue-600 hover:text-blue-700 text-lg font-medium"
                  >
                    (503) 878-9550
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Lun - Dom: 10AM - 7PM
                  </p>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                  <p className="text-gray-700">
                    915 12th St SE<br />
                    Salem, OR 97302
                  </p>
                  <a
                    href="https://maps.google.com/?q=915+12th+St+SE+Salem+OR+97302"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* Horario */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Horario</h3>
                  <div className="space-y-1 text-gray-700">
                    <p>Lunes - Viernes: 10AM - 7PM</p>
                    <p>Sábado - Domingo: 10AM - 7PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Envíanos un mensaje
                  </h2>
                  <p className="text-gray-600">
                    Te responderemos lo antes posible
                  </p>
                </div>
              </div>

              {error && (
                <div 
                  ref={errorMessageRef}
                  className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 font-medium">
                      Error al enviar el formulario. Por favor intenta de nuevo.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Juan Pérez"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="555-123-4567"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="tu@email.com"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de contacto preferido *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                        disabled={submitting}
                      />
                      <span className="text-gray-700">Teléfono</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                        disabled={submitting}
                      />
                      <span className="text-gray-700">Email</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-bold text-lg shadow-lg"
                >
                  {submitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Mapa */}
            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2842.5!2d-123.0351!3d44.9429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54bfffe5b6b5e5e5%3A0x5e5e5e5e5e5e5e5e!2s915%2012th%20St%20SE%2C%20Salem%2C%20OR%2097302!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}