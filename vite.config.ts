import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "192.168.6.56",
    port: 6800,
  },
  plugins: [react()],
})
