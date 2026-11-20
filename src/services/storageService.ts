import type { Task } from '../types';

const STORAGE_KEY = 'simple_task_manager_clean_v3';
const AUTH_KEY = 'simple_task_manager_auth_v3';

// Toza bo'sh ro'yxat
export function getInitialTasks(): Task[] {
  return [];
}

export function loadLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Tasklarni saqlashda xatolik:', e);
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

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('simple_task_manager_v2');
    localStorage.removeItem('task_manager_tasks_v1');
  } catch {}
}
