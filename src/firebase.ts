// ==============================================================================
// ETTORE — Men's Essentials
// Firebase Firestore & Auth Integration Module
// ==============================================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

// 1. Initialize Firebase App and Services
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app, firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined);

// 2. Validate Connection to Firestore on Boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// 3. Structured Firestore Error Handling
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;
export type OperationType = typeof OperationType[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Firestore Products Operations
export function sortProductsNewestFirst(items: any[]) {
  return [...items].sort((a, b) => {
    const posA = typeof a?.position === 'number' && !isNaN(a.position) ? a.position : null;
    const posB = typeof b?.position === 'number' && !isNaN(b.position) ? b.position : null;
    if (posA !== null && posB !== null && posA !== posB) {
      return posA - posB;
    }
    if (posA !== null && posB === null) return -1;
    if (posA === null && posB !== null) return 1;

    const getSortWeight = (p: any) => {
      if (!p) return 0;
      if (p.createdAt) {
        const t = new Date(p.createdAt).getTime();
        if (!isNaN(t)) return t;
      }
      const numId = Number(p.id) || 0;
      if (numId > 100000) return numId;
      if (p.updatedAt) {
        const u = new Date(p.updatedAt).getTime();
        if (!isNaN(u)) return u;
      }
      return 100000 - numId;
    };
    return getSortWeight(b) - getSortWeight(a);
  });
}

export async function fetchFirestoreProducts() {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    const items: any[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      items.push({
        ...data,
        id: data.id !== undefined ? Number(data.id) : Number(docSnap.id)
      });
    });
    return sortProductsNewestFirst(items);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveFirestoreProduct(product: any) {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', String(product.id)), product);
    return product;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveFirestoreProductsOrder(products: any[]) {
  const path = 'products';
  try {
    const batch = writeBatch(db);
    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      if (!prod || prod.id === undefined) continue;
      batch.set(doc(db, 'products', String(prod.id)), {
        ...prod,
        position: i + 1
      });
    }
    await batch.commit();
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreProduct(productId: number | string) {
  const targetIdStr = String(productId).trim();
  const targetIdNum = Number(productId);
  const path = `products/${targetIdStr}`;
  try {
    await deleteDoc(doc(db, 'products', targetIdStr));
    const snap = await getDocs(collection(db, 'products'));
    const deletions: Promise<void>[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (docSnap.id === targetIdStr || Number(data?.id) === targetIdNum) {
        deletions.push(deleteDoc(doc(db, 'products', docSnap.id)));
      }
    });
    if (deletions.length > 0) {
      await Promise.all(deletions);
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 5. Firestore Orders Operations
export async function createFirestoreOrder(orderData: any) {
  const path = `orders/${orderData.id}`;
  try {
    const batch = writeBatch(db);
    // Write the order
    batch.set(doc(db, 'orders', orderData.id), orderData);
    await batch.commit();
    return orderData;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getFirestoreOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function fetchFirestoreOrders() {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    const list: any[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        ...data,
        id: data.id || docSnap.id,
        _docId: docSnap.id
      });
    });
    return list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateFirestoreOrderStatus(orderId: string, status: string) {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreOrder(orderId: string) {
  const normalizedId = String(orderId || '').trim().toUpperCase();
  const path = `orders/${normalizedId}`;
  try {
    // 1. Direct delete by canonical order ID
    await deleteDoc(doc(db, 'orders', normalizedId));
    // 2. Also scan collection for any document whose doc.id or data.id matches case-insensitively
    const snap = await getDocs(collection(db, 'orders'));
    const deletions: Promise<void>[] = [];
    snap.forEach(docSnap => {
      const docKey = String(docSnap.id || '').trim().toUpperCase();
      const fieldId = String(docSnap.data()?.id || '').trim().toUpperCase();
      if (docKey === normalizedId || fieldId === normalizedId) {
        deletions.push(deleteDoc(doc(db, 'orders', docSnap.id)));
      }
    });
    if (deletions.length > 0) {
      await Promise.all(deletions);
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 6. Persistent Media Storage in Firestore (Survives Container Restarts)
export async function saveFirestoreMedia(mediaId: string, dataUrl: string, mimeType: string = 'image/jpeg') {
  const safeId = mediaId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `media/${safeId}`;
  try {
    await setDoc(doc(db, 'media', safeId), {
      id: safeId,
      dataUrl,
      mimeType,
      createdAt: new Date().toISOString()
    });
    return safeId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getFirestoreMedia(mediaId: string) {
  const safeId = mediaId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `media/${safeId}`;
  try {
    const snap = await getDoc(doc(db, 'media', safeId));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    console.warn('Failed to load media from Firestore:', err);
    return null;
  }
}

// Catalog Initialization State in Firestore
export async function isCatalogInitialized(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'catalogMeta'));
    return snap.exists() && Boolean(snap.data()?.initialized);
  } catch {
    return false;
  }
}

export async function markCatalogInitialized() {
  const path = 'settings/catalogMeta';
  try {
    await setDoc(doc(db, 'settings', 'catalogMeta'), {
      initialized: true,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Firebase Storage Upload Helper (Optional fallback)
export async function uploadImageToFirebase(dataUrl: string, folder: string = 'products', filename?: string): Promise<string> {
  const safeName = (filename || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, 'data_url');
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// 7. Hero Slider Settings in Firestore
export async function fetchSliderSettings() {
  const path = 'settings/heroSlider';
  try {
    const snap = await getDoc(doc(db, 'settings', 'heroSlider'));
    if (!snap.exists()) return null;
    return snap.data()?.slides || null;
  } catch (err) {
    console.warn('Failed to load slider from Firestore:', err);
    return null;
  }
}

export async function saveSliderSettings(slides: any[]) {
  const path = 'settings/heroSlider';
  try {
    await setDoc(doc(db, 'settings', 'heroSlider'), {
      slides,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 8. CMS Settings in Firestore
export async function fetchCmsSettings() {
  const path = 'settings/cms';
  try {
    const snap = await getDoc(doc(db, 'settings', 'cms'));
    if (!snap.exists()) return null;
    return snap.data() || null;
  } catch (err) {
    console.warn('Failed to load CMS from Firestore:', err);
    return null;
  }
}

export async function saveCmsSettings(cmsData: any) {
  const path = 'settings/cms';
  try {
    await setDoc(doc(db, 'settings', 'cms'), {
      ...cmsData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 9. Testimonials in Firestore
export async function fetchTestimonialsSettings() {
  const path = 'settings/testimonials';
  try {
    const snap = await getDoc(doc(db, 'settings', 'testimonials'));
    if (!snap.exists()) return null;
    return snap.data()?.items || null;
  } catch (err) {
    console.warn('Failed to load testimonials from Firestore:', err);
    return null;
  }
}

export async function saveTestimonialsSettings(items: any[]) {
  const path = 'settings/testimonials';
  try {
    await setDoc(doc(db, 'settings', 'testimonials'), {
      items,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

