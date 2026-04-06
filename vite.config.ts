import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "BOLAB - Lab Room Management",
        short_name: "BOLAB",
        description: "Lab room booking and attendance management system with face recognition",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["education", "productivity"],
        screenshots: [
          {
            src: "/screenshot1.png",
            sizes: "540x720",
            type: "image/png",
          },
          {
            src: "/screenshot2.png",
            sizes: "540x720",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Camera Attendance",
            short_name: "Attendance",
            description: "Quick access to face recognition attendance",
            url: "/attendance/camera",
            icons: [{ src: "/icon-camera.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf,eot}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(js|css)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 100,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    https: {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost.pem"),
    },
    port: 5173,
    middlewareMode: false,
  },
});
