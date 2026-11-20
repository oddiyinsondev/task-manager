import type { Task } from '../types';
import { getAllTasksFromDB, saveAllTasksToDB, deleteSingleTaskFromDB } from './db';

const AUTH_KEY = 'simple_task_manager_auth_v3';
const INITIALIZED_FLAG = 'simple_task_manager_initialized_v4';

// 1. Tasklarni o'qish
export async function fetchTasksFromJson(): Promise<Task[]> {
  try {
    const dbTasks = await getAllTasksFromDB();

    // Agar tizim avval initsializatsiya qilingan bo'lsa, IndexedDB ning o'zidagi ma'lumot qat'iy master hisoblanadi (bo'sh bo'lsa ham bo'sh qaytaradi)
    const isInitialized = localStorage.getItem(INITIALIZED_FLAG);

    if (isInitialized) {
      return dbTasks || [];
    }

    // Eng birinchi marta kirganda:
    if (Array.isArray(dbTasks) && dbTasks.length > 0) {
      localStorage.setItem(INITIALIZED_FLAG, 'true');
      return dbTasks;
    }

    // Agar IndexedDB bo'sh bo'lsa va hali initsializatsiya qilinmagan bo'lsa:
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          await saveAllTasksToDB(data);
          localStorage.setItem(INITIALIZED_FLAG, 'true');
          return data;
        }
      }
    } catch (e) {}

    localStorage.setItem(INITIALIZED_FLAG, 'true');
    return [];
  } catch (err) {
    console.error('Tasklarni o‘qishda xatolik:', err);
    return [];
  }
}

// 2. Tasklarni xavfsiz saqlash
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  localStorage.setItem(INITIALIZED_FLAG, 'true');

  // 1. IndexedDB ga to'liq va kafolatli saqlaymiz
  try {
    await saveAllTasksToDB(tasks);
  } catch (err) {
    console.error('IndexedDB saqlashda xatolik:', err);
  }

  // 2. Mahalliy yoki Vercel api/tasks ga ham yuborish
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
