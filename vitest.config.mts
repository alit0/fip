import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// .mts (ESM) so it can import the ESM-only `vite-tsconfig-paths`
// without the project being `"type": "module"` (which would affect Next config).
export default defineConfig({
  // react() → transforma JSX/TSX; tsconfigPaths() → resuelve el alias "@/..."
  plugins: [react(), tsconfigPaths()],
  test: {
    // jsdom simula un navegador (document, window) para poder "renderizar"
    environment: "jsdom",
    // permite usar describe/it/expect sin importarlos en cada archivo
    globals: true,
    // carga los matchers de jest-dom (toBeInTheDocument, etc.) antes de los tests
    setupFiles: ["./src/test/setup.ts"],
  },
});
