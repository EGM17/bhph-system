// utils/dateHelpers.js
// Funciones para manejar fechas sin problemas de zona horaria

/**
 * Convierte un string de fecha a formato YYYY-MM-DD sin problemas de zona horaria
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const toLocaleDateString = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Usar getFullYear, getMonth, getDate en lugar de toISOString
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Crea una fecha desde un input date (YYYY-MM-DD) manteniendo la fecha local
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date con la fecha correcta
 */
export const createLocalDate = (dateString) => {
  if (!dateString) return new Date();
  
  // Extraer año, mes, día del string
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear fecha en zona horaria local
  return new Date(year, month - 1, day);
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha de hoy en formato YYYY-MM-DD
 */
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Agrega meses a una fecha sin cambiar el día
 * @param {string|Date} date - Fecha inicial
 * @param {number} months - Número de meses a agregar
 * @returns {string} Nueva fecha en formato YYYY-MM-DD
 */
export const addMonths = (date, months) => {
  const d = new Date(date);
  
  // Obtener componentes locales
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  
  // Crear nueva fecha con los meses agregados
  const newDate = new Date(year, month + months, day);
  
  // Convertir a string local
  return toLocaleDateString(newDate);
};

/**
 * Compara dos fechas (solo la parte de fecha, sin hora)
 * @param {string|Date} date1 
 * @param {string|Date} date2 
 * @returns {number} -1 si date1 < date2, 0 si iguales, 1 si date1 > date2
 */
export const compareDates = (date1, date2) => {
  const d1 = toLocaleDateString(date1);
  const d2 = toLocaleDateString(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Calcula días entre dos fechas
 * @param {string|Date} date1 
 * @param {string|Date} date2 
 * @returns {number} Número de días
 */
export const daysBetween = (date1, date2) => {
  const d1 = createLocalDate(toLocaleDateString(date1));
  const d2 = createLocalDate(toLocaleDateString(date2));
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};