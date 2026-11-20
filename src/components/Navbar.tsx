import React from 'react';
import { Calendar, ShieldCheck, Code2, LogOut, Plus } from 'lucide-react';
import type { UserRole } from '../types';

interface Props {
  role: UserRole;
  onLogout: () => void;
  onOpenCreateTask: () => void;
}

export const Navbar: React.FC<Props> = ({ role, onLogout, onOpenCreateTask }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight">
              Task Manager
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Glass Pro
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Role badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              role === 'admin'
                ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30'
                : 'bg-emerald-600/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {role === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Glass Pro</span>
              </>
            ) : (
              <>
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Dasturchi</span>
              </>
            )}
          </div>

          {/* Glass Pro creates new task */}
          {role === 'admin' && (
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi task qo‘shish</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700/60 rounded-xl transition-colors"
            title="Chiqish / Profilni o‘zgartirish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
