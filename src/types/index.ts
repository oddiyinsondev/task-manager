export type UserRole = 'admin' | 'developer';

export interface TaskImage {
  id: string;
  name: string;
  dataUrl: string; // Base64 rasm
  size?: number;
}

export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 fayl
}

export interface TaskReport {
  notes: string;
  images: TaskImage[];
  files: TaskFile[];
  submittedAt: string;
  submittedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  images: TaskImage[];
  files?: TaskFile[]; // Word, Excel, PDF va h.k.
  status: 'pending' | 'completed';
  completedAt?: string;
  createdAt: string;
  report?: TaskReport; // Qilingan ishlar hisoboti
}

export interface TelegramConfig {
  botToken: string;
  glassProChatId: string;
  developerChatId: string;
}

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '8732716123:AAFqsMqPCkTA72zB0ReMTJJpvV7d9aKUIdE',
  glassProChatId: '7072212883',
  developerChatId: '451592269',
};
