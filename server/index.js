// BOMBE sunucusu: statik dosyaları sunar ve Socket.IO ile odaları yönetir.

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { RoomManager } from './rooms.js';
import { Leaderboard } from './leaderboard.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createServer({ port = 3000, dataFile, gameOptions } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_req, res) => res.json({ ok: true }));
  // no-cache: tarayıcı dosyayı saklar ama her açılışta ETag ile sorar. Böylece sunucu
  // güncellenince eski JS dosyaları kullanılmaz (değişmeyen dosyalar için sadece 304 döner).
  const statics = { etag: true, lastModified: true, setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') };
  app.use('/shared', express.static(path.join(ROOT, 'shared'), statics));
  app.use(express.static(path.join(ROOT, 'public'), statics));

  const server = http.createServer(app);
  const io = new Server(server, { maxHttpBufferSize: 64 * 1024 });
  const leaderboard = new Leaderboard(dataFile === undefined ? path.join(ROOT, 'data', 'records.json') : dataFile);
  const rooms = new RoomManager(io, leaderboard, gameOptions);

  return new Promise((resolve) => {
    server.listen(port, () => {
      const close = () =>
        new Promise((r) => {
          rooms.close();
          io.close();
          server.close(() => r());
        });
      resolve({ server, io, rooms, port: server.address().port, close });
    });
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT) || 3000;
  const dataFile = process.env.DATA_FILE || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'records.json') : undefined);
  createServer({ port, dataFile }).then(({ port: p }) => {
    console.log(`BOMBE çalışıyor: http://localhost:${p}`);
  });
}
