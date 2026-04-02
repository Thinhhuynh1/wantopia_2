import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "front-end");

export default defineConfig({
  base: "./",
  root: frontendRoot,
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(frontendRoot, "index.html"),
        events: resolve(frontendRoot, "su-kien.html"),
        store: resolve(frontendRoot, "cua-hang.html"),
        stories: resolve(frontendRoot, "tam-tu.html"),
        contact: resolve(frontendRoot, "lien-he.html"),
        login: resolve(frontendRoot, "login.html"),
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
