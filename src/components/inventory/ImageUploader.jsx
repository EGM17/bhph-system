import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader, MoveVertical } from 'lucide-react';
import { validateImageFile, generateThumbnail } from '../../services/storageService';

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [previews, setPreviews] = useState(images);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    setError('');
    const fileArray = Array.from(files);
    
    // Validar número máximo
    if (previews.length + fileArray.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Validar cada archivo
    const validFiles = [];
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      validFiles.push(file);
    }

    // Generar previews
    setUploading(true);
    try {
      const newPreviews = await Promise.all(
        validFiles.map(async (file, index) => {
          const thumbnail = await generateThumbnail(file);
          return {
            file,
            preview: thumbnail,
            order: previews.length + index,
            isPrimary: previews.length === 0 && index === 0
          };
        })
      );

      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      onChange(updatedPreviews);
    } catch (err) {
      setError('Error al procesar las imágenes');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    
    // Reordenar y asegurar que haya una imagen primaria
    const reordered = updated.map((img, i) => ({
      ...img,
      order: i,
      isPrimary: i === 0 ? true : (img.isPrimary && i !== 0 ? false : img.isPrimary)
    }));
    
    if (reordered.length > 0 && !reordered.some(img => img.isPrimary)) {
      reordered[0].isPrimary = true;
    }
    
    setPreviews(reordered);
    onChange(reordered);
  };

  const setPrimaryImage = (index) => {
    const updated = previews.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setPreviews(updated);
    onChange(updated);
  };

  const moveImage = (fromIndex, toIndex) => {
    const updated = [...previews];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    
    // Actualizar órdenes
    const reordered = updated.map((img, i) => ({
      ...img,
      order: i
    }));
    
    setPreviews(reordered);
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Procesando imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-base font-medium text-gray-700">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG o WebP - Máximo 10MB por imagen
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {previews.length}/{maxImages} imágenes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Grid de previews */}
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Imágenes cargadas ({previews.length})
            </p>
            <p className="text-xs text-gray-500">
              Haz clic en una imagen para marcarla como principal
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className={`relative group rounded-lg overflow-hidden border-2 transition ${
                  preview.isPrimary
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Imagen */}
                <div 
                  onClick={() => setPrimaryImage(index)}
                  className="aspect-video bg-gray-100 cursor-pointer"
                >
                  <img
                    src={preview.preview || preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Badge de imagen principal */}
                {preview.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    PRINCIPAL
                  </div>
                )}

                {/* Número de orden */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded">
                  #{index + 1}
                </div>

                {/* Botones de acción (visible en hover) */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Mover arriba */}
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, index - 1);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                      title="Mover arriba"
                    >
                      <MoveVertical className="w-4 h-4 text-gray-700" />
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                    title="Eliminar"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {/* Mover abajo */}
                  {index < previews.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, index + 1);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                      title="Mover abajo"
                    >
                      <MoveVertical className="w-4 h-4 text-gray-700 rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Instrucciones */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Tips:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 ml-4 space-y-1">
              <li>• La primera imagen será la imagen principal (puedes cambiarla haciendo clic)</li>
              <li>• Usa las flechas para reordenar las imágenes</li>
              <li>• Toma fotos del exterior, interior, motor, y detalles importantes</li>
              <li>• Imágenes de alta calidad atraen más clientes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Estado sin imágenes */}
      {previews.length === 0 && !uploading && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No hay imágenes aún. Arrastra o selecciona archivos para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}