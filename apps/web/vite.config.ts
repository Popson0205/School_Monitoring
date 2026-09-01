import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    // Railway (and most PaaS) serve on a dynamic subdomain that changes per
    // deploy/environment, so we can't hardcode it. This is safe here since
    // the app behind it requires auth (JWT login) - there's no sensitive
    // data exposed just by the host being reachable.
    allowedHosts: true,
  },
});
