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
          
          {/* Configuración del Hero - IMAGEN COMPLETA */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Imagen del Hero (Página Principal)</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              La imagen que aparecerá en el recuadro principal de la página de inicio. 
              Se mostrará completa sin texto superpuesto.
            </p>

            {/* Preview de la imagen actual */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista previa
              </label>
              <div className="relative bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                {previewUrl ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full object-cover rounded-lg"
                      style={{
                        maxHeight: '400px',
                        minHeight: '300px'
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <p className="text-sm">No hay imagen configurada</p>
                    <p className="text-xs mt-2">La imagen se mostrará completa en la página principal</p>
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
                  <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {uploading ? 'Subiendo imagen...' : 'Click para seleccionar imagen'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Formatos recomendados: JPG, PNG, WebP (máx. 5MB)
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Tamaño recomendado: 800x600px o mayor
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
                  <p className="text-sm text-red-800">⚠️ {uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">✅ Imagen actualizada correctamente</p>
                </div>
              )}
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Nota:</strong> La imagen se mostrará completa en el recuadro de la página principal, 
                ocupando todo el espacio disponible sin texto superpuesto. Recomendamos usar imágenes de 
                alta calidad con el vehículo como protagonista.
              </p>
            </div>
          </div>

          {/* Configuración de formato de fecha */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Formato de fecha</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Selecciona cómo se mostrarán las fechas en el sistema
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="dateFormat"
                  value="en-US"
                  checked={settings.dateFormat === 'en-US'}
                  onChange={() => handleDateFormatChange('en-US')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium">MM/DD/AAAA</p>
                  <p className="text-sm text-gray-500">Formato estadounidense (12/31/2024)</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="dateFormat"
                  value="es-MX"
                  checked={settings.dateFormat === 'es-MX'}
                  onChange={() => handleDateFormatChange('es-MX')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium">DD/MM/AAAA</p>
                  <p className="text-sm text-gray-500">Formato latinoamericano (31/12/2024)</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}