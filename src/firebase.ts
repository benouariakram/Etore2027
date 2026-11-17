// ==============================================================================
// ETTORE / MODANOVA — Men's Essentials
// Firebase Firestore & Auth Integration Module (Dual Admin SDK + Web SDK)
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
  writeBatch
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import {
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  cert as adminCert,
  applicationDefault as adminApplicationDefault,
  type App as AdminApp
} from 'firebase-admin/app';
import {
  getFirestore as getAdminFirestore,
  type Firestore as AdminFirestore
} from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

// 1. Initialize Firebase Web Client App & Services (Fallback when no Service Account is configured)
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
export const storage = getStorage(app, firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined);

// 1b. Initialize Privileged Firebase Admin SDK when Service Account is provided
let adminApp: AdminApp | null = null;
let adminDb: AdminFirestore | null = null;

function parseServiceAccountFromEnv(): Record<string, any> | null {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (!raw || raw === '""') return null;
  try {
    if (raw.startsWith('{')) {
      return JSON.parse(raw);
    }
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    if (decoded.trim().startsWith('{')) {
      return JSON.parse(decoded);
    }
  } catch (err) {
    console.warn('[Firebase Admin] Invalid FIREBASE_SERVICE_ACCOUNT format:', err instanceof Error ? err.message : String(err));
  }
  return null;
}

try {
  const serviceAccountObj = parseServiceAccountFromEnv();
  const hasGacPath = Boolean(String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim());

  if (serviceAccountObj) {
    adminApp = getAdminApps().length > 0
      ? getAdminApps()[0]
      : initializeAdminApp({
          credential: adminCert(serviceAccountObj as any),
          projectId: serviceAccountObj.project_id || firebaseConfig.projectId
        });
    adminDb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
  } else if (hasGacPath) {
    adminApp = getAdminApps().length > 0
      ? getAdminApps()[0]
      : initializeAdminApp({
          credential: adminApplicationDefault(),
          projectId: firebaseConfig.projectId
        });
    adminDb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
  }
} catch (err) {
  console.warn('[Firebase Admin] Initialization skipped, using standard Firestore SDK:', err instanceof Error ? err.message : String(err));
  adminApp = null;
  adminDb = null;
}

export function isFirebaseAdminActive(): boolean {
  return Boolean(adminDb);
}

export function getFirestoreDriverMode(): 'firebase-admin' | 'firebase-client' {
  return adminDb ? 'firebase-admin' : 'firebase-client';
}

// Unified internal Firestore operations (routes through firebase-admin when active)
async function fsGetDoc(colName: string, docId: string): Promise<{ exists: boolean; data: () => any }> {
  if (adminDb) {
    const snap = await adminDb.collection(colName).doc(docId).get();
    return {
      exists: snap.exists,
      data: () => snap.data()
    };
  }
  const snap = await getDoc(doc(db, colName, docId));
  return {
    exists: snap.exists(),
    data: () => snap.data()
  };
}

async function fsGetCollection(colName: string): Promise<Array<{ id: string; data: () => any }>> {
  if (adminDb) {
    const snap = await adminDb.collection(colName).get();
    return snap.docs.map((d) => ({ id: d.id, data: () => d.data() }));
  }
  const snap = await getDocs(collection(db, colName));
  const out: Array<{ id: string; data: () => any }> = [];
  snap.forEach((d) => {
    out.push({ id: d.id, data: () => d.data() });
  });
  return out;
}

async function fsSetDoc(colName: string, docId: string, data: Record<string, any>): Promise<void> {
  if (adminDb) {
    await adminDb.collection(colName).doc(docId).set(data);
    return;
  }
  await setDoc(doc(db, colName, docId), data);
}

async function fsUpdateDoc(colName: string, docId: string, data: Record<string, any>): Promise<void> {
  if (adminDb) {
    await adminDb.collection(colName).doc(docId).update(data);
    return;
  }
  await updateDoc(doc(db, colName, docId), data);
}

