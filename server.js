import express from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const traefikTarget = process.env.TRAEFIK_API_URL || 'http://traefik:8080';

const app = express();

app.use(helmet());

app.use(
  createProxyMiddleware({
    // No Express path prefix here: app.use('/api', ...) strips '/api' from
    // req.url before the proxy sees it, so the forwarded request would lose
    // the prefix (Traefik requires /api/... to route to its internal API).
    // pathFilter selects which requests to proxy without touching the URL.
    pathFilter: '/api',
    target: traefikTarget,
    changeOrigin: true,
    logger: console,
    on: {
      error: (err, req) => {
        console.error(`[proxy] ${req.originalUrl} error: ${err.message}`);
      },
    },
  }),
);

// Fetches favicon.ico server-side so the browser never talks to the target
// domain directly — some proxied services sit behind HTTP Basic Auth, and a
// client-side <img> request to those triggers the browser's native login
// prompt (a WWW-Authenticate challenge does this regardless of img vs fetch).
// Restricted to https + a fixed path + a hostname shape, since this endpoint
// is otherwise unauthenticated and takes an arbitrary domain from the client.
const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$/;
const MAX_FAVICON_BYTES = 512 * 1024;

app.get('/favicon-proxy', async (req, res) => {
  const domain = req.query.domain;
  if (typeof domain !== 'string' || !HOSTNAME_RE.test(domain)) {
    return res.status(400).end();
  }

  try {
    const upstream = await fetch(`https://${domain}/favicon.ico`, {
      signal: AbortSignal.timeout(3000),
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.startsWith('image/')) {
      return res.status(404).end();
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.byteLength > MAX_FAVICON_BYTES) {
      return res.status(404).end();
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch {
    res.status(404).end();
  }
});

app.use(express.static(distDir));

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Dashboard listening on port ${port}, proxying /api to ${traefikTarget}`);
});
