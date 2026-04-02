import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        events: resolve(__dirname, "su-kien.html"),
        store: resolve(__dirname, "cua-hang.html"),
        stories: resolve(__dirname, "tam-tu.html"),
        contact: resolve(__dirname, "lien-he.html"),
        login: resolve(__dirname, "login.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
