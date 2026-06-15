import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
        mainVi: resolve(__dirname, 'index-vi.html'),
        contactVi: resolve(__dirname, 'contact-vi.html'),
      },
    },
  },
});
