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
    console.log('Request cookies:', req.headers.cookie);
    
    // Prepare headers for backend request
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies if they exist
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }
    
    // Forward other relevant headers
    if (req.headers['user-agent']) {
      headers['User-Agent'] = req.headers['user-agent'];
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      credentials: 'include', // <-- Bu eksikti! Cookieleri backende gönder
    });
    
    // Handle non-JSON responses gracefully
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {     try {
        data = await response.json();
      } catch (error) {
        console.error('JSON parse error:', error);
        res.status(500).json({ error: 'Invalid JSON response from backend' });
        return;
      }
    } else {     // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      console.error('Non-JSON response from backend:', text);
      res.status(response.status).json({ 
        error: 'Backend returned non-JSON response', 
        status: response.status,
        details: text.substring(0, 200) // First 200rs
      });
      return;
    }
    
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', data);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    // Forward the response status
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