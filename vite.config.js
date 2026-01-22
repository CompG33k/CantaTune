import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/cantatune/",   // <-- must match your repo name
  plugins: [react()],
});