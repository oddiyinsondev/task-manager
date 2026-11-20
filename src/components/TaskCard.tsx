import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Trash2, Eye, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Task, UserRole, TaskImage } from '../types';
import { notifyTaskCompleted } from '../services/telegramService';

interface Props {
  task: Task;
  role: UserRole;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPreviewImage: (image: TaskImage) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  role,
  onComplete,
  onDelete,
  onPreviewImage,
}) => {
  const [isSending, setIsSending] = useState(false);
  const isCompleted = task.status === 'completed';

  const handleMarkAsDone = async () => {
    setIsSending(true);

    try {
      // 1. Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      // 2. Telegram botga darhol xabar yuborish
      await notifyTaskCompleted(task);

      // 3. Statusni yangilash
      onComplete(task.id);
    } catch (err) {
      console.error('Xabar yuborishda xatolik:', err);
      onComplete(task.id);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between ${
        isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      <div>
        {/* Top Header: Date and Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{task.dueDate}</span>
            {task.dueTime && (
              <>
                <span>•</span>
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{task.dueTime}</span>
              </>
            )}
          </div>

          {isCompleted ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bajarildi
            </span>
          ) : (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Kutilmoqda
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-base mb-1.5 ${
            isCompleted ? 'text-slate-300 line-through' : 'text-white'
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-400 mb-3 whitespace-pre-wrap leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Images list */}
        {task.images && task.images.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Rasmlar ({task.images.length} ta):
            </div>
            <div className="grid grid-cols-3 gap-2">
              {task.images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onPreviewImage(img)}
                  className="group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:border-indigo-400 transition-all"
                >
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        {/* If Completed */}
        {isCompleted ? (
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Bajarildi: {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : 'Bugun'}
            </span>
          </div>
        ) : (
          /* "Bajardim" button for Developer */
          <button
            onClick={handleMarkAsDone}
            disabled={isSending}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Bajardim (Telegramga xabar boradi)</span>
              </>
            )}
          </button>
        )}

        {/* Delete button (Admin only) */}
        {role === 'admin' && (
          <button
            onClick={() => {
              if (confirm('Ushbu taskni o‘chirishni xohlaysizmi?')) {
                onDelete(task.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
            title="O‘chirish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
