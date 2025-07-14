import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api'; // Use local API routes

export default function GameScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchScores() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/game/scores/${user.id}`);
        const data = await res.json();
        setScores(data);
      } catch (err) {
        setScores([]);
      }
      setIsLoading(false);
    }
    fetchScores();
  }, [user]);

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Oyun Skorların</h2>
      <ul className="space-y-2">
        {scores.map((score, idx) => (
          <li key={idx} className="bg-white rounded shadow p-4 flex justify-between items-center">
            <span>Skor: {score.score}</span>
            <span className="text-gray-500 text-sm">ID: {score.id}</span>
          </li>
        ))}
      </ul>
      {scores.length === 0 && <div>Henüz skorun yok.</div>}
    </div>
  );
} 