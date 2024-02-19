import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
//npm create vite@latest admin-app -- --template react

export default defineConfig({
  plugins: [react()],
})

