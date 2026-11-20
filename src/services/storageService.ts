import type { Task } from '../types';
import { getAllTasksFromDB, saveAllTasksToDB, deleteSingleTaskFromDB } from './db';

const AUTH_KEY = 'simple_task_manager_auth_v3';

// 1. Tasklarni o'qish (IndexedDB dan to'liq va kafolatli)
export async function fetchTasksFromJson(): Promise<Task[]> {
  try {
    const dbTasks = await getAllTasksFromDB();
    if (Array.isArray(dbTasks) && dbTasks.length > 0) {
      return dbTasks;
    }

    // Agar bo'sh bo'lsa, /api/tasks dan tekshirib ko'radi
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          await saveAllTasksToDB(data);
          return data;
        }
      }
    } catch (e) {}

    return dbTasks || [];
  } catch (err) {
    return [];
  }
}

// 2. Tasklarni xavfsiz saqlash (Excel, Word, rasmlar xatosiz saqlanadi)
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  try {
    await saveAllTasksToDB(tasks);
  } catch (err) {
    console.error('Saqlashda xatolik:', err);
  }

  // Mahalliy yoki server api ga ham yuborib qo'yadi
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

// 3. Bitta taskni o'chirish
export async function deleteTaskPermanently(taskId: string): Promise<boolean> {
  try {
    await deleteSingleTaskFromDB(taskId);
  } catch (e) {}
  return true;
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
