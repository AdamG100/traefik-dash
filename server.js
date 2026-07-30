import express from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const traefikTarget = process.env.TRAEFIK_API_URL || 'http://traefik:8080';

const app = express();

// Cards link out to favicons on arbitrary external domains, so img-src
// needs to allow https: beyond helmet's default 'self'-only policy.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'https:'],
      },
    },
  }),
);

app.use(
  '/api',
  createProxyMiddleware({
    target: traefikTarget,
    changeOrigin: true,
    logger: console,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${traefikTarget}${proxyReq.path}`);
      },
      proxyRes: (proxyRes, req) => {
        console.log(`[proxy] ${req.originalUrl} <- ${proxyRes.statusCode}`);
      },
      error: (err, req) => {
        console.error(`[proxy] ${req.originalUrl} error: ${err.message}`);
      },
    },
  }),
);

app.use(express.static(distDir));

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Dashboard listening on port ${port}, proxying /api to ${traefikTarget}`);
});
