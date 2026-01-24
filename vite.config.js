import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/CantaTune/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CantaTune",
        short_name: "CantaTune",
        scope: "/CantaTune/",
        start_url: "/CantaTune/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0b0b0f",
        theme_color: "#0b0b0f",
        icons: [
          { src: "/CantaTune/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/CantaTune/pwa-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
