import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  // server: { https: true },
  plugins: [
    // mkcert(),
    vue(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   devOptions: {
    //     enabled: true,
    //   },
    //   includeAssets: ["favicon.ico", "masked-icon.svg"],
    //   manifest: {
    //     name: "Punto de venta hotspot",
    //     short_name: "CO-CO PVH",
    //     description: "Punto de venta de fichas hotspot",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    // }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
