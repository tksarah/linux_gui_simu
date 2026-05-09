import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
 
export default defineConfig({
  base: "/linux_gui_simu/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
