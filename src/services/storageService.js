import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

const storage = getStorage();

/**
 * Sube una imagen de vehículo a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} vehicleId - ID del vehículo
 * @param {number} index - Índice de la imagen
 * @returns {Promise<Object>} Información de la imagen subida
 */
export const uploadVehicleImage = async (file, vehicleId, index) => {
  try {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('La imagen no debe superar 10MB');
    }

    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${index}.${extension}`;
    
    // Referencia en Storage
    const storageRef = ref(storage, `vehicles/${vehicleId}/${filename}`);
    
    // Metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        vehicleId: vehicleId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    };

    // Subir archivo
    await uploadBytes(storageRef, file, metadata);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      url: downloadURL,
      filename: filename,
      size: file.size,
      type: file.type
    };

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

/**
 * ✅ FIXED: Sube múltiples imágenes en paralelo con validación mejorada
 * Ahora maneja objetos {file, url}, Files directos, URLs y undefined
 * @param {FileList|Array} files - Lista de archivos (pueden ser File, {file: File}, o URLs)
 * @param {string} vehicleId - ID del vehículo
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Array>} Array de objetos con información de imágenes
 */
export const uploadMultipleImages = async (files, vehicleId, onProgress) => {
  try {
    console.log('📤 uploadMultipleImages iniciado:', { filesCount: files.length, vehicleId });
    
    const filesArray = Array.from(files);
    const uploadPromises = filesArray.map(async (item, index) => {
      // ✅ FIX: Validar que item no sea undefined o null
      if (!item) {
        console.warn(`⚠️ Item ${index} es undefined o null, saltando...`);
        return null;
      }

      // ✅ FIX: Si es una URL de string (imagen existente), retornarla tal cual
      if (typeof item === 'string') {
        if (item.startsWith('http://') || item.startsWith('https://')) {
          console.log(`♻️ Item ${index} es URL existente:`, item);
          return { url: item, order: index, isPrimary: index === 0 };
        } else {
          console.warn(`⚠️ Item ${index} es string pero no es URL válida:`, item);
          return null;
        }
      }

      // ✅ FIX: Si es un objeto con propiedad .url (imagen ya subida)
      if (item.url && typeof item.url === 'string') {
        console.log(`♻️ Item ${index} ya tiene URL:`, item.url);
        return { ...item, order: index, isPrimary: index === 0 };
      }

      // ✅ FIX: Si es un objeto con propiedad .file (de ImageUploader)
      let fileToUpload;
      if (item.file && item.file instanceof File) {
        fileToUpload = item.file;
        console.log(`📤 Item ${index} tiene .file (ImageUploader):`, fileToUpload.name);
      } 
      // ✅ FIX: Si es directamente un File
      else if (item instanceof File) {
        fileToUpload = item;
        console.log(`📤 Item ${index} es File directo:`, fileToUpload.name);
      } 
      // Si no es nada reconocible, saltar
      else {
        console.warn(`⚠️ Item ${index} no es reconocible:`, typeof item, item);
        return null;
      }

      // Subir el archivo
      try {
        const result = await uploadVehicleImage(fileToUpload, vehicleId, index);
        
        if (onProgress) {
          onProgress(index + 1, filesArray.length);
        }
        
        console.log(`✅ Item ${index} subido exitosamente:`, result.url);
        return { ...result, order: index, isPrimary: index === 0 };
      } catch (error) {
        console.error(`❌ Error subiendo item ${index}:`, error);
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);
    
    // ✅ FIX: Filtrar nulls del resultado
    const validResults = results.filter(result => result !== null);
    
    console.log(`✅ uploadMultipleImages completado: ${validResults.length}/${filesArray.length} exitosas`);
    return validResults;
    
  } catch (error) {
    console.error('❌ Error en uploadMultipleImages:', error);
    throw error;
  }
};

/**
 * Elimina una imagen de Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<void>}
 */
export const deleteVehicleImage = async (imageUrl) => {
  try {
    // Extraer path del URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!imageUrl.startsWith(baseUrl)) {
      throw new Error('URL de imagen inválida');
    }

    // Parsear URL para obtener el path
    const urlParts = imageUrl.split('/o/')[1];
    if (!urlParts) {
      throw new Error('No se pudo extraer el path de la imagen');
    }
    
    const imagePath = decodeURIComponent(urlParts.split('?')[0]);
    
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    console.log('Imagen eliminada:', imagePath);
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};

/**
 * 🐛 FIX BUG #2: Elimina todas las imágenes de un vehículo y la carpeta
 * Ahora con mejor logging y manejo de errores para asegurar que se eliminen todas las imágenes
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Object>} Resultado de la operación con detalles
 */
export const deleteAllVehicleImages = async (vehicleId) => {
  try {
    console.log(`🗑️ Iniciando eliminación de imágenes para vehículo: ${vehicleId}`);
    
    const folderRef = ref(storage, `vehicles/${vehicleId}`);
    const result = await listAll(folderRef);
    
    if (result.items.length === 0) {
      console.log(`⚠️ No se encontraron imágenes para el vehículo ${vehicleId}`);
      return {
        success: true,
        deletedCount: 0,
        message: 'No había imágenes para eliminar'
      };
    }
    
    console.log(`📁 Encontradas ${result.items.length} imágenes para eliminar`);
    
    // Eliminar cada imagen y recopilar resultados
    const deleteResults = await Promise.allSettled(
      result.items.map(async (itemRef) => {
        try {
          await deleteObject(itemRef);
          console.log(`✅ Eliminada: ${itemRef.fullPath}`);
          return { success: true, path: itemRef.fullPath };
        } catch (error) {
          console.error(`❌ Error eliminando ${itemRef.fullPath}:`, error);
          return { success: false, path: itemRef.fullPath, error: error.message };
        }
      })
    );
    
    const successCount = deleteResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failureCount = deleteResults.filter(r => r.status === 'rejected' || !r.value.success).length;
    
    console.log(`✅ Eliminación completada: ${successCount} exitosas, ${failureCount} fallidas`);
    
    return {
      success: failureCount === 0,
      deletedCount: successCount,
      failedCount: failureCount,
      total: result.items.length,
      message: failureCount === 0 
        ? `${successCount} imágenes eliminadas exitosamente` 
        : `${successCount} eliminadas, ${failureCount} fallaron`
    };
    
  } catch (error) {
    console.error(`❌ Error crítico eliminando imágenes del vehículo ${vehicleId}:`, error);
    
    // Verificar si el error es porque la carpeta no existe
    if (error.code === 'storage/object-not-found') {
      return {
        success: true,
        deletedCount: 0,
        message: 'La carpeta no existe (ya fue eliminada o nunca existió)'
      };
    }
    
    throw error;
  }
};

/**
 * Verifica si existen imágenes para un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Object>} Información sobre las imágenes existentes
 */
export const checkVehicleImages = async (vehicleId) => {
  try {
    const folderRef = ref(storage, `vehicles/${vehicleId}`);
    const result = await listAll(folderRef);
    
    return {
      exists: result.items.length > 0,
      count: result.items.length,
      paths: result.items.map(item => item.fullPath)
    };
  } catch (error) {
    console.error('Error verificando imágenes:', error);
    return {
      exists: false,
      count: 0,
      paths: [],
      error: error.message
    };
  }
};

/**
 * Optimiza una imagen antes de subirla (resize client-side)
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @param {number} quality - Calidad JPEG (0-1)
 * @returns {Promise<Blob>} Imagen optimizada
 */
export const optimizeImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al optimizar imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Genera thumbnail de una imagen
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} Data URL del thumbnail
 */
export const generateThumbnail = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => reject(new Error('Error al generar thumbnail'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Valida un archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no permitido. Use JPG, PNG o WebP'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen no debe superar 10MB'
    };
  }
  
  return { valid: true, error: null };
};