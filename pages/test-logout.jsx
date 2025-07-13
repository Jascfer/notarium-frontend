import { useAuth } from '../contexts/AuthContext';

export default function TestLogout() {
  const { user, logout, sessionId } = useAuth();

  const handleLogout = () => {
    console.log('TestLogout: Logout button clicked');
    console.log('TestLogout: Current sessionId:', sessionId);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Logout</h1>
        <div className="mb-4">
          <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
          <p><strong>Session ID:</strong> {sessionId || 'No session ID'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Test Logout
        </button>
      </div>
    </div>
  );
} 