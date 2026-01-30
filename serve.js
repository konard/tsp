/**
 * Simple HTTP server for the TSP application
 */

/* global URL, Response */

import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

Bun.serve({
  port: PORT,
  fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

    const filePath = join(ROOT, pathname);

    if (!existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new Response(content, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${PORT}`);
