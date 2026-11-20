import type { Task } from '../types';

const DB_NAME = 'TaskManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks_store';

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
 * IndexedDB dan barcha tasklarni olish (Excel va rasmlari bilan to'liq)
 */
export async function getAllTasksFromDB(): Promise<Task[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB o‘qishda xatolik:', err);
    return [];
  }
}

/**
 * IndexedDB ga tasklarni to'liq saqlash (Katta hajmdagi Excel/Word fayllari xatosiz sig'adi)
 */
export async function saveAllTasksToDB(tasks: Task[]): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Avval eskilarini tozalab, yangilarini yozamiz
      store.clear();

      for (const t of tasks) {
        store.put(t);
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB ga saqlashda xatolik:', err);
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
