// DİKKAT: Bu dosyada backendUrl sabittir, environment variable ile değiştirilmemelidir. Detay için RAILWAY_ENV_SETUP.md'ye bakınız.
// Next.js API route to proxy all requests to backend
export default async function handler(req, res) {
  const { path } = req.query;
  const backendUrl = 'https://notarium-backend-production.up.railway.app';
  
  // Construct the backend URL
  const targetUrl = `${backendUrl}/${path.join('/')}`;
  
  try {
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    // Prepare headers and manually forward cookie
    const headers = {
      'Content-Type': 'application/json',
      ...req.headers,
    };
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      // credentials: 'include', // Not needed in server-side fetch
    });
    
    const data = await response.json();
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', data);
    
    // Forward the response status and headers
    res.status(response.status);
    
    // Forward cookies from backend
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
      console.log('Setting cookie header:', setCookie);
      res.setHeader('Set-Cookie', setCookie);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 