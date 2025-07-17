// DİKKAT: Bu dosya, /api/notes isteklerini backend'e proxy eder.
export default async function handler(req, res) {
  const backendUrl = 'https://notarium-backend-production.up.railway.app/notes';
  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
} 