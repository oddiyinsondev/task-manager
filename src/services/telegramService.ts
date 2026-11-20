import type { Task } from '../types';
import { DEFAULT_TELEGRAM_CONFIG } from '../types';

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramMessage(htmlText: string): Promise<{ success: boolean; error?: string }> {
  const token = DEFAULT_TELEGRAM_CONFIG.botToken;
  const chatId = DEFAULT_TELEGRAM_CONFIG.chatId;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Dasturchi taskni bajarganida yuboriladigan xabar
 */
export async function notifyTaskCompleted(task: Task): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<b>✅ TASK BAJARILDI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Vazifa:</b> ${escapeHtml(task.title)}
📅 <b>Reja sanasi:</b> ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}
⏰ <b>Bajarilgan vaqt:</b> ${now}
${task.images && task.images.length > 0 ? `🖼 <b>Biriktirilgan rasmlar:</b> ${task.images.length} ta\n` : ''}
━━━━━━━━━━━━━━━━━━━━
<i>Dasturchi vazifani yakunladi deb belgiladi!</i>
`.trim();

  return await sendTelegramMessage(html);
}

/**
 * Admin yangi task berganida yuboriladigan xabar
 */
export async function notifyTaskCreated(task: Task): Promise<{ success: boolean; error?: string }> {
  const html = `
<b>📋 YANGI TASK BERILDI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Vazifa:</b> ${escapeHtml(task.title)}
📅 <b>Muddati:</b> ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}
${task.description ? `📝 <b>Tavsif:</b>\n<i>${escapeHtml(task.description)}</i>\n` : ''}
${task.images && task.images.length > 0 ? `🖼 <b>Rasmlar soni:</b> ${task.images.length} ta\n` : ''}
━━━━━━━━━━━━━━━━━━━━
<i>Admin yangi vazifa kiritdi. Iltimos, tizimga kirib ko‘ring!</i>
`.trim();

  return await sendTelegramMessage(html);
}
