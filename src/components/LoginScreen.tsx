import React, { useState } from 'react';
import { ShieldCheck, Code2, Lock, User, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import type { UserRole } from '../types';

interface Props {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (selectedRole === 'admin') {
      // Glass Pro uchun login admin yoki glasspro
      if ((cleanUser === 'admin' || cleanUser === 'glasspro') && cleanPass === 'shohruhbekk') {
        onLogin('admin');
      } else {
        setError('Login yoki parol noto‘g‘ri!');
      }
    } else {
      if (cleanUser === 'dasturchi' && cleanPass === 'dasturchi2026') {
        onLogin('developer');
      } else {
        setError('Login yoki parol noto‘g‘ri!');
      }
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 text-slate-100">
        {/* App Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Task Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Vazifalarni sanama-san boshqarish va Telegram bot hisoboti
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Glass Pro (Task beruvchi)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('developer')}
            className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'developer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-5 h-5" />
            <span>Dasturchi (Ijrochi)</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Info Box */}
        <div
          className={`text-xs p-3 rounded-xl border mb-4 ${
            selectedRole === 'admin'
              ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-300'
              : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300'
          }`}
        >
          {selectedRole === 'admin' ? (
            <>👑 <strong>Glass Pro</strong> sifatida yangi tasklar kiritishingiz, rasm va fayllar (Word, Excel) biriktirishingiz mumkin.</>
          ) : (
            <>💻 <strong>Dasturchi</strong> sifatida Glass Pro bergan tasklarni ko‘rishingiz va "Bajardim" tugmasini bosishingiz mumkin.</>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <User
                className={`w-3.5 h-3.5 ${
                  selectedRole === 'admin' ? 'text-indigo-400' : 'text-emerald-400'
                }`}
              />
              Login
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Loginni kiriting..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock
                className={`w-3.5 h-3.5 ${
                  selectedRole === 'admin' ? 'text-indigo-400' : 'text-emerald-400'
                }`}
              />
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
              selectedRole === 'admin'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <span>{selectedRole === 'admin' ? 'Glass Pro sifatida kirish' : 'Dasturchi sifatida kirish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
