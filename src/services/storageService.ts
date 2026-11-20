import type { Task } from '../types';
import { getAllTasksFromDB, saveAllTasksToDB } from './db';

const AUTH_KEY = 'simple_task_manager_auth_v3';

// 1. Tasklarni o'qish (IndexedDB + tasks.json API)
export async function fetchTasksFromJson(): Promise<Task[]> {
  // Avval ishonchli IndexedDB dan olamiz (katta Excel va rasmlar saqlanadigan joy)
  try {
    const dbTasks = await getAllTasksFromDB();
    if (Array.isArray(dbTasks) && dbTasks.length > 0) {
      return dbTasks;
    }
  } catch (e) {}

  // Agar IndexedDB bo'sh bo'lsa, lokal /api/tasks dan tekshiramiz
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

  return [];
}

// 2. Tasklarni xavfsiz saqlash (IndexedDB + tasks.json)
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  // 1. IndexedDB ga to'liq va kafolatli saqlaymiz (Excel va rasmlar sig'adi)
  try {
    await saveAllTasksToDB(tasks);
  } catch (err) {
    console.error('IndexedDB saqlashda xatolik:', err);
  }

  // 2. Mahalliy serverda bo'lsa tasks.json ga yozish
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
