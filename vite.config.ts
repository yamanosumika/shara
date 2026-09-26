import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

function offlineServiceWorker() {
  return {
    name: 'shara-offline-service-worker',
    apply: 'build' as const,
    closeBundle() {
      const output = join(process.cwd(), 'dist');
      const files: string[] = [];
      const visit = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const path = join(directory, entry.name);
          if (entry.isDirectory()) visit(path);
          else if (entry.name !== 'sw.js') files.push(`./${relative(output, path).replaceAll('\\', '/')}`);
        }
      };
      visit(output);
      files.sort();
      const hash = createHash('sha256');
      for (const file of files) hash.update(readFileSync(join(output, file.slice(2))));
      const cacheName = `shara-${hash.digest('hex').slice(0, 16)}`;
      const assets = ['./', ...files];
      const source = `const CACHE=${JSON.stringify(cacheName)};const ASSETS=${JSON.stringify(assets)};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));\nself.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('shara-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>request.mode==='navigate'?caches.match(new URL('./index.html',self.location.href).href):undefined)));});\nself.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});\n`;
      writeFileSync(join(output, 'sw.js'), source);
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  clearScreen: false,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { reporter: ['text', 'html'] },
  },
});
