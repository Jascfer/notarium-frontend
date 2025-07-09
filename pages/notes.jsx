import { useState, useEffect } from 'react';
import { Search, Download, Eye, Heart, Filter, BookOpen, Calendar, User, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Notes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'founder';
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', subject: 'all', description: '', tags: '', driveLink: '' });
  const [addError, setAddError] = useState('');
  const [userLikes, setUserLikes] = useState([]);
  const SUBJECTS_KEY = 'site_note_subjects_v1';
  const defaultSubjects = [
    { id: 'all', name: 'Tüm Dersler' },
    { id: 'matematik', name: 'Matematik' },
    { id: 'fizik', name: 'Fizik' },
    { id: 'kimya', name: 'Kimya' },
    { id: 'biyoloji', name: 'Biyoloji' },
    { id: 'tarih', name: 'Tarih' },
    { id: 'edebiyat', name: 'Edebiyat' },
    { id: 'ingilizce', name: 'İngilizce' },
    { id: 'bilgisayar', name: 'Bilgisayar Mühendisliği' },
    { id: 'elektrik', name: 'Elektrik-Elektronik Müh.' },
    { id: 'makine', name: 'Makine Mühendisliği' },
    { id: 'tip', name: 'Tıp' },
    { id: 'hukuk', name: 'Hukuk' },
    { id: 'psikoloji', name: 'Psikoloji' },
    { id: 'ekonomi', name: 'Ekonomi' },
    { id: 'isletme', name: 'İşletme' },
    { id: 'mimarlik', name: 'Mimarlık' },
    { id: 'molekuler', name: 'Moleküler Biyoloji' },
    { id: 'cografya', name: 'Coğrafya' },
    { id: 'felsefe', name: 'Felsefe' },
    { id: 'sosyoloji', name: 'Sosyoloji' },
    { id: 'istatistik', name: 'İstatistik' },
    { id: 'cevre', name: 'Çevre Mühendisliği' },
    { id: 'inşaat', name: 'İnşaat Mühendisliği' },
    { id: 'kimyamuh', name: 'Kimya Mühendisliği' },
    { id: 'eczacilik', name: 'Eczacılık' },
    { id: 'diger', name: 'Diğer' }
  ];
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [catError, setCatError] = useState('');

  const NOTES_KEY = 'site_notes_v1';
  const LIKES_KEY = user ? `site_notes_likes_${user.id}` : null;

  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Notları localStorage'dan yükle (sadece ilk mount)
    const storedNotes = localStorage.getItem(NOTES_KEY);
    setNotes(storedNotes ? JSON.parse(storedNotes) : []);
    setIsLoading(false);
  }, []);

  // Kullanıcı beğenilerini yükle (user değişince)
  useEffect(() => {
    if (LIKES_KEY) {
      const storedLikes = localStorage.getItem(LIKES_KEY);
      setUserLikes(storedLikes ? JSON.parse(storedLikes) : []);
    }
  }, [LIKES_KEY]);

  // Notlar değişince localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);
  // Kullanıcı beğenileri değişince kaydet
  useEffect(() => {
    if (LIKES_KEY) {
      localStorage.setItem(LIKES_KEY, JSON.stringify(userLikes));
    }
  }, [userLikes, LIKES_KEY]);

  // Kategorileri localStorage'dan yükle
  useEffect(() => {
    const storedSubjects = localStorage.getItem(SUBJECTS_KEY);
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
  }, []);

  // Kategoriler değişince localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (selectedSort) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'popular':
        return b.downloads - a.downloads;
      case 'most-liked':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  // Notlar ekranda ilk kez gösterildiğinde views sayacını artır
  useEffect(() => {
    if (!isLoading && sortedNotes.length > 0) {
      setNotes(prevNotes => {
        // Sadece ekranda görünen notların views'unu artır
        const updated = prevNotes.map(note => {
          if (sortedNotes.some(n => n.id === note.id)) {
            // Sadece bir kez artırmak için, bir flag ekleyelim (ör: _viewed)
            if (!note._viewed) {
              return { ...note, views: (note.views || 0) + 1, _viewed: true };
            }
          }
          return note;
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, sortedNotes.map(n => n.id).join(",")]);

  const handleDownload = (noteId) => {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === noteId ? { ...note, downloads: (note.downloads || 0) + 1 } : note
    ));
    // Simüle edilmiş indirme
    alert(`"${notes.find(n => n.id === noteId)?.title}" indiriliyor...`);
  };

  const handleLike = (noteId) => {
    if (!user) return;
    if (userLikes.includes(noteId)) {
      // Unlike
      setUserLikes(prev => prev.filter(id => id !== noteId));
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, likes: Math.max(0, note.likes - 1) } : note));
    } else {
      // Like
      setUserLikes(prev => [...prev, noteId]);
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, likes: note.likes + 1 } : note));
    }
  };

  // Not ekle
  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.description.trim() || newNote.subject === 'all') {
      setAddError('Başlık, açıklama ve ders seçimi zorunlu!');
      return;
    }
    setNotes(prev => [
      {
        id: Date.now(),
        title: newNote.title,
        subject: newNote.subject,
        author: user?.name || 'Admin',
        date: new Date().toISOString().slice(0, 10),
        downloads: 0,
        views: 0,
        likes: 0,
        description: newNote.description,
        tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
        driveLink: newNote.driveLink?.trim() || ''
      },
      ...prev
    ]);
    setShowAddModal(false);
    setNewNote({ title: '', subject: 'all', description: '', tags: '', driveLink: '' });
    setAddError('');
  };

  // Not sil
  const handleDeleteNote = (noteId) => {
    if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) {
      setCatError('Kategori adı boş olamaz!');
      return;
    }
    if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      setCatError('Bu isimde bir kategori zaten var!');
      return;
    }
    const id = name.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/g, '-');
    setSubjects(prev => [...prev, { id, name }]);
    setShowAddCategory(false);
    setNewCategory('');
    setCatError('');
  };

  if (isLoading) {
    return <LoadingSpinner text="Notlar yükleniyor..." />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-purple-600" />
                Notlar
              </h1>
              <p className="text-gray-600">Ders notlarınızı paylaşın ve diğer öğrencilerden faydalanın</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Kategori Ekle</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Not Ekle</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Kategori Ekle Modal */}
          {isAdmin && showAddCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                <button onClick={() => setShowAddCategory(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
                <h2 className="text-xl font-bold mb-4">Yeni Kategori Ekle</h2>
                {catError && <div className="mb-2 text-red-600 font-semibold">{catError}</div>}
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="Kategori adı (örn. Veri Bilimi)"
                />
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                >
                  Ekle
                </button>
              </div>
            </div>
          )}

          {/* Not Ekle Modal */}
          {isAdmin && showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
                <h2 className="text-xl font-bold mb-4">Yeni Not Ekle</h2>
                {addError && <div className="mb-2 text-red-600 font-semibold">{addError}</div>}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Başlık</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Ders</label>
                  <select
                    value={newNote.subject}
                    onChange={e => setNewNote({ ...newNote, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    value={newNote.description}
                    onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Etiketler (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={newNote.tags}
                    onChange={e => setNewNote({ ...newNote, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Google Drive Linki (isteğe bağlı)</label>
                  <input
                    type="text"
                    value={newNote.driveLink}
                    onChange={e => setNewNote({ ...newNote, driveLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold mt-2"
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Not ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Subject Filter */}
              <div className="flex-shrink-0">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-shrink-0">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="popular">En Popüler</option>
                  <option value="most-liked">En Beğenilen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {note.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(note.date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {subjects.find(s => s.id === note.subject)?.name}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {note.downloads}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {note.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {note.likes}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={e => {
                        if (note.driveLink) {
                          e.preventDefault();
                          window.open(note.driveLink, '_blank');
                        } else {
                          handleDownload(note.id);
                        }
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      İndir
                    </button>
                    <button
                      onClick={() => handleLike(note.id)}
                      className={`px-4 py-2 border ${userLikes.includes(note.id) ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center`}
                      title={userLikes.includes(note.id) ? 'Beğenmekten vazgeç' : 'Beğen'}
                    >
                      <Heart className={`h-4 w-4 ${userLikes.includes(note.id) ? 'fill-red-500 text-red-600' : ''}`} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center"
                        title="Notu Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedNotes.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinize uygun not bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 