import type { Task } from '../types';

const STORAGE_KEY = 'simple_task_manager_clean_v3';
const AUTH_KEY = 'simple_task_manager_auth_v3';

// Markaziy bulutli JSON baza (Vercel va barcha qurilmalar uchun umumiy)
const CLOUD_JSON_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1f8d99bea0770';

// 1. Tasklarni o'qish (Avval Bulutli JSON bazadan, keyin /api/tasks dan, oxiri lokal keshdan)
export async function fetchTasksFromJson(): Promise<Task[]> {
  // A) Bulutli markaziy JSON bazasidan o'qish (Serverda va Vercelda 100% ishlaydi)
  try {
    const cloudRes = await fetch(CLOUD_JSON_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (cloudRes.ok) {
      const result = await cloudRes.json();
      const cloudTasks = result?.data?.tasks;
      if (Array.isArray(cloudTasks)) {
        saveLocalTasks(cloudTasks);
        return cloudTasks;
      }
    }
  } catch (err) {
    // Agar internet xatosi bo'lsa
  }

  // B) Mahalliy /api/tasks dan o'qish (npm run dev mahalliy rejimda)
  try {
    const localRes = await fetch('/api/tasks');
    if (localRes.ok) {
      const localData = await localRes.json();
      if (Array.isArray(localData)) {
        saveLocalTasks(localData);
        return localData;
      }
    }
  } catch (e) {}

  // C) Zaxira sifatida lokal keshdan
  return loadLocalTasks();
}

// 2. Tasklarni saqlash (Ham bulutli bazaga, ham lokal tasks.json ga)
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  // Har doim lokal keshga yozamiz
  saveLocalTasks(tasks);

  // A) Bulutli markaziy JSON bazasiga yozish (Serverda ishlaydi)
  try {
    fetch(CLOUD_JSON_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'task_manager_store',
        data: {
          tasks,
        },
      }),
    }).catch(() => {});
  } catch (err) {}

  // B) Mahalliy /api/tasks ga yozish (mahalliy tasks.json fayli uchun)
  try {
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tasks, null, 2),
    }).catch(() => {});
  } catch (err) {}

  return true;
}

// LocalStorage yordamchilari (Fallback)
export function loadLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Lokal keshda xatolik:', e);
  }
}

export function getSavedRole(): 'admin' | 'developer' | null {
  try {
    return localStorage.getItem(AUTH_KEY) as 'admin' | 'developer' | null;
  } catch {
    return null;
  }
}

export function saveRole(role: 'admin' | 'developer' | null): void {
  try {
    if (role) {
      localStorage.setItem(AUTH_KEY, role);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch {}
}
