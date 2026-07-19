import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to GitHub Pages under a repo subpath (https://<user>.github.io/<repo>/),
// so the build needs a non-root base. Override VITE_BASE_PATH in CI if the repo name differs.
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? (process.env.VITE_BASE_PATH ?? '/cart360/') : '/',
}))
