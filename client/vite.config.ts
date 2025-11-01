import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import fs from "fs";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  const isLocalHttps = process.env.VITE_LOCAL_HTTPS === "true";

  const getHttpsConfig = () => {
    if (!isDev || !isLocalHttps) return {};

    const keyPath = path.resolve("./dev-key.pem");
    const certPath = path.resolve("./dev.pem");

    try {
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        console.log("✅ Using HTTPS with local certificates");
        return {
          https: {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          },
        };
      } else {
        console.warn("⚠️  HTTPS certificates not found. Using HTTP.");
        console.warn("💡 Run: npm run cert:generate to create certificates");
      }
    } catch (error) {
      console.warn("⚠️  Error reading HTTPS certificates. Using HTTP.");
    }

    return {};
  };

  return {
    plugins: [react(), wasm(), topLevelAwait()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      ...getHttpsConfig(),
      ...(isDev && {
        host: true,
        cors: true,
      }),
    },
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      include: ["buffer"],
    },
  };
});