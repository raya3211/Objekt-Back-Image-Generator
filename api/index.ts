import { handleRequest } from '../src/server';

export default async function handler(req: any, res?: any) {
  try {
    // 1. Traditional Node.js Serverless Function mode (req, res)
    if (res && typeof res.setHeader === 'function') {
      const host = req.headers?.host || 'localhost';
      const proto = req.headers?.['x-forwarded-proto'] || 'https';

      const rawPath = req.headers?.['x-matched-path'] || req.url || '/';
      const url = new URL(rawPath, `${proto}://${host}`);

      const headers = new Headers();
      if (req.headers) {
        for (const [k, v] of Object.entries(req.headers)) {
          if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
        }
      }

      const webReq = new Request(url.toString(), {
        method: req.method || 'GET',
        headers,
      });

      const webRes = await handleRequest(webReq);

      res.statusCode = webRes.status;
      webRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });

      const arrayBuffer = await webRes.arrayBuffer();
      return res.end(Buffer.from(arrayBuffer));
    }

    // 2. Web Standard mode (Request -> Response)
    return await handleRequest(req);
  } catch (err: any) {
    console.error('Unhandled Serverless Error:', err);
    if (res && typeof res.setHeader === 'function') {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: err?.message || 'Server error', stack: err?.stack }));
    }
    return new Response(JSON.stringify({ error: err?.message || 'Server error', stack: err?.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
