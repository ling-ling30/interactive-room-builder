/**
 * Persistent 3D Model Storage using IndexedDB.
 * Eliminates browser localStorage 5MB quota errors when uploading .glb / .gltf assets.
 */

const DB_NAME = 'MonisSims3DModelDB';
const DB_VERSION = 1;
const STORE_NAME = 'models';

export interface StoredModel {
  id: string; // productId or custom ID
  fileName: string;
  fileType: 'glb' | 'gltf';
  blob: Blob;
  sizeBytes: number;
  updatedAt: number;
  companionFiles?: Record<string, Blob>; // For .gltf with separate .bin or texture files
}

// In-memory cache of created object URLs to prevent redundant blob URL generation
const objectUrlCache = new Map<string, string>();
const companionUrlCache = new Map<string, Map<string, string>>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a 3D model file (and optional companion files like .bin) to IndexedDB.
 */
export async function saveModelToStorage(
  id: string,
  primaryFile: File | Blob,
  fileName: string,
  companionFiles?: Record<string, Blob>
): Promise<string> {
  const db = await openDB();
  const ext = fileName.split('.').pop()?.toLowerCase();
  const fileType: 'glb' | 'gltf' = ext === 'gltf' ? 'gltf' : 'glb';

  const record: StoredModel = {
    id,
    fileName,
    fileType,
    blob: primaryFile,
    sizeBytes: primaryFile.size,
    updatedAt: Date.now(),
    companionFiles,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(record);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });

  // Revoke previous blob URL if exists
  if (objectUrlCache.has(id)) {
    URL.revokeObjectURL(objectUrlCache.get(id)!);
    objectUrlCache.delete(id);
  }

  // Create and cache new Blob URL
  const blobUrl = URL.createObjectURL(primaryFile);
  objectUrlCache.set(id, blobUrl);

  // Cache companion files URLs if any (.bin / textures)
  if (companionFiles) {
    const subMap = new Map<string, string>();
    for (const [name, compBlob] of Object.entries(companionFiles)) {
      subMap.set(name, URL.createObjectURL(compBlob));
    }
    companionUrlCache.set(id, subMap);
  }

  return blobUrl;
}

/**
 * Get an active blob URL for a model ID from storage.
 */
export async function getModelBlobUrl(id: string): Promise<string | null> {
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  try {
    const db = await openDB();
    const record = await new Promise<StoredModel | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => resolve(getReq.result as StoredModel | undefined);
      getReq.onerror = () => reject(getReq.error);
    });

    if (!record || !record.blob) return null;

    const blobUrl = URL.createObjectURL(record.blob);
    objectUrlCache.set(id, blobUrl);

    if (record.companionFiles) {
      const subMap = new Map<string, string>();
      for (const [name, compBlob] of Object.entries(record.companionFiles)) {
        subMap.set(name, URL.createObjectURL(compBlob));
      }
      companionUrlCache.set(id, subMap);
    }

    return blobUrl;
  } catch (err) {
    console.warn(`Failed to retrieve 3D model ${id} from IndexedDB:`, err);
    return null;
  }
}

/**
 * Get companion file URLs for a model (for multi-file .gltf with .bin/textures).
 */
export function getCompanionFileUrl(modelId: string, fileName: string): string | undefined {
  const subMap = companionUrlCache.get(modelId);
  return subMap?.get(fileName);
}

/**
 * Delete model from IndexedDB.
 */
export async function deleteModelFromStorage(id: string): Promise<void> {
  if (objectUrlCache.has(id)) {
    URL.revokeObjectURL(objectUrlCache.get(id)!);
    objectUrlCache.delete(id);
  }
  if (companionUrlCache.has(id)) {
    const subMap = companionUrlCache.get(id)!;
    subMap.forEach(url => URL.revokeObjectURL(url));
    companionUrlCache.delete(id);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(id);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch (err) {
    console.warn('Failed to delete model from storage:', err);
  }
}
