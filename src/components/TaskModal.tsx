import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Loader2,
  ClipboardPaste,
  FileText,
  FileSpreadsheet,
  FileIcon,
} from 'lucide-react';
import type { Task, TaskImage, TaskFile } from '../types';
import { processMultipleImages } from '../services/imageUtils';
import { processMultipleFiles, formatFileSize } from '../services/fileUtils';
import { notifyTaskCreated } from '../services/telegramService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onPreviewImage: (image: TaskImage) => void;
}

export const TaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  onPreviewImage,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState('18:00');
  const [images, setImages] = useState<TaskImage[]>([]);
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handlePasteFiles = useCallback(async (pastedFiles: File[]) => {
    if (pastedFiles.length === 0) return;
    setIsUploadingImages(true);
    try {
      const newImages = await processMultipleImages(pastedFiles);
      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      alert('Rasmni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingImages(false);
    }
  }, []);

  // Ctrl + V (Paste) hodisasi
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const imageFiles: File[] = [];

      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length === 0 && clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              imageFiles.push(file);
            }
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        handlePasteFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, handlePasteFiles]);

  if (!isOpen) return null;

  // Rasm fayllarini yuklash
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const newImages = await processMultipleImages(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      alert('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Hujjat fayllarini (Word, Excel) yuklash
  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingFiles(true);
    try {
      const newDocs = await processMultipleFiles(e.target.files);
      setFiles((prev) => [...prev, ...newDocs]);
    } catch (err) {
      alert('Fayllarni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingFiles(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Iltimos, task nomini kiriting!');
      return;
    }

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || today,
      dueTime: dueTime || undefined,
      images,
      files,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSave(newTask);

    // Telegram botga yangi task haqida xabar yuborish (Glass Pro -> Dasturchi)
    notifyTaskCreated(newTask).catch(() => {});

    // Tozalash va yopish
    setTitle('');
    setDescription('');
    setImages([]);
    setFiles([]);
    onClose();
  };

  // Fayl ikonkasi turi
  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    return <FileIcon className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700/60">
          <div>
            <h2 className="text-base font-bold text-white">Yangi task qo‘shish (Glass Pro)</h2>
            <p className="text-[11px] text-slate-400">Rasm, Word va Excel hujjatlarini biriktirishingiz mumkin</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task sarlavhasi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Omborxona tizimini yangilash..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Batafsil ma’lumot (Izoh)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Dasturchi nima qilishi kerakligini yozing..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Sanasi <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs [color-scheme:dark]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Vaqti
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs [color-scheme:dark]"
              />
            </div>
          </div>

          {/* 1. Image Upload Area (with Ctrl+V support) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                1. Rasmlar yuklash (Bir nechta tanlash mumkin)
              </label>
              <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                <ClipboardPaste className="w-3 h-3" />
                Ctrl + V ishlaydi
              </span>
            </div>

            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-3.5 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all group"
            >
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1 text-xs text-slate-400">
                {isUploadingImages ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-medium text-slate-300">
                  {isUploadingImages ? 'Rasm yuklanmoqda...' : 'Rasmlarni tanlang yoki Ctrl+V bosing'}
                </span>
              </div>
            </div>

            {/* Images Preview List */}
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 group"
                  >
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPreviewImage(img)}
                        className="p-1 bg-indigo-600 text-white rounded"
                        title="Ko‘rish"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1 bg-rose-600 text-white rounded"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Documents / Files Upload Area (Word, Excel, PDF) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                2. Hujjatlar yuklash (Word, Excel, PDF va h.k.)
              </label>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Word / Excel
              </span>
            </div>

            <div
              onClick={() => docInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all group"
            >
              <input
                type="file"
                ref={docInputRef}
                onChange={handleDocChange}
                multiple
                accept=".doc,.docx,.xls,.xlsx,.pdf,.txt,.zip"
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                {isUploadingFiles ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-medium text-slate-300">
                  {isUploadingFiles ? 'Fayllar yuklanmoqda...' : 'Word yoki Excel fayllarini tanlash'}
                </span>
              </div>
            </div>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {getFileIcon(file.name)}
                      <span className="text-white truncate font-medium">{file.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Taskni qo‘shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
