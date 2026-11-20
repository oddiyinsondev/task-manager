import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const TASKS_FILE = path.resolve(__dirname, 'tasks.json')

function tasksJsonPlugin() {
  return {
    name: 'tasks-json-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/tasks') {
          if (req.method === 'GET') {
            try {
              if (!fs.existsSync(TASKS_FILE)) {
                fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf-8')
              }
              const data = fs.readFileSync(TASKS_FILE, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data || '[]')
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk
            })
            req.on('end', () => {
              try {
                fs.writeFileSync(TASKS_FILE, body, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (err: any) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: err.message }))
              }
            })
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tasksJsonPlugin(),
  ],
})
