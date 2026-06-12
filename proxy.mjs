import http from 'http';
import https from 'https';

const PORT = 3002;

const server = http.createServer((req, res) => {
  const targetUrl = req.url?.slice(1);
  console.log(`[PROXY] ${req.method} ${targetUrl?.substring(0, 80)}...`);

  if (!targetUrl || !targetUrl.startsWith('http')) {
    res.writeHead(400, { 'Access-Control-Allow-Origin': '*' });
    res.end('Provide full URL');
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const client = targetUrl.startsWith('https') ? https : http;

  const doRequest = (url, redirectCount = 0) => {
    if (redirectCount > 5) {
      if (!res.headersSent) { res.writeHead(508); res.end('Too many redirects'); }
      return;
    }

    const u = new globalThis.URL(url);
    const clientMod = u.protocol === 'https:' ? https : http;

    console.log(`[PROXY] Fetching: ${url.substring(0, 100)}...`);

    const proxyReq = clientMod.get(url, {
      headers: {
        'User-Agent': 'VLC/3.0.21 LibVLC/3.0.21',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      timeout: 30000,
    }, (proxyRes) => {
      console.log(`[PROXY] Response: ${proxyRes.statusCode} Content-Type: ${proxyRes.headers['content-type']}`);

      if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        console.log(`[PROXY] Redirect to: ${proxyRes.headers.location}`);
        doRequest(proxyRes.headers.location, redirectCount + 1);
        return;
      }

      const headers = { ...proxyRes.headers };
      headers['access-control-allow-origin'] = '*';
      headers['cache-control'] = 'no-cache';
      if (/\.(ts)($|\?)/i.test(url)) headers['content-type'] = 'video/mp2t';

      res.writeHead(proxyRes.statusCode || 500, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[PROXY] Error: ${err.message}`);
      if (!res.headersSent) { res.writeHead(502); res.end('Proxy error: ' + err.message); }
    });

    proxyReq.on('timeout', () => {
      console.error('[PROXY] Timeout');
      proxyReq.destroy();
      if (!res.headersSent) { res.writeHead(504); res.end('Timeout'); }
    });
  };

  doRequest(targetUrl);
});

server.listen(PORT, () => {
  console.log(`\n  CORS Proxy: http://localhost:${PORT}\n`);
});
