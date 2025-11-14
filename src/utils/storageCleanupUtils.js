// 🧹 SCRIPT DE LIMPIEZA DE STORAGE
// Este script te ayuda a detectar carpetas de imágenes huérfanas en Firebase Storage
// Úsalo desde la consola del navegador en tu panel de admin

import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const storage = getStorage();

/**
 * 🔍 Detecta carpetas de vehículos en Storage que ya no existen en Firestore
 * @returns {Promise<Object>} Reporte de carpetas huérfanas
 */
export const detectOrphanedFolders = async () => {
  console.log('🔍 Iniciando detección de carpetas huérfanas...');
  
  try {
    // 1. Obtener todos los IDs de vehículos en Firestore
    const vehiclesSnapshot = await getDocs(collection(db, 'inventory'));
    const existingVehicleIds = new Set(vehiclesSnapshot.docs.map(doc => doc.id));
    console.log(`✅ Encontrados ${existingVehicleIds.size} vehículos en Firestore`);
    
    // 2. Listar todas las carpetas en Storage
    const vehiclesFolderRef = ref(storage, 'vehicles');
    const vehiclesFolderList = await listAll(vehiclesFolderRef);
    console.log(`📁 Encontradas ${vehiclesFolderList.prefixes.length} carpetas en Storage`);
    
    // 3. Detectar carpetas huérfanas
    const orphanedFolders = [];
    
    for (const folderRef of vehiclesFolderList.prefixes) {
      const vehicleId = folderRef.name; // El nombre de la carpeta es el ID del vehículo
      
      if (!existingVehicleIds.has(vehicleId)) {
        // Esta carpeta no tiene vehículo correspondiente en Firestore
        const contents = await listAll(folderRef);
        orphanedFolders.push({
          vehicleId,
          path: folderRef.fullPath,
          imageCount: contents.items.length,
          images: contents.items.map(item => item.fullPath)
        });
        console.log(`⚠️ Carpeta huérfana detectada: ${vehicleId} (${contents.items.length} imágenes)`);
      }
    }
    
    // 4. Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      totalFoldersInStorage: vehiclesFolderList.prefixes.length,
      totalVehiclesInFirestore: existingVehicleIds.size,
      orphanedFoldersCount: orphanedFolders.length,
      orphanedFolders: orphanedFolders,
      totalOrphanedImages: orphanedFolders.reduce((sum, folder) => sum + folder.imageCount, 0)
    };
    
    console.log('\n📊 REPORTE DE CARPETAS HUÉRFANAS:');
    console.log('================================');
    console.log(`Total de carpetas en Storage: ${report.totalFoldersInStorage}`);
    console.log(`Total de vehículos en Firestore: ${report.totalVehiclesInFirestore}`);
    console.log(`Carpetas huérfanas encontradas: ${report.orphanedFoldersCount}`);
    console.log(`Total de imágenes huérfanas: ${report.totalOrphanedImages}`);
    
    if (orphanedFolders.length > 0) {
      console.log('\n⚠️ CARPETAS HUÉRFANAS:');
      orphanedFolders.forEach((folder, index) => {
        console.log(`${index + 1}. ${folder.vehicleId} - ${folder.imageCount} imágenes`);
      });
      console.log('\n💡 Usa cleanOrphanedFolders() para eliminarlas');
    } else {
      console.log('\n✅ No se encontraron carpetas huérfanas. ¡Storage está limpio!');
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Error detectando carpetas huérfanas:', error);
    throw error;
  }
};

/**
 * 🗑️ Elimina carpetas huérfanas detectadas
 * @param {Array} orphanedFolders - Array de carpetas a eliminar (del reporte)
 * @param {boolean} dryRun - Si es true, solo muestra lo que se eliminaría sin hacerlo
 * @returns {Promise<Object>} Resultado de la limpieza
 */
