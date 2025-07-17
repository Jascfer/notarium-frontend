import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function SupportAdmin() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'founder')) return;
    fetch('/api/support/all', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleRespond = async (id) => {
    setError('');
    setSuccess('');
    if (!responseText[id] || !responseText[id].trim()) {
      setError('Cevap boş olamaz.');
      return;
    }
    const res = await fetch(`/api/support/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ response: responseText[id] })
    });
    if (res.ok) {
      setSuccess('Yanıt başarıyla gönderildi.');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'closed', response: responseText[id], responder_name: user.name } : r));
      setResponseText(prev => ({ ...prev, [id]: '' }));
    } else {
      const data = await res.json();
      setError(data.message || 'Bir hata oluştu.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'founder')) {
    return <ProtectedRoute><div className="max-w-2xl mx-auto py-8 px-4">Yetkisiz erişim.</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Tüm Destek / Şikayet Talepleri</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {loading ? (
          <div>Yükleniyor...</div>
        ) : requests.length === 0 ? (
          <div>Hiç talep yok.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{req.subject}</span>
                  <span className={`text-xs px-2 py-1 rounded ${req.status === 'open' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{req.status === 'open' ? 'Açık' : 'Kapalı'}</span>
                </div>
                <div className="text-gray-700 mb-1">{req.message}</div>
                <div className="text-xs text-gray-500 mb-1">Kullanıcı: {req.user_name} | Oluşturulma: {new Date(req.created_at).toLocaleString('tr-TR')}</div>
                {req.status === 'closed' && req.response && (
                  <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400">
                    <div className="font-semibold text-green-700">Yanıt:</div>
                    <div className="text-gray-800">{req.response}</div>
                    <div className="text-xs text-gray-500">Yanıtlayan: {req.responder_name}</div>
                  </div>
                )}
                {req.status === 'open' && (
                  <div className="mt-2">
                    <textarea
                      value={responseText[req.id] || ''}
                      onChange={e => setResponseText(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="w-full border rounded px-3 py-2 mb-2"
                      rows={2}
                      placeholder="Yanıtınızı yazın..."
                    />
                    <button
                      onClick={() => handleRespond(req.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >Yanıtla</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 