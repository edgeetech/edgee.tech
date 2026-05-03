import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative asset paths so the build works on the custom domain root.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('jquery') || id.includes('bootstrap') || id.includes('owl.carousel')) {
            return 'vendors';
          }
          if (id.includes('lib/')) {
            return 'libraries';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  }
});
