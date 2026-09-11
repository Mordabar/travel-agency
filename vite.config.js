import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // three pesa lo suyo: se separa para que cachee aparte del código propio.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          return null;
        }
      }
    }
  }
});
