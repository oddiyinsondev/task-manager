import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.resolve(process.cwd(), 'tasks.json');

// In-memory kesh (Serverless holatlarda)
let inMemoryTasks = [];

if (fs.existsSync(TASKS_FILE)) {
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    inMemoryTasks = JSON.parse(raw);
  } catch (e) {}
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (fs.existsSync(TASKS_FILE)) {
      try {
        const data = fs.readFileSync(TASKS_FILE, 'utf-8');
        return res.status(200).json(JSON.parse(data || '[]'));
      } catch (e) {
        return res.status(200).json(inMemoryTasks);
      }
    }
    return res.status(200).json(inMemoryTasks);
  }

  if (req.method === 'POST') {
    const tasks = req.body;
    inMemoryTasks = Array.isArray(tasks) ? tasks : [];
    try {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(inMemoryTasks, null, 2), 'utf-8');
    } catch (e) {}
    return res.status(200).json({ success: true, count: inMemoryTasks.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
