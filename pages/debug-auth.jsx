import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dynamic from 'next/dynamic';

// Prevent SSR for this debug page
const DebugAuth = dynamic(() => Promise.resolve(DebugAuthComponent), {
  ssr: false,
  loading: () => <div>Loading debug panel...</div>
});

function DebugAuthComponent() {
  const { user, login, logout, API_URL } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    console.log('DebugAuth - API_URL:', API_URL);
  }, [API_URL]);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Backend health check
      console.log('Test 1: Backend health check');
      const healthRes = await fetch(`${API_URL}/auth/test`, {
        credentials: 'include'
      });
      results.healthCheck = {
        success: healthRes.ok,
        status: healthRes.status,
        statusText: healthRes.statusText
      };

      // Test 2: Auth test endpoint
      console.log('Test 2: Auth test endpoint');
      const authTestRes = await fetch(`${API_URL}/auth/test`, {
        credentials: 'include'
      });
      const authTestData = await authTestRes.json();
      results.authTest = {
        success: authTestRes.ok,
        data: authTestData
      };

      // Test 3: Auth/me endpoint
      console.log('Test 3: Auth/me endpoint');
      const meRes = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      const meData = await meRes.json();
      results.authMe = {
        success: meRes.ok,
        status: meRes.status,
        data: meData
      };

      // Test 4: Cookies - Cloudflare test (only on client)
      if (typeof window !== 'undefined') {
        console.log('Test 4: Cookies');
        const cookies = document.cookie;
        results.cookies = {
          cookies: cookies,
          hasSessionCookie: cookies.includes('connect.sid'),
          cookieDetails: cookies.split(';').map(c => c.trim())
        };
      }

      // Test 5: Session storage (only on client)
      if (typeof window !== 'undefined') {
        console.log('Test 5: Session storage');
        const sessionId = sessionStorage.getItem('sessionId');
        results.sessionStorage = {
          sessionId: sessionId,
          hasSessionId: !!sessionId
        };
      }

      // Test 6: Cloudflare specific tests (only on client)
      if (typeof window !== 'undefined') {
        console.log('Test 6: Cloudflare tests');
        results.cloudflare = {
          currentDomain: window.location.hostname,
          isHTTPS: window.location.protocol === 'https:',
          userAgent: navigator.userAgent,
          cookieEnabled: navigator.cookieEnabled
        };
      }

    } catch (error) {
      console.error('Test error:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const testLogin = async () => {
    const result = await login('test@example.com', 'password123');
    console.log('Login result:', result);
  };

  const testLoginAdmin = async () => {
    const result = await login('admin@example.com', 'admin123');
    console.log('Admin login result:', result);
  };

  const testLoginFounder = async () => {
    const result = await login('founder@example.com', 'founder123');
    console.log('Founder login result:', result);
  };

  // Don't render anything during SSR
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Panel - Cloudflare Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>
        
        <button 
          onClick={testLogin}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Login (User)
        </button>
        
        <button 
          onClick={testLoginAdmin}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Login (Admin)
        </button>
        
        <button 
          onClick={testLoginFounder}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Login (Founder)
        </button>
        
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      {isClient && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Browser Info</h2>
            <div className="bg-gray-100 p-2 rounded">
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Cookies Enabled:</strong> {navigator.cookieEnabled}</p>
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Origin:</strong> {window.location.origin}</p>
              <p><strong>Protocol:</strong> {window.location.protocol}</p>
              <p><strong>Hostname:</strong> {window.location.hostname}</p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Cloudflare Checklist</h2>
            <div className="bg-gray-100 p-2 rounded">
              <p>✅ <strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
              <p>✅ <strong>Domain:</strong> {window.location.hostname.includes('notarium.tr') ? 'Correct' : 'Wrong'}</p>
              <p>✅ <strong>Cookies:</strong> {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</p>
              <p>✅ <strong>Session Cookie:</strong> {document.cookie.includes('connect.sid') ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DebugAuth; 