async function fsDeleteDoc(colName: string, docId: string): Promise<void> {
  if (adminDb) {
    await adminDb.collection(colName).doc(docId).delete();
    return;
  }
  await deleteDoc(doc(db, colName, docId));
}

// 2. Validate Connection to Firestore on Boot
export async function testConnection() {
  try {
    if (adminDb) {
      await adminDb.collection('test').doc('connection').get();
    } else {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
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
    const docs = await fsGetCollection(path);
    const items: any[] = docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: data.id !== undefined ? Number(data.id) : Number(docSnap.id)
      };
    });
    return sortProductsNewestFirst(items);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveFirestoreProduct(product: any) {
  const path = `products/${product.id}`;
  try {
    await fsSetDoc('products', String(product.id), product);
    return product;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveFirestoreProductsOrder(products: any[]) {
  const path = 'products';
  try {
    if (adminDb) {
      const batch = adminDb.batch();
      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        if (!prod || prod.id === undefined) continue;
        batch.set(adminDb.collection('products').doc(String(prod.id)), {
          ...prod,
          position: i + 1
        });
      }
      await batch.commit();
      return true;
    }

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
    await fsDeleteDoc('products', targetIdStr);
    const docs = await fsGetCollection('products');
    const deletions: Promise<void>[] = [];
    for (const docSnap of docs) {
      const data = docSnap.data();
      if (docSnap.id === targetIdStr || Number(data?.id) === targetIdNum) {
        deletions.push(fsDeleteDoc('products', docSnap.id));
      }
    }
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
    await fsSetDoc('orders', orderData.id, orderData);
    return orderData;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getFirestoreOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    const snap = await fsGetDoc('orders', orderId);
    if (!snap.exists) return null;
    return snap.data();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function fetchFirestoreOrders() {
  const path = 'orders';
  try {
    const docs = await fsGetCollection(path);
    const list: any[] = docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: data.id || docSnap.id,
        _docId: docSnap.id
      };
    });
    return list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateFirestoreOrderStatus(orderId: string, status: string) {
  const path = `orders/${orderId}`;
  try {
    await fsUpdateDoc('orders', orderId, {
      status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateFirestoreOrder(orderId: string, orderData: any) {
  const normalizedId = String(orderId || orderData?.id || '').trim().toUpperCase();
  const path = `orders/${normalizedId}`;
  const cleanOrder: Record<string, any> = {
    id: normalizedId,
    date: String(orderData.date || new Date().toISOString()),
    status: String(orderData.status || 'En attente'),
    customerName: String(orderData.customerName || '').trim(),
    customerPhone: String(orderData.customerPhone || '').trim(),
    city: String(orderData.city || '').trim(),
    address: String(orderData.address || '').trim(),
    notes: String(orderData.notes || '').trim(),
    items: Array.isArray(orderData.items) ? orderData.items : [],
    subtotal: Number(orderData.subtotal || 0),
    discount: Number(orderData.discount || 0),
    promoCode: orderData.promoCode ? String(orderData.promoCode).trim() : null,
    shippingFee: Number(orderData.shippingFee || 0),
    realShippingCost: orderData.realShippingCost !== undefined && orderData.realShippingCost !== null
      ? Math.max(0, Number(orderData.realShippingCost) || 0)
      : null,
    shipment: orderData.shipment && typeof orderData.shipment === 'object' ? orderData.shipment : null,
    total: Number(orderData.total || 0),
    paymentMethod: String(orderData.paymentMethod || 'COD (Paiement à la livraison)'),
    updatedAt: new Date().toISOString()
  };
  try {
    await fsSetDoc('orders', normalizedId, cleanOrder);
    return cleanOrder;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateFirestoreBulkOrderStatuses(orderIds: string[], status: string) {
  const path = 'orders';
  try {
    const nowIso = new Date().toISOString();
    if (adminDb) {
      const batch = adminDb.batch();
      for (const rawId of orderIds) {
        const cleanId = String(rawId || '').trim().toUpperCase();
        if (!cleanId) continue;
        batch.update(adminDb.collection('orders').doc(cleanId), {
          status,
          updatedAt: nowIso
        });
      }
      await batch.commit();
      return true;
    }

    const batch = writeBatch(db);
    for (const rawId of orderIds) {
      const cleanId = String(rawId || '').trim().toUpperCase();
      if (!cleanId) continue;
      batch.update(doc(db, 'orders', cleanId), {
        status,
        updatedAt: nowIso
      });
    }
    await batch.commit();
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreOrder(orderId: string) {
  const normalizedId = String(orderId || '').trim().toUpperCase();
  const path = `orders/${normalizedId}`;
  try {
    await fsDeleteDoc('orders', normalizedId);
    const docs = await fsGetCollection('orders');
    const deletions: Promise<void>[] = [];
    for (const docSnap of docs) {
      const docKey = String(docSnap.id || '').trim().toUpperCase();
      const fieldId = String(docSnap.data()?.id || '').trim().toUpperCase();
      if (docKey === normalizedId || fieldId === normalizedId) {
        deletions.push(fsDeleteDoc('orders', docSnap.id));
      }
    }
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
    await fsSetDoc('media', safeId, {
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
  try {
    const snap = await fsGetDoc('media', safeId);
    if (!snap.exists) return null;
    return snap.data();
  } catch (err) {
    console.warn('Failed to load media from Firestore:', err);
    return null;
  }
}

// Catalog Initialization State in Firestore
export async function isCatalogInitialized(): Promise<boolean> {
  try {
    const snap = await fsGetDoc('settings', 'catalogMeta');
    return snap.exists && Boolean(snap.data()?.initialized);
  } catch {
    return false;
  }
}

export async function markCatalogInitialized() {
  const path = 'settings/catalogMeta';
  try {
    await fsSetDoc('settings', 'catalogMeta', {
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
  try {
    const snap = await fsGetDoc('settings', 'heroSlider');
    if (!snap.exists) return null;
    return snap.data()?.slides || null;
  } catch (err) {
    console.warn('Failed to load slider from Firestore:', err);
    return null;
  }
}

export async function saveSliderSettings(slides: any[]) {
  const path = 'settings/heroSlider';
  try {
    await fsSetDoc('settings', 'heroSlider', {
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
  try {
    const snap = await fsGetDoc('settings', 'cms');
    if (!snap.exists) return null;
    return snap.data() || null;
  } catch (err) {
    console.warn('Failed to load CMS from Firestore:', err);
    return null;
  }
}

export async function saveCmsSettings(cmsData: any) {
  const path = 'settings/cms';
  try {
    await fsSetDoc('settings', 'cms', {
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
  try {
    const snap = await fsGetDoc('settings', 'testimonials');
    if (!snap.exists) return null;
    return snap.data()?.items || null;
  } catch (err) {
    console.warn('Failed to load testimonials from Firestore:', err);
    return null;
  }
}

export async function saveTestimonialsSettings(items: any[]) {
  const path = 'settings/testimonials';
  try {
    await fsSetDoc('settings', 'testimonials', {
      items,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 10. Admin Security & Automatic WhatsApp Notification Config in Firestore
export async function fetchAdminConfig() {
  try {
    const snap = await fsGetDoc('settings', 'adminConfig');
    if (!snap.exists) return null;
    return snap.data() || null;
  } catch (err) {
    console.warn('Failed to load adminConfig from Firestore:', err);
    return null;
  }
}

export async function saveAdminConfig(configData: any) {
  const path = 'settings/adminConfig';
  try {
    await fsSetDoc('settings', 'adminConfig', {
      ...configData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 11. Discount Coupons Settings in Firestore
export async function fetchCouponsSettings() {
  try {
    const snap = await fsGetDoc('settings', 'coupons');
    if (!snap.exists) return null;
    return snap.data()?.items || null;
  } catch (err) {
    console.warn('Failed to load coupons from Firestore:', err);
    return null;
  }
}

export async function saveCouponsSettings(items: any[]) {
  const path = 'settings/coupons';
  try {
    await fsSetDoc('settings', 'coupons', {
      items,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
