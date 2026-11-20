import { useState, useEffect } from 'react';
import type { Task, UserRole, TaskImage } from './types';
import {
  loadLocalTasks,
  saveLocalTasks,
  getSavedRole,
  saveRole,
} from './services/storageService';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { TimelineView } from './components/TimelineView';
import { TaskModal } from './components/TaskModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';

export function App() {
  const [role, setRole] = useState<UserRole | null>(getSavedRole);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<TaskImage | null>(null);

  // Dastlabki yuklash
  useEffect(() => {
    // Eski demo ma'lumotlarni tozalash
    try {
      localStorage.removeItem('task_manager_tasks_v1');
      localStorage.removeItem('task_manager_settings_v1');
      localStorage.removeItem('simple_task_manager_v2');
      localStorage.removeItem('simple_task_manager_auth_v2');
    } catch {}

    const loaded = loadLocalTasks();
    setTasks(loaded);
  }, []);

  const handleLogin = (userRole: UserRole) => {
    setRole(userRole);
    saveRole(userRole);
  };

  const handleLogout = () => {
    setRole(null);
    saveRole(null);
  };

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveLocalTasks(newTasks);
  };

  const handleSaveTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    updateTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
  };

  const handleCompleteTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
          }
        : t
    );
    updateTasks(updated);
  };

  // Agar login qilmagan bo'lsa, Login ekrani chiqadi
  if (!role) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        role={role}
        onLogout={handleLogout}
        onOpenCreateTask={() => setIsTaskModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Simple Info Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              {role === 'admin' ? 'Xush kelibsiz, Glass Pro!' : 'Xush kelibsiz, Dasturchi!'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {role === 'admin'
                ? 'Siz yangi tasklar, rasmlar va fayllar (Word, Excel) kiritasiz. Dasturchi bajarganda botingizga hisobot keladi.'
                : 'Glass Pro bergan vazifalarni ko‘ring va bajarganingizdan so‘ng "Bajardim" tugmasini bosing.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              {pendingCount} ta kutilmoqda
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              {completedCount} ta bajarildi
            </span>
          </div>
        </div>

        {/* Timeline View (Sanama-san vazifalar) */}
        <TimelineView
          tasks={tasks}
          role={role}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onPreviewImage={(img) => setPreviewImage(img)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Task Manager • Telegram: @dasturchilar_p26_bot
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onPreviewImage={(img) => setPreviewImage(img)}
      />

      <ImageLightboxModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}

export default App;
