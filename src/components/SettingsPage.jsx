import { ArrowLeft, Calendar, Image as ImageIcon, Upload, Loader } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useState } from 'react';

export default function SettingsPage({ onClose }) {
  const { settings, updateSettings, uploadHeroImage } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(settings.heroImage || null);

  const handleDateFormatChange = (format) => {
    updateSettings({ dateFormat: format });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset estados
    setUploadError('');
    setUploadSuccess(false);

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar 5MB');
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir a Firebase
    setUploading(true);
    const result = await uploadHeroImage(file);
    setUploading(false);

    if (result.success) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      setUploadError(result.error || 'Error al subir la imagen');
      setPreviewUrl(settings.heroImage); // Restaurar imagen anterior
    }
  };

  const handleTextUpdate = async (field, value) => {
    await updateSettings({ [field]: value });
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
          
          {/* Configuración del Hero */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Imagen del Hero (Página Principal)</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Personaliza la imagen y textos que aparecen en el recuadro principal de la página de inicio
            </p>

            {/* Preview de la imagen actual */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista previa
              </label>
              <div className="relative bg-gradient-to-br from-blue-500/40 to-blue-600/40 rounded-xl p-8 border-2 border-dashed border-blue-300">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-blue-600">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm">No hay imagen configurada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Input para subir imagen */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cambiar imagen
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Subiendo...' : 'Click para seleccionar imagen'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, WebP (máx. 5MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Estados de subida */}
              {uploading && (
                <div className="mt-4 flex items-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Subiendo imagen...</span>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">✓ Imagen actualizada correctamente</p>
                </div>
              )}
            </div>

            {/* Textos personalizables */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del recuadro
                </label>
                <input
                  type="text"
                  value={settings.heroTitle || ''}
                  onChange={(e) => handleTextUpdate('heroTitle', e.target.value)}
                  placeholder="Ej: LATINO AL VOLANTE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo del recuadro
                </label>
                <textarea
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => handleTextUpdate('heroSubtitle', e.target.value)}
                  placeholder="Ej: Empieza hoy mismo el proceso y maneja tu auto en menos de 24 horas"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

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
                <span className="font-medium text-gray-800">1.1.0</span>
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