import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Task, UserRole, TaskImage, TaskReport } from './types';
import {
  loadLocalTasks,
  saveLocalTasks,
  getSavedRole,
  saveRole,
  fetchTasksFromJson,
  persistTasksToJson,
} from './services/storageService';
import { notifyTaskCompleted } from './services/telegramService';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { TimelineView } from './components/TimelineView';
import { TaskModal } from './components/TaskModal';
import { ReportModal } from './components/ReportModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';

export function App() {
  const [role, setRole] = useState<UserRole | null>(getSavedRole);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<Task | null>(null);
  const [previewImage, setPreviewImage] = useState<TaskImage | null>(null);

  // Dastlabki yuklash va tasks.json bilan doimiy sinxronizatsiya
  useEffect(() => {
    // 1. Dastlabki o'qish (tasks.json dan)
    fetchTasksFromJson().then((loaded) => {
      setTasks(loaded);
    });

    // 2. Har 4 soniyada tasks.json dan yangilanishlarni tekshirish (Real-time sync)
    const interval = setInterval(() => {
      fetchTasksFromJson().then((remoteTasks) => {
        setTasks((prev) => {
          // Agar ma'lumotlar o'zgargan bo'lsa yangilaymiz
          if (JSON.stringify(prev) !== JSON.stringify(remoteTasks)) {
            return remoteTasks;
          }
          return prev;
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userRole: UserRole) => {
    setRole(userRole);
    saveRole(userRole);
  };

  const handleLogout = () => {
    setRole(null);
    saveRole(null);
  };

  // Ma'lumotlarni tasks.json ga saqlash
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    persistTasksToJson(newTasks);
  };

  const handleSaveTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    updateTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
  };

  // Hisobot topshirilganda
  const handleSubmitReport = (taskId: string, report: TaskReport) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const now = new Date().toISOString();

    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: 'completed' as const,
            completedAt: t.completedAt || now,
            report,
          }
        : t
    );
    updateTasks(updated);

    // Confetti effekti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    // Telegram botga Glass Pro ga hisobot borishi
    if (targetTask) {
      notifyTaskCompleted(targetTask, report).catch(() => {});
    }
  };

  const handleOpenReportModal = (task: Task) => {
    setSelectedTaskForReport(task);
    setIsReportModalOpen(true);
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
                ? 'Siz yangi tasklar, rasmlar va fayllar (Word, Excel) kiritasiz. Dasturchi hisobot yuklaganda botingizga hisobot keladi.'
                : 'Glass Pro bergan vazifalarni ko‘ring, bajargach hisobot (Word, Excel, skrinshot) yuklab topshiring.'}
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

        {/* Timeline View (Sanama-san vazifalar va hisobotlar) */}
        <TimelineView
          tasks={tasks}
          role={role}
          onOpenReportModal={handleOpenReportModal}
          onDelete={handleDeleteTask}
          onPreviewImage={(img) => setPreviewImage(img)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Task Manager • Glass Pro & Telegram Bot Notifications
      </footer>

      {/* 1. Yangi task yaratish modali */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onPreviewImage={(img) => setPreviewImage(img)}
      />

      {/* 2. Qilingan ishlar bo'yicha hisobot topshirish modali (Word, Excel, skrinshot) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedTaskForReport(null);
        }}
        task={selectedTaskForReport}
        role={role}
        onSubmitReport={handleSubmitReport}
        onPreviewImage={(img) => setPreviewImage(img)}
      />

      {/* 3. Rasmlarni to'liq ekranda ko'rish */}
      <ImageLightboxModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}

export default App;
