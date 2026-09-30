export const config = {
  api: {
    bodyParser: false,
  },
};

import { createApiMiddleware } from '../server/api.js';

const apiMiddleware = createApiMiddleware();

export default async function handler(req, res) {
  // Dukung request jika runtime serverless Vercel telah mengurai body terlebih dahulu
  if (req.body !== undefined && req.body !== null && typeof req.on === 'function') {
    const originalOn = req.on.bind(req);
    const bodyStr = typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body);
    req.on = function (event, listener) {
      if (event === 'data') {
        process.nextTick(() => listener(Buffer.from(bodyStr)));
        return this;
      }
      if (event === 'end') {
        process.nextTick(() => listener());
        return this;
      }
      return originalOn(event, listener);
    };
  }

  return new Promise((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    apiMiddleware(req, res, () => {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint API tidak ditemukan.' }));
      resolve();
    });
  });
}
