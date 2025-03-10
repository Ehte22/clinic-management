import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: "module"
      },
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      registerType: "autoUpdate",
      injectManifest: {
        swSrc: "src/sw.ts",
        swDest: "dist/sw.js"
      },
      manifest: {
        name: "Clinic Management",
        short_name: "CMS",
        icons: [
          {
            src: "/icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff"
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,png,svg,ico,json}"]
      }
    })
  ],
})
