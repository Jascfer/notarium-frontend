import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Clock, Star, CheckCircle, XCircle, Info, Award, BarChart3, History, Users, Target } from 'lucide-react';
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
  const [userAnswers, setUserAnswers] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [experienceGain, setExperienceGain] = useState(0);

  useEffect(() => {
    async function fetchQuiz() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/quiz`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.alreadySolved) {
          setAlreadySolved(true);
        } else {
          setQuestions(data.questions || []);
        }
      } catch (err) {
        console.error('Quiz yükleme hatası:', err);
        setQuestions([]);
      }
      setIsLoading(false);
    }
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (!isLoading && !showResult && timeLeft > 0 && !alreadySolved && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult && !alreadySolved) {
      handleAnswer(null);
    }
  }, [timeLeft, showResult, isLoading, alreadySolved, questions.length]);

  const handleAnswer = (selectedIndex) => {
    setSelectedAnswer(selectedIndex);
    
    // Kullanıcının cevabını kaydet
    const currentQ = questions[currentQuestion];
    setUserAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selectedAnswer: selectedIndex,
      correctAnswer: currentQ.correctAnswer,
      isCorrect: selectedIndex === currentQ.correctAnswer
    }]);

    setTimeout(() => {
      if (selectedIndex === currentQ.correctAnswer) {
        setScore(prev => prev + 1);
      }
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        finishQuiz();
      }
    }, 1000);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    setShowDoneMsg(true);
    
    // Skoru backend'e kaydet
    if (user) {
      try {
        const res = await fetch(`${API_URL}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            score: score, 
            answers: userAnswers 
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setExperienceGain(data.experienceGain);
        }
      } catch (err) {
        console.error('Skor kaydetme hatası:', err);
      }
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/quiz/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error('Liderlik tablosu yükleme hatası:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/quiz/history`, {
        credentials: 'include'
      });
      const data = await res.json();
      setHistory(data.history);
    } catch (err) {
      console.error('Geçmiş yükleme hatası:', err);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setTimeLeft(30);
    setShowDoneMsg(false);
    setUserAnswers([]);
    setExperienceGain(0);
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
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
              <Info className="h-5 w-5" />
              <span>Her gün 5 yeni soru seni bekliyor.</span>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                  fetchLeaderboard();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Liderlik Tablosu</span>
              </button>
              <button
                onClick={() => {
                  setShowHistory(true);
                  fetchHistory();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <History className="h-4 w-4" />
                <span>Geçmişim</span>
              </button>
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

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>+{score * 10} XP kazandınız</span>
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
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowLeaderboard(true);
                    fetchLeaderboard();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Liderlik Tablosu</span>
                </button>
                <button
                  onClick={() => {
                    setShowHistory(true);
                    fetchHistory();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span>Geçmişim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xl">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bugün için yarışma sorusu bulunamadı.</h1>
            <p className="text-gray-600 mb-4">Lütfen daha sonra tekrar deneyin.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ || !currentQ.question || !Array.isArray(currentQ.options)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xl">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Soru verisi hatalı veya eksik.</h1>
            <p className="text-gray-600 mb-4">Lütfen daha sonra tekrar deneyin.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {currentQ.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {currentQ.difficulty}
              </span>
            </div>
            
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

        {/* Liderlik Tablosu Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
                  Liderlik Tablosu
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{user.avatar || '👤'}</span>
                        <span className="font-semibold">{user.first_name} {user.last_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{user.total_score} puan</div>
                      <div className="text-sm text-gray-500">{user.total_quizzes} quiz</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geçmiş Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <History className="h-6 w-6 mr-2 text-blue-600" />
                  Quiz Geçmişim
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {history.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{new Date(quiz.date).toLocaleDateString('tr-TR')}</div>
                        <div className="text-sm text-gray-500">{quiz.score}/5 doğru</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{quiz.score * 10} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 