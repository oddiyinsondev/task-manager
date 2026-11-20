import type { Task } from '../types';
import { getAllTasksFromDB, saveAllTasksToDB, deleteSingleTaskFromDB } from './db';
import {
  fetchTasksFromSupabase,
  saveTaskToSupabase,
  deleteTaskFromSupabase,
} from './supabaseService';

const AUTH_KEY = 'simple_task_manager_auth_v3';

// 1. Tasklarni o'qish (Supabase Buluti + IndexedDB)
export async function fetchTasksFromJson(): Promise<Task[]> {
  // A) Supabase dan o'qish (Jonli bulutli baza)
  try {
    const remoteTasks = await fetchTasksFromSupabase();
    if (Array.isArray(remoteTasks) && remoteTasks.length > 0) {
      await saveAllTasksToDB(remoteTasks);
      return remoteTasks;
    }
  } catch (err) {}

  // B) Agar Supabase hali bo'sh bo'lsa yoki ulanmagan bo'lsa, mahalliy IndexedDB dan olamiz
  try {
    const dbTasks = await getAllTasksFromDB();
    if (Array.isArray(dbTasks)) {
      return dbTasks;
    }
  } catch (err) {}

  return [];
}

// 2. Tasklarni saqlash (Supabase Buluti + IndexedDB)
export async function persistTasksToJson(tasks: Task[]): Promise<boolean> {
  // 1. IndexedDB ga saqlash
  try {
    await saveAllTasksToDB(tasks);
  } catch (err) {}

  // 2. Supabase ga saqlash
  try {
    for (const t of tasks) {
      await saveTaskToSupabase(t);
    }
  } catch (err) {}

  return true;
}

// 3. Bitta taskni o'chirish
export async function deleteTaskPermanently(taskId: string): Promise<boolean> {
  try {
    await deleteTaskFromSupabase(taskId);
  } catch (e) {}

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
