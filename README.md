# 🚀 Task Manager (Telegram Bot & Sanama-San Reja)

Backend talab qilmaydigan, to‘g‘ridan-to‘g‘ri **Vercel**ga joylashtirish uchun tayyorlangan sodda va oson Task Manager.

---

## 🔑 Kirish ma’lumotlari

Ilovaga kirish **ikki xil** rejimda ishlaydi:

### 1. 👑 Admin (Task beruvchi):
- **Login:** `admin`
- **Parol:** `shohruhbekk`
- **Imkoniyatlari:**
  - Yangi tasklar qo‘shish (Sarlavha, tavsif, sana, vaqt).
  - **Bir nechta rasmlar** yuklash (ustiga bosib to‘liq ekranda ko‘rish mumkin).
  - Tasklarni o‘chirish va nazorat qilish.
  - Dasturchi bajarganda avtomatik Telegram botga hisobot keladi.

### 2. 💻 Dasturchi (Ijrochi):
- **Login:** `dasturchi`
- **Parol:** `dasturchi2026`
- **Imkoniyatlari:**
  - Admin bergan tasklarni sanama-san (Bugun, Ertaga, Kelgusi kunlar) ko‘rish.
  - Rasmlarni ko‘rish va yuklab olish.
  - Har bir task ostidagi **"✅ Bajardim"** tugmasini bosish.
  - Bosishi bilan adminga **Telegram bot orqali darhol xabar boradi**!

---

## 🤖 Telegram Bot Integratsiyasi

Siz taqdim etgan bot ma’lumotlari dasturga to‘liq biriktirilgan va sinovdan o‘tgan:
- **Bot:** `@dasturchilar_p26_bot`
- **Chat ID:** `7072212883`

Dasturchi "Bajardim" tugmasini bosganida botga quyidagi formatda xabar keladi:
```
✅ TASK BAJARILDI!
━━━━━━━━━━━━━━━━━━━━
📌 Vazifa: Saytdagi tugmani to‘g‘rilash
📅 Reja sanasi: 2026-11-20 18:00
⏰ Bajarilgan vaqt: 20.11.2026, 15:40
🖼 Biriktirilgan rasmlar: 2 ta
━━━━━━━━━━━━━━━━━━━━
Dasturchi vazifani yakunladi deb belgiladi!
```

---

## ⚡ Vercelga yuklash (Deploy qilish)

1. Loyiha papkasini GitHub profilingizga push qiling.
2. [vercel.com](https://vercel.com) ga kiring va **"Add New Project"** tugmasi orqali reponi tanlang.
3. **Deploy** tugmasini bosing! Vercel bir necha soniyada bepul link beradi.
