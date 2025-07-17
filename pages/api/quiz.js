export default async function handler(req, res) {
  const backendUrl = 'https://notarium-backend-production.up.railway.app/quiz';
  const response = await fetch(backendUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...req.headers,
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  const data = await response.json();
  res.status(response.status).json(data);
} 