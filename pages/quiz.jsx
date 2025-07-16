import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Clock, Star, CheckCircle, XCircle, Info } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = '/api'; // Use local API routes

export default function Quiz() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [showDoneMsg, setShowDoneMsg] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/quiz`);
        const data = await res.json();
        setQuestions(data[0]?.questions || []);
      } catch (err) {
        setQuestions([]);
      }
      setIsLoading(false);
    }
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (!isLoading && !showResult && timeLeft > 0 && !alreadySolved) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult && !alreadySolved) {
      handleAnswer(null);
    }
  }, [timeLeft, showResult, isLoading, alreadySolved]);

  const handleAnswer = (selectedIndex) => {
    setSelectedAnswer(selectedIndex);
    setTimeout(() => {
      if (selectedIndex === questions[currentQuestion]?.correctAnswer) {
        setScore(prev => prev + 1);
      }
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        setShowResult(true);
        setShowDoneMsg(true);
        // Skoru backend'e kaydet
        if (user) {
          fetch(`${API_URL}/game/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, score }),
          });
        }
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setTimeLeft(30);
    setShowDoneMsg(false);
  };

  // Quiz zaten çözülmüşse
  if (isLoading) {
    return <LoadingSpinner text="Yarışma hazırlanıyor..." />;
  }
  if (alreadySolved) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xl">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Günün sorularını zaten çözdün!</h1>
            <p className="text-gray-600 mb-4">Yarın yeni sorularla tekrar yarışabilirsin.</p>
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
              <Info className="h-5 w-5" />
              <span>Her gün 5 yeni soru seni bekliyor.</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (showResult) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mb-6">
                {score >= 3 ? (
                  <div className="text-6xl mb-4">🏆</div>
                ) : (
                  <div className="text-6xl mb-4">📚</div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {score >= 3 ? "Tebrikler!" : "İyi Deneme!"}
                </h1>
                <p className="text-gray-600">
                  {score >= 3 ? "Zeka Küpü rozetini kazandınız!" : "Daha fazla çalışmaya devam edin."}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{score}/{questions.length}</div>
                <div className="text-gray-600">Doğru Cevap</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>+{score * 3} puan kazandınız</span>
                </div>
                {score >= 3 && (
                  <div className="flex items-center justify-center space-x-2 text-yellow-600">
                    <Star className="h-5 w-5" />
                    <span>Zeka Küpü rozeti eklendi</span>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Trophy className="h-5 w-5" />
                  <span>Günlük yarışma tamamlandı</span>
                </div>
                {showDoneMsg && (
                  <div className="flex items-center justify-center space-x-2 text-purple-700 font-semibold mt-4">
                    <Info className="h-5 w-5" />
                    <span>Günün sorularını çözdün! Yarınki soruları bekle.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎮 Günlük Bilgi Yarışması</h1>
            <p className="text-xl text-gray-600">Her gün 5 yeni soru, sınırsız bilgi!</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-gray-700">Soru {currentQuestion + 1}/{questions.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-gray-700">{timeLeft}s</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {currentQ.question}
            </h2>
            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectedAnswer === null && handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedAnswer === null
                      ? 'bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300'
                      : selectedAnswer === index
                      ? index === currentQ.correctAnswer
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-red-100 border-2 border-red-500'
                      : index === currentQ.correctAnswer
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">{option}</span>
                    {selectedAnswer !== null && (
                      <div className="flex items-center space-x-2">
                        {index === currentQ.correctAnswer ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : selectedAnswer === index ? (
                          <XCircle className="h-6 w-6 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {/* Score Display */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-4 bg-purple-100 rounded-full px-6 py-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-gray-900">Puan: {score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 