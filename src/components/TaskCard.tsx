import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  FileSpreadsheet,
  FileText,
  FileIcon,
  FileCheck2,
  Edit3,
} from 'lucide-react';
import type { Task, UserRole, TaskImage, TaskFile } from '../types';
import { formatFileSize, downloadTaskFile } from '../services/fileUtils';

interface Props {
  task: Task;
  role: UserRole;
  onOpenReportModal: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPreviewImage: (image: TaskImage) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  onOpenReportModal,
  onDelete,
  onPreviewImage,
}) => {
  const isCompleted = task.status === 'completed';
  const hasReport = Boolean(task.report);

  const getDocIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    return <FileIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
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
        {/* Top Header: Date, Status and Delete Button */}
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

          <div className="flex items-center gap-2">
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

            {/* O'chirish tugmasi har qanday holatda har bir kartada turadi */}
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors ml-1"
              title="Vazifani o‘chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-base mb-1.5 ${
            isCompleted ? 'text-slate-200' : 'text-white'
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

        {/* Attached Initial Images */}
        {task.images && task.images.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Topshiriq rasmlari ({task.images.length} ta):
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

        {/* Attached Initial Documents (Word, Excel) */}
        {task.files && task.files.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Topshiriq hujjatlari ({task.files.length} ta):
            </div>
            <div className="space-y-1.5">
              {task.files.map((f: TaskFile) => (
                <div
                  key={f.id}
                  onClick={() => downloadTaskFile(f)}
                  className="flex items-center justify-between p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs cursor-pointer transition-colors group"
                  title="Yuklab olish uchun bosing"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {getDocIcon(f.name)}
                    <span className="text-slate-200 truncate group-hover:text-indigo-300 font-medium">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      ({formatFileSize(f.size)})
                    </span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBMITTED WORK REPORT SECTION (Qilingan ishlar hisoboti) */}
        {hasReport && task.report && (
          <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Qilingan ishlar hisoboti ({task.report.submittedBy})</span>
              </span>
              <button
                type="button"
                onClick={() => onOpenReportModal(task)}
                className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Tahrirlash</span>
              </button>
            </div>

            {task.report.notes && (
              <p className="text-xs text-slate-200 whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {task.report.notes}
              </p>
            )}

            {/* Report Images */}
            {task.report.images && task.report.images.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Natija rasmlari:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {task.report.images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => onPreviewImage(img)}
                      className="aspect-video bg-slate-900 rounded border border-slate-700 overflow-hidden cursor-pointer hover:border-emerald-400"
                    >
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Files (Word, Excel) */}
            {task.report.files && task.report.files.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 block">Natija fayllari (Word/Excel):</span>
                {task.report.files.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => downloadTaskFile(f)}
                    className="flex items-center justify-between p-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 rounded-lg text-xs cursor-pointer group"
                    title="Yuklab olish uchun bosing"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {getDocIcon(f.name)}
                      <span className="text-emerald-300 truncate font-medium text-[11px]">{f.name}</span>
                    </div>
                    <Download className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-3">
        {isCompleted ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bajarilgan</span>
            </span>

            <button
              onClick={() => onOpenReportModal(task)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hasReport ? 'Hisobotni ko‘rish/tahrirlash' : 'Hisobot biriktirish'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenReportModal(task)}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Hisobot yuklash & Bajardim (Telegramga xabar boradi)</span>
          </button>
        )}
      </div>
    </div>
  );
};
