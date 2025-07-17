import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Support() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Taleplerimi getir
  useEffect(() => {
    if (!user) return;
    fetch('/api/support/mine', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!subject.trim() || !message.trim()) {
      setError('Konu ve mesaj zorunludur.');
      return;
    }
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subject, message })
    });
    if (res.ok) {
      setSuccess('Talebiniz başarıyla oluşturuldu.');
      setSubject('');
      setMessage('');
      // Listeyi güncelle
      const newReq = await res.json();
      setRequests(prev => [newReq, ...prev]);
    } else {
      const data = await res.json();
      setError(data.message || 'Bir hata oluştu.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Destek / Şikayet Talebi Oluştur</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-8 space-y-4">
          <div>
            <label className="block font-medium mb-1">Konu</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border rounded px-3 py-2"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Mesaj</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              maxLength={1000}
              required
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Talep Oluştur</button>
        </form>

        <h2 className="text-xl font-semibold mb-2">Taleplerim</h2>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : requests.length === 0 ? (
          <div>Henüz bir talebiniz yok.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{req.subject}</span>
                  <span className={`text-xs px-2 py-1 rounded ${req.status === 'open' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{req.status === 'open' ? 'Açık' : 'Kapalı'}</span>
                </div>
                <div className="text-gray-700 mb-1">{req.message}</div>
                <div className="text-xs text-gray-500">Oluşturulma: {new Date(req.created_at).toLocaleString('tr-TR')}</div>
                {req.status === 'closed' && req.response && (
                  <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400">
                    <div className="font-semibold text-green-700">Yanıt:</div>
                    <div className="text-gray-800">{req.response}</div>
                    <div className="text-xs text-gray-500">Yanıtlayan: {req.responder_name}</div>
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