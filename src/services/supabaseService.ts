import { createClient } from '@supabase/supabase-js';
import type { Task } from '../types';

export const SUPABASE_URL = 'https://jhffptymvmplwjavdthy.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_BdiFxDPNZua-mkK4Kcs0Cw_YiuIGaVz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase dan barcha vazifalarni o'qish
 */
export async function fetchTasksFromSupabase(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.warn('Supabase o‘qishda ogohlantirish:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      dueDate: item.due_date,
      dueTime: item.due_time || undefined,
      images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
      files: item.files ? (typeof item.files === 'string' ? JSON.parse(item.files) : item.files) : [],
      report: item.report ? (typeof item.report === 'string' ? JSON.parse(item.report) : item.report) : undefined,
      status: item.status || 'pending',
      completedAt: item.completed_at || undefined,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Supabase fetch xatosi:', err);
    return [];
  }
}

/**
 * Bitta vazifani Supabase ga saqlash yoki yangilash
 */
export async function saveTaskToSupabase(task: Task): Promise<boolean> {
  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      title: task.title,
      description: task.description || '',
      due_date: task.dueDate,
      due_time: task.dueTime || null,
      images: task.images || [],
      files: task.files || [],
      report: task.report || null,
      status: task.status,
      completed_at: task.completedAt || null,
      created_at: task.createdAt,
    });

    if (error) {
      console.error('Supabase ga yozishda xatolik:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save xatosi:', err);
    return false;
  }
}

/**
 * Bitta vazifani Supabase dan butunlay o'chirish
 */
export async function deleteTaskFromSupabase(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.error('Supabase o‘chirish xatosi:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Realtime o'zgarishlarni tinglash (Jonli sinxronizatsiya)
 */
export function subscribeToTasks(onUpdate: () => void) {
  try {
    const channel = supabase
      .channel('tasks_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
}
