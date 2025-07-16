import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Hash, Smile, Shield, UserX, Ban, Crown, UserPlus, UserMinus, Moon, Sun } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { useTheme } from '../contexts/ThemeContext';

export default function Chat() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ders-yardim');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, SOCKET_URL } = useAuth();
  const [muteUntil, setMuteUntil] = useState(0);
  const [muteReason, setMuteReason] = useState('');
  const [msgTimestamps, setMsgTimestamps] = useState([]);
  const [remainingMute, setRemainingMute] = useState(0);
  const { isDarkMode } = useTheme();
  const [socket, setSocket] = useState(null);

  const channels = [
    { id: 'ders-yardim', name: 'Ders Yardım Odası', icon: '📚', color: 'purple' },
    { id: 'sinav-taktikleri', name: 'Sınav Taktikleri', icon: '🎯', color: 'blue' },
    { id: 'kampus-geyikleri', name: 'Kampüs Geyikleri', icon: '😄', color: 'green' },
    { id: 'etkinlik-duyurular', name: 'Etkinlik Duyuruları', icon: '📢', color: 'orange' }
  ];

  // Socket.io connection
  useEffect(() => {
    if (!user) return;

    console.log('Connecting to socket:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: false,
      autoConnect: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      
      // Send user info after connection
      newSocket.emit('userOnline', {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar || '👤',
        role: user.role || 'user',
        status: 'online'
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [user, SOCKET_URL]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('onlineUsers', (users) => {
      console.log('Online users updated:', users.length);
      setOnlineUsers(users);
    });

    socket.on('chatHistory', (history) => {
      console.log('Chat history received:', history.length, 'messages');
      setMessages(history);
      setIsLoading(false);
    });

    socket.on('newMessage', (msg) => {
      console.log('New message received:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('banned', () => {
      alert('Sohbetten banlandınız.');
      window.location.href = '/';
    });

    socket.on('kicked', () => {
      alert('Sohbetten uzaklaştırıldınız.');
      window.location.href = '/';
    });

    socket.on('errorMessage', (msg) => {
      console.error('Socket error message:', msg);
      alert(msg);
    });

    return () => {
      socket.off('onlineUsers');
      socket.off('chatHistory');
      socket.off('newMessage');
      socket.off('banned');
      socket.off('kicked');
      socket.off('errorMessage');
    };
  }, [socket]);

  // Join channel when selected
  useEffect(() => {
    if (!socket || !user) return;

    console.log('Joining channel:', selectedChannel);
    socket.emit('joinChannel', selectedChannel);
  }, [selectedChannel, socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mute countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = muteUntil - Date.now();
      setRemainingMute(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [muteUntil]);

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
    const badwords = [
      'amk','aq','orospu','sik','piç','yarrak','ananı','anan','göt','amına','amcık','pezevenk','kahpe','mal','salak','gerizekalı','aptal','sürtük','ibne','ibine','oç','mk','sg','siktir','bok','sikik','sikiyim','sikeyim','amq','amk','aq','yavşak','şerefsiz','şırfıntı','dallama','dangalak','dingil','döl','embesil','gavat','godoş','hıyar','kaltak','kancık','kıç','koduğum','koyayım','koyim','kro','lavuk','meme','orospu','pezevenk','puşt','sik','sikik','sikim','siktir','sürtük','taşak','yarak','yarrak','yavşak','yobaz','zübük'
    ];
    const lower = msg.toLowerCase();
    return badwords.some(word => lower.includes(word));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (muteUntil > Date.now()) return;
    if (newMessage.trim() && user && socket) {
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
        user: `${user.firstName} ${user.lastName}`,
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

  // Admin: kullanıcıyı banla
  const handleBan = (userId) => {
    if (window.confirm('Bu kullanıcıyı banlamak istediğinize emin misiniz?')) {
      console.log('Banlama isteği gönderiliyor:', userId);
      socket.emit('banUser', userId);
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Admin: kullanıcıyı uzaklaştır
  const handleKick = (userId) => {
    if (window.confirm('Bu kullanıcıyı uzaklaştırmak istediğinize emin misiniz?')) {
      console.log('Kick isteği gönderiliyor:', userId);
      socket.emit('kickUser', userId);
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
            {/* Sidebar */}
            <div className={`lg:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Users className="mr-2" />
                  Çevrimiçi ({onlineUsers.length})
                </h2>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {onlineUsers.map((user) => (
                  <div key={user.id} className={`flex items-center justify-between p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center">
                      <span className="mr-2">{user.avatar}</span>
                      <span className="text-sm">{user.name}</span>
                      {user.role === 'admin' && <Crown className="ml-1 text-yellow-500" size={16} />}
                      {user.role === 'founder' && <Shield className="ml-1 text-purple-500" size={16} />}
                    </div>
                    {isAdmin && user.id !== user?.id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleKick(user.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Uzaklaştır"
                        >
                          <UserMinus size={16} />
                        </button>
                        <button
                          onClick={() => handleBan(user.id)}
                          className="text-red-700 hover:text-red-900"
                          title="Banla"
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Channel Header */}
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Hash className="mr-2" />
                    <h1 className="text-xl font-semibold">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </h1>
                  </div>
                  <div className="flex space-x-2">
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedChannel === channel.id
                            ? `${getChannelColor(channel.id)} text-white`
                            : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {channel.icon} {channel.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-4 overflow-y-auto`}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="text-2xl">{message.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{message.user}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="mt-1">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                {muteUntil > Date.now() ? (
                  <div className="text-center text-red-500">
                    <p>{muteReason}</p>
                    <p>Kalan süre: {Math.ceil(remainingMute / 1000)} saniye</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={canSendMessage ? "Mesajınızı yazın..." : "Bu kanala sadece adminler mesaj gönderebilir"}
                      disabled={!canSendMessage}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !canSendMessage}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 