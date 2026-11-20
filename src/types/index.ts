export type UserRole = 'admin' | 'developer';

export interface TaskImage {
  id: string;
  name: string;
  dataUrl: string; // Base64 rasm
  size?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  images: TaskImage[];
  status: 'pending' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '8732716123:AAFqsMqPCkTA72zB0ReMTJJpvV7d9aKUIdE',
  chatId: '7072212883',
};
