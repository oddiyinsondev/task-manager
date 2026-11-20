import type { Task, TaskReport } from '../types';
import { DEFAULT_TELEGRAM_CONFIG } from '../types';

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramMessage(chatId: string, htmlText: string): Promise<{ success: boolean; error?: string }> {
  const token = DEFAULT_TELEGRAM_CONFIG.botToken;
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
 * Task bajarilib, hisobot topshirilganda Glass Pro ga (7072212883) yuboriladigan xabar
 */
export async function notifyTaskCompleted(task: Task, report?: TaskReport): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const repImagesCount = report?.images?.length || 0;
  const repFilesCount = report?.files?.length || 0;

  const html = `
<b>✅ TASK BAJARILDI VA HISOBOT TOPSHIRILDI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Vazifa:</b> ${escapeHtml(task.title)}
📅 <b>Reja sanasi:</b> ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}
⏰ <b>Bajarilgan vaqt:</b> ${now}
👤 <b>Topshirdi:</b> ${escapeHtml(report?.submittedBy || 'Dasturchi')}
${report?.notes ? `\n📝 <b>Qilingan ishlar hisoboti:</b>\n<i>${escapeHtml(report.notes)}</i>\n` : ''}
${repImagesCount > 0 ? `🖼 <b>Natija rasmlari:</b> ${repImagesCount} ta\n` : ''}
${repFilesCount > 0 ? `📎 <b>Hisobot fayllari (Word/Excel):</b> ${repFilesCount} ta\n` : ''}
━━━━━━━━━━━━━━━━━━━━
<i>Tizimga kirib fayllarni yuklab olishingiz mumkin!</i>
`.trim();

  // Glass Pro ga boradi
  return await sendTelegramMessage(DEFAULT_TELEGRAM_CONFIG.glassProChatId, html);
}

/**
 * Glass Pro yangi task berganida Dasturchiga (451592269) yuboriladigan xabar
 */
export async function notifyTaskCreated(task: Task): Promise<{ success: boolean; error?: string }> {
  const html = `
<b>📋 YANGI TASK BERILDI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Vazifa:</b> ${escapeHtml(task.title)}
📅 <b>Muddati:</b> ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}
${task.description ? `📝 <b>Tavsif:</b>\n<i>${escapeHtml(task.description)}</i>\n` : ''}
${task.images && task.images.length > 0 ? `🖼 <b>Rasmlar soni:</b> ${task.images.length} ta\n` : ''}
${task.files && task.files.length > 0 ? `📎 <b>Hujjatlar (Word/Excel):</b> ${task.files.length} ta\n` : ''}
━━━━━━━━━━━━━━━━━━━━
<i>Glass Pro yangi vazifa kiritdi. Iltimos, tizimga kirib ko‘ring!</i>
`.trim();

  // Dasturchiga (451592269) yuboriladi
  const resDev = await sendTelegramMessage(DEFAULT_TELEGRAM_CONFIG.developerChatId, html);

  // Nusxasi Glass Pro ga ham boradi
  sendTelegramMessage(DEFAULT_TELEGRAM_CONFIG.glassProChatId, html).catch(() => {});

  return resDev;
}
