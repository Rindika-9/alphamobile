import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.alphamobile.app",
  appName: "Alpha Mobile",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#060E1D",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
    },
    StatusBar: {
      backgroundColor: "#0B1D3A",
      style: "DARK",
      overlaysWebView: false,
    },
    SystemBars: {
      // Webview is padded so nothing sits under the status bar or nav bar.
      insetsHandling: "native",
      style: "DARK",
    },
  },
};

export default config;