export const cleanOrphanedFolders = async (orphanedFolders = null, dryRun = true) => {
  console.log(`🧹 Iniciando limpieza de carpetas huérfanas (DRY RUN: ${dryRun})...`);
  
  try {
    // Si no se pasan carpetas, detectarlas primero
    if (!orphanedFolders) {
      const report = await detectOrphanedFolders();
      orphanedFolders = report.orphanedFolders;
    }
    
    if (orphanedFolders.length === 0) {
      console.log('✅ No hay carpetas huérfanas para limpiar');
      return {
        success: true,
        deletedFolders: 0,
        deletedImages: 0,
        message: 'No había carpetas huérfanas'
      };
    }
    
    if (dryRun) {
      console.log('\n⚠️ MODO DRY RUN - No se eliminará nada');
      console.log('Se eliminarían las siguientes carpetas:');
      orphanedFolders.forEach((folder, index) => {
        console.log(`${index + 1}. ${folder.vehicleId} - ${folder.imageCount} imágenes`);
        folder.images.forEach(img => console.log(`   - ${img}`));
      });
      console.log('\n💡 Para eliminar realmente, usa: cleanOrphanedFolders(orphanedFolders, false)');
      return {
        dryRun: true,
        wouldDeleteFolders: orphanedFolders.length,
        wouldDeleteImages: orphanedFolders.reduce((sum, f) => sum + f.imageCount, 0)
      };
    }
    
    // Eliminar realmente
    let deletedFolders = 0;
    let deletedImages = 0;
    const results = [];
    
    for (const folder of orphanedFolders) {
      console.log(`\n🗑️ Eliminando carpeta: ${folder.vehicleId}`);
      
      const deleteResults = await Promise.allSettled(
        folder.images.map(async (imagePath) => {
          try {
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
            console.log(`  ✅ Eliminada: ${imagePath}`);
            return { success: true, path: imagePath };
          } catch (error) {
            console.error(`  ❌ Error: ${imagePath}`, error);
            return { success: false, path: imagePath, error: error.message };
          }
        })
      );
      
      const successCount = deleteResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failureCount = deleteResults.filter(r => r.status === 'rejected' || !r.value.success).length;
      
      if (failureCount === 0) {
        deletedFolders++;
      }
      
      deletedImages += successCount;
      
      results.push({
        vehicleId: folder.vehicleId,
        totalImages: folder.imageCount,
        deletedImages: successCount,
        failedImages: failureCount,
        success: failureCount === 0
      });
      
      console.log(`  📊 Resultado: ${successCount} exitosas, ${failureCount} fallidas`);
    }
    
    console.log('\n✅ LIMPIEZA COMPLETADA');
    console.log(`Carpetas eliminadas: ${deletedFolders}/${orphanedFolders.length}`);
    console.log(`Imágenes eliminadas: ${deletedImages}`);
    
    return {
      success: true,
      deletedFolders,
      deletedImages,
      totalFolders: orphanedFolders.length,
      results
    };
    
  } catch (error) {
    console.error('❌ Error limpiando carpetas huérfanas:', error);
    throw error;
  }
};

/**
 * 📊 Genera estadísticas de uso de Storage
 * @returns {Promise<Object>} Estadísticas de Storage
 */
export const getStorageStats = async () => {
  console.log('📊 Generando estadísticas de Storage...');
  
  try {
    const vehiclesFolderRef = ref(storage, 'vehicles');
    const vehiclesFolderList = await listAll(vehiclesFolderRef);
    
    let totalImages = 0;
    const folderStats = [];
    
    for (const folderRef of vehiclesFolderList.prefixes) {
      const contents = await listAll(folderRef);
      totalImages += contents.items.length;
      folderStats.push({
        vehicleId: folderRef.name,
        imageCount: contents.items.length
      });
    }
    
    const stats = {
      totalFolders: vehiclesFolderList.prefixes.length,
      totalImages: totalImages,
      averageImagesPerVehicle: (totalImages / vehiclesFolderList.prefixes.length).toFixed(2),
      folderStats: folderStats.sort((a, b) => b.imageCount - a.imageCount) // Ordenar por más imágenes
    };
    
    console.log('\n📊 ESTADÍSTICAS DE STORAGE:');
    console.log('===========================');
    console.log(`Total de carpetas: ${stats.totalFolders}`);
    console.log(`Total de imágenes: ${stats.totalImages}`);
    console.log(`Promedio de imágenes por vehículo: ${stats.averageImagesPerVehicle}`);
    console.log('\n🔝 Top 5 vehículos con más imágenes:');
    stats.folderStats.slice(0, 5).forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.vehicleId}: ${folder.imageCount} imágenes`);
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
    throw error;
  }
};

// Exportar funciones para usar en consola
if (typeof window !== 'undefined') {
  window.detectOrphanedFolders = detectOrphanedFolders;
  window.cleanOrphanedFolders = cleanOrphanedFolders;
  window.getStorageStats = getStorageStats;
  
  console.log('🧹 Scripts de limpieza de Storage cargados');
  console.log('Funciones disponibles:');
  console.log('  - detectOrphanedFolders()    : Detecta carpetas huérfanas');
  console.log('  - cleanOrphanedFolders()      : Limpia carpetas huérfanas (DRY RUN por defecto)');
  console.log('  - getStorageStats()           : Muestra estadísticas de Storage');
}