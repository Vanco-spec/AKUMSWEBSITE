import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for assets when deploying, adjust this if you're using a sub-directory like '/your-repository-name/'
  base: './',

  // Build configurations for production
  build: {
    outDir: 'dist', // Directory to output production build
    assetsDir: 'assets', // Directory for static assets
    rollupOptions: {
      input: {
        main: './index.html',  // Main entry point for your website
      },
    },
  },

  // Local server configuration for development
  server: {
    host: true,   // Allow the app to be accessed from other devices in the network
    port: 8080,   // Local development port
    strictPort: true,  // Ensure the port is not taken by other services
  },

  // Preview configuration for production build
  preview: {
    port: 5000,  // Port for the preview server
  },
});
