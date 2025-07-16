// Next.js API route to proxy auth requests to backend
export default async function handler(req, res) {
  const { path } = req.query;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://notarium-backend-production.up.railway.app';
  
  // Construct the backend URL
  const targetUrl = `${backendUrl}/auth/${path.join('/')}`;
  
  try {
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', data);
    
    // Forward the response status and headers
    res.status(response.status);
    
    // Forward cookies from backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Setting cookie header:', setCookieHeader);
      res.setHeader('Set-Cookie', setCookieHeader);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 