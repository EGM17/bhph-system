/**
 * Servicio para decodificar información de vehículos usando VIN
 * Utiliza la API gratuita de NHTSA (National Highway Traffic Safety Administration)
 */

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Decodifica un VIN y retorna información del vehículo
 * @param {string} vin - Vehicle Identification Number (17 caracteres)
 * @returns {Promise<Object>} Información del vehículo
 */
export const decodeVIN = async (vin) => {
  if (!vin || vin.length !== 17) {
    throw new Error('VIN debe tener exactamente 17 caracteres');
  }

  try {
    const response = await fetch(
      `${NHTSA_API_BASE}/DecodeVin/${vin}?format=json`
    );
    
    if (!response.ok) {
      throw new Error('Error al consultar la API NHTSA');
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No se encontró información para este VIN');
    }

    // Extraer información relevante
    const results = data.Results;
    const getValue = (variableId) => {
      const item = results.find(r => r.VariableId === variableId);
      return item?.Value || '';
    };

    return {
      vin: vin.toUpperCase(),
      make: getValue(26) || '', // Make
      model: getValue(28) || '', // Model
      year: parseInt(getValue(29)) || new Date().getFullYear(), // Model Year
      trim: getValue(109) || '', // Trim
      bodyClass: getValue(5) || '', // Body Class
      vehicleType: getValue(10) || '', // Vehicle Type
      doors: getValue(14) || '', // Number of Doors
      fuelType: getValue(24) || '', // Fuel Type - Primary
      engineCylinders: getValue(9) || '', // Engine Number of Cylinders
      engineDisplacement: getValue(11) || '', // Displacement (L)
      transmission: getValue(37) || '', // Transmission Style
      driveType: getValue(15) || '', // Drive Type
      manufacturer: getValue(27) || '', // Manufacturer Name
      plantCountry: getValue(75) || '', // Plant Country
      rawData: results // Guardar data completa por si acaso
    };

  } catch (error) {
    console.error('Error decodificando VIN:', error);
    throw error;
  }
};

/**
 * Valida formato básico del VIN (no valida checksum)
 * @param {string} vin 
 * @returns {boolean}
 */
export const isValidVINFormat = (vin) => {
  if (!vin || typeof vin !== 'string') return false;
  
  // VIN debe tener 17 caracteres
  if (vin.length !== 17) return false;
  
  // No puede contener I, O, Q (confusión con 1, 0)
  if (/[IOQ]/i.test(vin)) return false;
  
  // Solo alfanumérico
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
  
  return true;
};

/**
 * Obtiene modelos disponibles para una marca y año específico
 * @param {string} make - Marca del vehículo
 * @param {number} year - Año del vehículo
 * @returns {Promise<Array>} Lista de modelos
 */
export const getModelsByMakeYear = async (make, year) => {
  try {
    const response = await fetch(
      `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`
    );
    
    const data = await response.json();
    
    if (data.Results) {
      return data.Results.map(item => ({
        makeId: item.Make_ID,
        makeName: item.Make_Name,
        modelId: item.Model_ID,
        modelName: item.Model_Name
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo modelos:', error);
    return [];
  }
};

/**
 * Obtiene todas las marcas disponibles
 * @returns {Promise<Array>} Lista de marcas
 */
export const getAllMakes = async () => {
  try {
    const response = await fetch(
      `${NHTSA_API_BASE}/GetAllMakes?format=json`
    );
    
    const data = await response.json();
    
    if (data.Results) {
      return data.Results
        .map(item => ({
          id: item.Make_ID,
          name: item.Make_Name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo marcas:', error);
    return [];
  }
};

/**
 * Formatea la información del vehículo para display
 * @param {Object} vehicleInfo 
 * @returns {string}
 */
export const formatVehicleTitle = (vehicleInfo) => {
  const { year, make, model, trim } = vehicleInfo;
  
  let title = `${year} ${make} ${model}`;
  if (trim && trim !== 'Not Applicable') {
    title += ` ${trim}`;
  }
  
  return title;
};

/**
 * Genera un número de stock basado en el VIN
 * @param {string} vin 
 * @returns {string}
 */
export const generateStockNumber = (vin) => {
  // Usar últimos 6 dígitos del VIN + timestamp para unicidad
  const vinPart = vin.slice(-6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `STK-${vinPart}-${timestamp}`;
};
