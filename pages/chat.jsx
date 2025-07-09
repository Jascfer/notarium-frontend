import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Hash, Smile, Shield, UserX, Ban, Crown, UserPlus, UserMinus, Moon, Sun } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'https://notarium-backend-production.up.railway.app';
const SOCKET_URL = 'https://notarium-backend-production.up.railway.app';
let socket;

export default function Chat() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ders-yardim');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, setUserRole } = useAuth();
  const [muteUntil, setMuteUntil] = useState(0);
  const [muteReason, setMuteReason] = useState('');
  const [msgTimestamps, setMsgTimestamps] = useState([]);
  const [remainingMute, setRemainingMute] = useState(0);
  const { isDarkMode } = useTheme();

  const channels = [
    { id: 'ders-yardim', name: 'Ders Yardım Odası', icon: '📚', color: 'purple' },
    { id: 'sinav-taktikleri', name: 'Sınav Taktikleri', icon: '🎯', color: 'blue' },
    { id: 'kampus-geyikleri', name: 'Kampüs Geyikleri', icon: '😄', color: 'green' },
    { id: 'etkinlik-duyurular', name: 'Etkinlik Duyuruları', icon: '📢', color: 'orange' }
  ];

  useEffect(() => {
    if (!user) return;
    if (!socket) {
      socket = io(SOCKET_URL);
    }
    socket.emit('userOnline', {
      id: user.id,
      name: user.name,
      avatar: user.avatar || '👤',
      role: user.role || 'user',
      status: 'online'
    });
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.off('onlineUsers');
    };
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    if (!socket) {
      socket = io(SOCKET_URL);
    }
    socket.emit('joinChannel', selectedChannel);
    socket.on('chatHistory', (history) => {
      setMessages(history);
      setIsLoading(false);
    });
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
    };
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleBanned = () => {
      alert('Sohbetten banlandınız.');
      window.location.href = '/';
    };
    const handleKicked = () => {
      alert('Sohbetten uzaklaştırıldınız.');
      window.location.href = '/';
    };
    socket.on('banned', handleBanned);
    socket.on('kicked', handleKicked);
    return () => {
      socket.off('banned', handleBanned);
      socket.off('kicked', handleKicked);
    };
  }, []);

  // Hata mesajı (ör. admin olmayan biri etkinlik duyurusuna mesaj atarsa)
  const [errorMsg, setErrorMsg] = useState('');
  useEffect(() => {
    if (!socket) return;
    const handleError = (msg) => setErrorMsg(msg);
    socket.on('errorMessage', handleError);
    return () => {
      socket.off('errorMessage', handleError);
    };
  }, []);

  const checkSpam = () => {
    const now = Date.now();
    const recent = msgTimestamps.filter(ts => now - ts < 5000); // 5 sn içinde
    if (recent.length >= 2) {
      setMuteUntil(now + 30000); // 30 sn mute
      setMuteReason('Spam nedeniyle geçici olarak susturuldunuz.');
      return true;
    }
    return false;
  };

  const checkBadWords = (msg) => {
    // Basit Türkçe küfür filtresi (badWordsTR veya kendi listemiz)
    const badwords = [
      'amk','aq','orospu','sik','piç','yarrak','ananı','anan','göt','amına','amcık','pezevenk','kahpe','mal','salak','gerizekalı','aptal','sürtük','ibne','ibine','oç','mk','sg','siktir','bok','sikik','sikiyim','sikeyim','amq','amk','aq','yavşak','şerefsiz','şırfıntı','dallama','dangalak','dingil','döl','embesil','gavat','godoş','hıyar','kaltak','kancık','kıç','koduğum','koyayım','koyim','kro','lavuk','meme','orospu','pezevenk','puşt','sik','sikik','sikim','siktir','sürtük','taşak','yarak','yarrak','yavşak','yobaz','zübük'
    ];
    const lower = msg.toLowerCase();
    return badwords.some(word => lower.includes(word));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (muteUntil > Date.now()) return;
    if (newMessage.trim() && user) {
      const now = Date.now();
      if (checkSpam()) return;
      if (checkBadWords(newMessage)) {
        setMuteUntil(now + 120000);
        setMuteReason('Küfür nedeniyle geçici olarak susturuldunuz.');
        return;
      }
      setMsgTimestamps(prev => [...prev.filter(ts => now - ts < 5000), now]);
      const msg = {
        id: Date.now(),
        user: user.name,
        avatar: user.avatar || '👤',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        channel: selectedChannel
      };
      socket.emit('sendMessage', { channel: selectedChannel, message: msg });
      setNewMessage('');
    }
  };

  const getChannelColor = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    const colors = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500'
    };
    return colors[channel?.color] || 'bg-gray-500';
  };

  const isFounder = user?.role === 'founder';
  const isAdmin = user?.role === 'admin' || isFounder;
  const isEventChannel = selectedChannel === 'etkinlik-duyurular';
  const canSendMessage = !isEventChannel || isAdmin;

  // Admin yetkisi verme/geri alma (sadece founder ve adminler için, founder hariç)
  const handleMakeAdmin = (userId) => {
    if (window.confirm('Bu kullanıcıya admin yetkisi vermek istiyor musunuz?')) {
      setUserRole(userId, 'admin');
    }
  };
  const handleRemoveAdmin = (userId) => {
    if (window.confirm('Bu kullanıcının admin yetkisini kaldırmak istiyor musunuz?')) {
      setUserRole(userId, 'user');
    }
  };

  // Admin: kullanıcıyı banla
  const handleBan = (userId) => {
    if (window.confirm('Bu kullanıcıyı banlamak istediğinize emin misiniz?')) {
      console.log('Banlama isteği gönderiliyor:', userId);
      socket.emit('banUser', userId);
      // Banlanan kullanıcıyı listeden kaldır
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    }
  };
  // Admin: kullanıcıyı uzaklaştır
  const handleKick = (userId) => {
    if (window.confirm('Bu kullanıcıyı uzaklaştırmak istediğinize emin misiniz?')) {
      console.log('Kick isteği gönderiliyor:', userId);
      socket.emit('kickUser', userId);
      // Uzaklaştırılan kullanıcıyı listeden kaldır
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  useEffect(() => {
    // Mesajlar değiştikçe localStorage'a kaydet
    // localStorage.setItem('site_chat_messages', JSON.stringify(messages)); // Bu satır kaldırıldı
  }, [messages]);

  useEffect(() => {
    if (muteUntil > Date.now()) {
      setRemainingMute(Math.ceil((muteUntil - Date.now()) / 1000));
      const interval = setInterval(() => {
        const rem = Math.ceil((muteUntil - Date.now()) / 1000);
        setRemainingMute(rem > 0 ? rem : 0);
        if (rem <= 0) {
          setMuteUntil(0);
          setMuteReason('');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRemainingMute(0);
    }
  }, [muteUntil]);

  // Mute bilgisini localStorage'dan yükle
  // useEffect(() => {
  //   if (MUTE_KEY) {
  //     const muteData = localStorage.getItem(MUTE_KEY);
  //     if (muteData) {
  //       const { until, reason } = JSON.parse(muteData);
  //       if (until > Date.now()) {
  //         setMuteUntil(until);
  //         setMuteReason(reason);
  //       } else {
  //         localStorage.removeItem(MUTE_KEY);
  //       }
  //     }
  //   }
  // }, [MUTE_KEY]);

  // Mute başlatıldığında localStorage'a yaz
  // useEffect(() => {
  //   if (muteUntil > Date.now() && MUTE_KEY) {
  //     localStorage.setItem(MUTE_KEY, JSON.stringify({ until: muteUntil, reason: muteReason }));
  //   } else if (MUTE_KEY) {
  //     localStorage.removeItem(MUTE_KEY);
  //   }
  // }, [muteUntil, muteReason, MUTE_KEY]);

  if (isLoading) {
    return <LoadingSpinner text="Sohbet yükleniyor..." />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Channels */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="h-5 w-5 mr-2" />
                Kanallar
              </h2>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                      selectedChannel === channel.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{channel.icon}</span>
                    <span className="font-medium">{channel.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div className="flex-1 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Çevrimiçi ({onlineUsers.filter(u => u.status === 'online').length})
              </h3>
              <div className="space-y-3">
                {onlineUsers.map((u, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="relative">
                      <span className="text-2xl">{u.avatar}</span>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        u.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      {/* Founder simgesi */}
                      {u.role === 'founder' && (
                        <span className="absolute -top-2 -left-2 bg-yellow-300 rounded-full p-1" title="Kurucu">
                          <Crown className="h-4 w-4 text-yellow-700" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center space-x-1">
                        <span>{u.name}</span>
                        {u.role === 'founder' && <span className="text-xs text-yellow-700 font-bold">Kurucu</span>}
                        {u.role === 'admin' && u.role !== 'founder' && <span className="text-xs text-purple-700 font-bold">Admin</span>}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{u.status}</div>
                    </div>
                    {/* Founder ve adminler için admin atama/geri alma, founder hariç */}
                    {isAdmin && u.id !== user.id && u.role !== 'founder' && (
                      <div className="flex space-x-1">
                        {u.role === 'user' && (
                          <button
                            title="Admin yap"
                            onClick={() => handleMakeAdmin(u.id)}
                            className="p-1 rounded hover:bg-purple-100 text-purple-700"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        {u.role === 'admin' && (
                          <button
                            title="Admin yetkisini kaldır"
                            onClick={() => handleRemoveAdmin(u.id)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                        {/* Ban/kick butonları */}
                        <button
                          title="Banla"
                          onClick={() => handleBan(u.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          title="Uzaklaştır"
                          onClick={() => handleKick(u.id)}
                          className="p-1 rounded hover:bg-yellow-100 text-yellow-600"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {channels.find(c => c.id === selectedChannel)?.icon}
                </span>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {channels.find(c => c.id === selectedChannel)?.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {onlineUsers.filter(u => u.status === 'online').length} çevrimiçi
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {message.avatar ? message.avatar : (message.user?.charAt(0) || '?')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{message.user}</span>
                      <span className="text-sm text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {errorMsg && (
                <div className="mb-2 text-center text-red-600 font-semibold">{errorMsg}</div>
              )}
              {muteUntil > Date.now() ? (
                <div className="flex items-center justify-center text-red-600 font-semibold space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{muteReason} ({remainingMute} sn)</span>
                </div>
              ) : isEventChannel && !isAdmin ? (
                <div className="flex items-center justify-center text-red-600 font-semibold space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Bu kanala sadece adminler mesaj gönderebilir.</span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!canSendMessage || muteUntil > Date.now()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !canSendMessage || muteUntil > Date.now()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Gönder</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 