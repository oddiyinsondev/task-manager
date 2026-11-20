import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import type { Task, UserRole, TaskImage } from '../types';
import { TaskCard } from './TaskCard';

interface Props {
  tasks: Task[];
  role: UserRole;
  onOpenReportModal: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPreviewImage: (image: TaskImage) => void;
}

export const TimelineView: React.FC<Props> = ({
  tasks,
  role,
  onOpenReportModal,
  onDelete,
  onPreviewImage,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const groups: { [key: string]: Task[] } = {};
  pendingTasks.forEach((t) => {
    const key = t.dueDate || 'Sanasi ko‘rsatilmagan';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const sortedDates = Object.keys(groups).sort();

  const getDateTitle = (dateStr: string) => {
    if (dateStr === todayStr) return { title: 'Bugungi vazifalar', isToday: true };
    if (dateStr === tomorrowStr) return { title: 'Ertangi vazifalar', isToday: false };
    const d = new Date(dateStr);
    const text = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', weekday: 'long' });
    return { title: text, isToday: false };
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
        <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <h3 className="text-base font-bold text-white mb-1">Hozircha hech qanday task yo‘q</h3>
        <p className="text-xs text-slate-500">
          {role === 'admin'
            ? 'Yuqoridagi "+ Yangi task qo‘shish" tugmasi orqali yangi vazifa bering.'
            : 'Glass Pro hali yangi vazifa kiritmagan.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Kutilayotgan sanama-san tasklar */}
      {sortedDates.map((dateKey) => {
        const dateTasks = groups[dateKey];
        const dateInfo = getDateTitle(dateKey);

        return (
          <div key={dateKey} className="space-y-3">
            {/* Sananing sarlavhasi */}
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <div
                className={`p-1.5 rounded-lg ${
                  dateInfo.isToday ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{dateInfo.title}</span>
                <span className="text-xs text-slate-500 font-normal">({dateKey})</span>
                {dateInfo.isToday && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    Bugun
                  </span>
                )}
              </h2>
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {dateTasks.length} ta vazifa
              </span>
            </div>

            {/* Shu kungi tasklar kartalari */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  role={role}
                  onOpenReportModal={onOpenReportModal}
                  onDelete={onDelete}
                  onPreviewImage={onPreviewImage}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Bajarilgan va hisoboti topshirilgan vazifalar bo'limi */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <span>Bajarilgan & Hisoboti topshirilgan vazifalar</span>
            </h2>
            <span className="ml-auto text-xs text-emerald-400/80 font-medium">
              {completedTasks.length} ta bajarildi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                role={role}
                onOpenReportModal={onOpenReportModal}
                onDelete={onDelete}
                onPreviewImage={onPreviewImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
