import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function DebugAuth() {
  const { user, sessionId, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    // Debug bilgilerini topla
    const info = {
      user: user,
      sessionId: sessionId,
      isLoading: isLoading,
      localStorage: {
        sessionId: localStorage.getItem('sessionId'),
        otherKeys: Object.keys(localStorage)
      },
      cookies: document.cookie,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, [user, sessionId, isLoading]);

  const testAuth = async () => {
    try {
      setTestResult('Testing...');
      const res = await fetch('https://notarium.tr/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      setTestResult(`Status: ${res.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  const testAuthWithSessionId = async () => {
    try {
      setTestResult('Testing with session ID...');
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setTestResult('No session ID found in localStorage');
        return;
      }
      
      const res = await fetch(`https://notarium.tr/auth/me?sessionId=${sessionId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      setTestResult(`Status: ${res.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('sessionId');
    setTestResult('Session cleared from localStorage');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debug Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Test Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={testAuth}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test /auth/me
              </button>
              
              <button
                onClick={testAuthWithSessionId}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Test /auth/me with Session ID
              </button>
              
              <button
                onClick={clearSession}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear Session
              </button>
            </div>

            {testResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Role:</strong> {user.role}
              </div>
              <div>
                <strong>ID:</strong> {user.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 