import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function liveSyncPlugin(): Plugin {
  const cacheFile = path.resolve(import.meta.dirname, './.live_store.json');
  let store: Record<string, { event: any; committee?: any; updatedAt: string }> = {};

  try {
    if (fs.existsSync(cacheFile)) {
      store = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
  } catch {}

  const saveStore = () => {
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(store, null, 2), 'utf-8');
    } catch {}
  };

  return {
    name: 'campuslink-live-sync',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/live-sync')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const slug = (data.slug || data.event?.slug || data.event?.id || 'default').toLowerCase();
              const entry = {
                event: data.event,
                committee: data.committee,
                updatedAt: new Date().toISOString()
              };
              store[slug] = entry;
              store['latest'] = entry;

              if (data.event?.title) {
                const titleSlug = data.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                if (titleSlug) store[titleSlug] = entry;
              }
              if (data.event?.id) {
                store[data.event.id] = entry;
              }

              saveStore();

              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ success: true, slug }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          const slug = (url.searchParams.get('slug') || '').toLowerCase();
          let match = store[slug];
          if (!match && slug) {
            const keys = Object.keys(store);
            const foundKey = keys.find(k => k !== 'latest' && (k.includes(slug) || slug.includes(k) || (slug.includes('khelaiya') && k.includes('khelaiya'))));
            if (foundKey) match = store[foundKey];
          }
          if (!match) {
            match = store['latest'];
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          if (match) {
            res.end(JSON.stringify(match));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
          }
          return;
        }

        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), liveSyncPlugin()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/canvas-confetti') || id.includes('node_modules/qrcode')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
