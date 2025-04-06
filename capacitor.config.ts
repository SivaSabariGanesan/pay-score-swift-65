
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.TransPay.app',
  appName: 'TransPay',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost'
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    // Disabling the HTTP plugin to work around compatibility issues
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
