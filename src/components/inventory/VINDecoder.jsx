import { useState } from 'react';
import { Search, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { decodeVIN, isValidVINFormat, generateStockNumber } from '../../services/vinService';

export default function VINDecoder({ onVehicleDecoded }) {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDecode = async () => {
    // Reset estados
    setError('');
    setSuccess(false);

    // Validar VIN
    const vinUpper = vin.toUpperCase().trim();
    
    if (!vinUpper) {
      setError('Por favor ingresa un VIN');
      return;
    }

    if (!isValidVINFormat(vinUpper)) {
      setError('Formato de VIN inválido. Debe tener 17 caracteres alfanuméricos (sin I, O, Q)');
      return;
    }

    setLoading(true);

    try {
      // Decodificar VIN usando API NHTSA
      const vehicleInfo = await decodeVIN(vinUpper);
      
      // Generar número de stock automático
      const stockNumber = generateStockNumber(vinUpper);
      
      // Pasar datos al componente padre
      onVehicleDecoded({
        ...vehicleInfo,
        stockNumber
      });
      
      setSuccess(true);
      
      // Limpiar después de 2 segundos
      setTimeout(() => {
        setVin('');
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Error decodificando VIN:', err);
      setError(err.message || 'Error al decodificar el VIN. Verifica que sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleDecode();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Decodificador VIN</h3>
          <p className="text-sm text-blue-700">Ingresa el VIN para autocompletar información del vehículo</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input VIN */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            VIN (17 caracteres) *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={vin}
              onChange={(e) => {
                setVin(e.target.value.toUpperCase());
                setError('');
                setSuccess(false);
              }}
              onKeyPress={handleKeyPress}
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
              className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg uppercase"
              disabled={loading}
            />
            <button
              onClick={handleDecode}
              disabled={loading || vin.length !== 17}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Decodificando...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Decodificar</span>
                </>
              )}
            </button>
          </div>
          
          {/* Contador de caracteres */}
          <p className="text-xs text-blue-600 mt-1">
            {vin.length}/17 caracteres
          </p>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">¡VIN decodificado exitosamente!</p>
                <p className="text-sm text-green-700 mt-1">
                  Los datos del vehículo se han autocompletado abajo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> El VIN (Vehicle Identification Number) es un código único de 17 caracteres 
            que identifica tu vehículo. Lo puedes encontrar en:
          </p>
          <ul className="text-xs text-blue-700 mt-2 ml-4 space-y-1">
            <li>• Dashboard del lado del conductor (visible desde afuera)</li>
            <li>• Título del vehículo</li>
            <li>• Tarjeta de registro</li>
            <li>• Póliza de seguro</li>
          </ul>
        </div>
      </div>
    </div>
  );
}