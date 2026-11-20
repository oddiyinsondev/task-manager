import type { Task } from '../types';

const DB_NAME = 'GlassProTaskManagerDB_v3';
const DB_VERSION = 1;
const STORE_NAME = 'tasks_permanent_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB mavjud emas'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Barcha tasklarni xavfsiz o'qish (Hech qachon o'chib ketmaydi)
 */
export async function getAllTasksFromDB(): Promise<Task[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Tasklarni saqlash (Eski tasklarni o'chirib yubormaydi, yangilaydi)
 */
export async function saveAllTasksToDB(tasks: Task[]): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      store.clear();
      for (const t of tasks) {
        store.put(t);
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Bitta taskni o'chirish
 */
export async function deleteSingleTaskFromDB(taskId: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(taskId);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    return false;
  }
}
