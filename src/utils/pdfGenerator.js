import html2pdf from 'html2pdf.js';

/**
 * Genera un PDF desde un elemento HTML
 * @param {HTMLElement} element - Elemento HTML a convertir
 * @param {string} filename - Nombre del archivo PDF
 * @param {Object} options - Opciones adicionales para html2pdf
 */
export const generatePDF = async (element, filename, options = {}) => {
  const defaultOptions = {
    margin: 0, // Sin márgenes - el contenido ya tiene padding
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    await html2pdf().set(finalOptions).from(element).save();
    return { success: true };
  } catch (error) {
    console.error('Error generando PDF:', error);
    return { success: false, error };
  }
};

/**
 * Genera un PDF y lo abre en una nueva ventana (para previsualización)
 * @param {HTMLElement} element - Elemento HTML a convertir
 * @param {Object} options - Opciones adicionales
 */
export const previewPDF = async (element, options = {}) => {
  const defaultOptions = {
    margin: 0, // Sin márgenes
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
      compress: true
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const pdf = await html2pdf().set(finalOptions).from(element).output('blob');
    const url = URL.createObjectURL(pdf);
    window.open(url, '_blank');
    return { success: true };
  } catch (error) {
    console.error('Error previsualizando PDF:', error);
    return { success: false, error };
  }
};