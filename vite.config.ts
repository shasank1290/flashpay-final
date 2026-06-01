import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    historyApiFallback: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  define: {
    // PayU credentials injected directly so they are available via
    // import.meta.env in the browser without relying on a managed .env file.
    // NOTE: VITE_PAYU_SALT will be visible in the client bundle — acceptable
    // for PayU TEST mode only. Move hash generation to an edge function
    // before going live.
    "import.meta.env.VITE_PAYU_KEY": JSON.stringify("n2juMm"),
    "import.meta.env.VITE_PAYU_SALT": JSON.stringify("E6y22rZQYkQbYlZCEEgtli4aqiYYmXXa"),
  },
}));
