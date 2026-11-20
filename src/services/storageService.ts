import type { Task } from '../types';

const STORAGE_KEY = 'simple_task_manager_clean_v3';
const AUTH_KEY = 'simple_task_manager_auth_v3';

// 1. tasks.json faylidan o'qish (API orqali)
export async function fetchTasksFromJson(): Promise<Task[]> {
  try {
    const res = await fetch('/api/tasks');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Mahalliy keshga ham yangilab qo'yamiz
        saveLocalTasks(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('tasks.json dan o‘qib bo‘lmadi, lokal keshdan olinadi:', err);
  }
  return loadLocalTasks();
}

// 2. tasks.json fayliga yozish (API orqali)
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  // Avval lokal saqlaymiz
  saveLocalTasks(tasks);

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tasks, null, 2),
    });
    return res.ok;
  } catch (err) {
    console.error('tasks.json ga yozishda xatolik:', err);
    return false;
  }
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
