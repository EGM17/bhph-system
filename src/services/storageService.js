import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

const storage = getStorage();

/**
 * Sube una imagen de vehículo a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} vehicleId - ID del vehículo
 * @param {number} index - Índice de la imagen
 * @returns {Promise<string>} URL de descarga de la imagen
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
 * Sube múltiples imágenes en paralelo
 * @param {FileList|Array} files - Lista de archivos
 * @param {string} vehicleId - ID del vehículo
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Array>} Array de objetos con información de imágenes
 */
export const uploadMultipleImages = async (files, vehicleId, onProgress) => {
  const filesArray = Array.from(files);
  const uploadPromises = filesArray.map((file, index) => 
    uploadVehicleImage(file, vehicleId, index)
      .then(result => {
        if (onProgress) {
          onProgress(index + 1, filesArray.length);
        }
        return { ...result, order: index, isPrimary: index === 0 };
      })
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error subiendo múltiples imágenes:', error);
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
 * Elimina todas las imágenes de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<void>}
 */
export const deleteAllVehicleImages = async (vehicleId) => {
  try {
    const folderRef = ref(storage, `vehicles/${vehicleId}`);
    const result = await listAll(folderRef);
    
    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
    
    console.log(`${result.items.length} imágenes eliminadas para vehículo ${vehicleId}`);
  } catch (error) {
    console.error('Error eliminando imágenes del vehículo:', error);
    throw error;
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
 * @param {File} file 
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