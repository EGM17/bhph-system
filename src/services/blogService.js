import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BLOG_POSTS_COLLECTION = 'blog_posts';
const BLOG_CATEGORIES_COLLECTION = 'blog_categories';

// ============================================
// BLOG POSTS
// ============================================

/**
 * Crear un nuevo post de blog
 */
export const createBlogPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), {
      ...postData,
      views: 0,
      status: postData.status || 'draft',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: postData.status === 'published' ? Timestamp.now() : null
    });
    
    console.log('Post creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando post:', error);
    throw error;
  }
};

/**
 * Actualizar un post existente
 */
export const updateBlogPost = async (postId, updates) => {
  try {
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const currentPost = await getDoc(postRef);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    // Si cambia de draft a published, agregar publishedAt
    if (updates.status === 'published' && currentPost.data().status === 'draft') {
      updateData.publishedAt = Timestamp.now();
    }
    
    await updateDoc(postRef, updateData);
    console.log('Post actualizado:', postId);
  } catch (error) {
    console.error('Error actualizando post:', error);
    throw error;
  }
};

/**
 * Eliminar un post
 */
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(db, BLOG_POSTS_COLLECTION, postId));
    console.log('Post eliminado:', postId);
  } catch (error) {
    console.error('Error eliminando post:', error);
    throw error;
  }
};

/**
 * Obtener un post por ID
 */
export const getBlogPostById = async (postId) => {
  try {
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      return {
        id: postSnap.id,
        ...postSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo post:', error);
    throw error;
  }
};

/**
 * Obtener un post por slug
 */
export const getBlogPostBySlug = async (slug) => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('slug', '==', slug),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo post por slug:', error);
    throw error;
  }
};

/**
 * Obtener todos los posts (admin)
 */
export const getAllBlogPosts = async (filters = {}) => {
  try {
    let q = collection(db, BLOG_POSTS_COLLECTION);
    const constraints = [];
    
    // Filtro por categoría
    if (filters.category_id) {
      constraints.push(where('category_id', '==', filters.category_id));
    }
    
    // Filtro por idioma
    if (filters.language) {
      constraints.push(where('language', '==', filters.language));
    }
    
    // Filtro por estado
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Ordenar por fecha de actualización (más recientes primero)
    constraints.push(orderBy('updatedAt', 'desc'));
    
    if (constraints.length > 0) {
      q = query(collection(db, BLOG_POSTS_COLLECTION), ...constraints);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo posts:', error);
    throw error;
  }
};

/**
 * Obtener posts publicados (público)
 */
export const getPublishedBlogPosts = async (filters = {}) => {
  try {
    const constraints = [
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    ];
    
    // Filtro por categoría
    if (filters.category_id) {
      constraints.unshift(where('category_id', '==', filters.category_id));
    }
    
    // Filtro por idioma
    if (filters.language) {
      constraints.unshift(where('language', '==', filters.language));
    }
    
    // Límite
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    const q = query(collection(db, BLOG_POSTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo posts publicados:', error);
    throw error;
  }
};

/**
 * Incrementar vistas de un post
 */
export const incrementBlogPostViews = async (postId) => {
  try {
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const currentViews = postSnap.data().views || 0;
      await updateDoc(postRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementando vistas:', error);
    // No lanzar error, es una operación secundaria
  }
};

// ============================================
// BLOG CATEGORIES
// ============================================

/**
 * Crear una nueva categoría
 */
export const createBlogCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, BLOG_CATEGORIES_COLLECTION), {
      ...categoryData,
      isActive: categoryData.isActive !== false,
      createdAt: Timestamp.now()
    });
    
    console.log('Categoría creada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creando categoría:', error);
    throw error;
  }
};

/**
 * Actualizar una categoría
 */
export const updateBlogCategory = async (categoryId, updates) => {
  try {
    const categoryRef = doc(db, BLOG_CATEGORIES_COLLECTION, categoryId);
    await updateDoc(categoryRef, updates);
    console.log('Categoría actualizada:', categoryId);
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    throw error;
  }
};

/**
 * Eliminar una categoría
 */
export const deleteBlogCategory = async (categoryId) => {
  try {
    // Verificar si hay posts usando esta categoría
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('category_id', '==', categoryId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('No se puede eliminar: hay posts usando esta categoría');
    }
    
    await deleteDoc(doc(db, BLOG_CATEGORIES_COLLECTION, categoryId));
    console.log('Categoría eliminada:', categoryId);
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    throw error;
  }
};

/**
 * Obtener todas las categorías
 */
export const getAllBlogCategories = async () => {
  try {
    const q = query(
      collection(db, BLOG_CATEGORIES_COLLECTION),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};

/**
 * Obtener categorías activas (público)
 */
export const getActiveBlogCategories = async () => {
  try {
    const q = query(
      collection(db, BLOG_CATEGORIES_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo categorías activas:', error);
    throw error;
  }
};

/**
 * Obtener una categoría por ID
 */
export const getBlogCategoryById = async (categoryId) => {
  try {
    const categoryRef = doc(db, BLOG_CATEGORIES_COLLECTION, categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (categorySnap.exists()) {
      return {
        id: categorySnap.id,
        ...categorySnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    throw error;
  }
};

/**
 * Reordenar categorías
 */
export const reorderBlogCategories = async (categoriesWithOrder) => {
  try {
    const batch = [];
    
    for (const category of categoriesWithOrder) {
      const categoryRef = doc(db, BLOG_CATEGORIES_COLLECTION, category.id);
      batch.push(updateDoc(categoryRef, { order: category.order }));
    }
    
    await Promise.all(batch);
    console.log('Categorías reordenadas');
  } catch (error) {
    console.error('Error reordenando categorías:', error);
    throw error;
  }
};