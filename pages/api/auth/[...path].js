// Next.js API route to proxy auth requests to backend
export default async function handler(req, res) {
  // path her zaman dizi olmalı, yoksa boş diziye çevir
  const { path } = req.query;
  const safePath = Array.isArray(path) ? path : path ? [path] : [];
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://notarium-backend-production.up.railway.app';
  const targetUrl = `${backendUrl}/auth${safePath.length > 0 ? '/' + safePath.join('/') : ''}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(backendUrl).host,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {}

    // Birden fazla set-cookie varsa dizi olarak forward et
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : setCookie.split(/,(?=\s*\w+=)/);
      res.setHeader('Set-Cookie', cookies);
    }

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 