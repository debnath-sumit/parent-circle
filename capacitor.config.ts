import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parentcircle.app',
  appName: 'ParentCircle',
  webDir: 'public',
  server: {
    url: 'https://parent-circle.vercel.app',
    androidScheme: 'https'
  }
};

export default config;
