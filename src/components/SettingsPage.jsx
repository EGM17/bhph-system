import { ArrowLeft, Calendar, DollarSign, Palette } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsPage({ onClose }) {
  const { settings, updateSettings } = useSettings();

  const handleDateFormatChange = (format) => {
    updateSettings({ dateFormat: format });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
              <p className="text-sm text-gray-600">Ajusta las preferencias del sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Formato de Fecha */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Formato de Fecha</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Selecciona cómo quieres ver las fechas en el sistema
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleDateFormatChange('en-US')}
                className={`w-full text-left px-4 py-4 rounded-lg border-2 transition ${
                  settings.dateFormat === 'en-US'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Formato USA</p>
                    <p className="text-sm text-gray-600">MM/DD/YYYY</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </p>
                  </div>
                  {settings.dateFormat === 'en-US' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleDateFormatChange('es-ES')}
                className={`w-full text-left px-4 py-4 rounded-lg border-2 transition ${
                  settings.dateFormat === 'es-ES'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Formato Español</p>
                    <p className="text-sm text-gray-600">DD de MMMM de YYYY</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  {settings.dateFormat === 'es-ES' && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Sistema</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Versión</span>
                <span className="font-medium text-gray-800">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Última actualización</span>
                <span className="font-medium text-gray-800">Noviembre 2024</span>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <span className="text-lg">✓</span>
              Los cambios se guardan automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}