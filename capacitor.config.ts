import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hemline.studio",
  appName: "Hemline Studio",
  webDir: "dist",
  server: {
    url: "http://192.168.1.123:5173",
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: "body",
      style: "dark",
      scrollToInput: true,
    },
  },
};

export default config;
