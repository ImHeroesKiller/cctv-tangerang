
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import CCTVCard from './components/CCTVCard.tsx';
import SmartTrafficAssistant from './components/SmartTrafficAssistant.tsx';
import { CCTV_DATA } from './constants.tsx';
import { Region, CCTVStream } from './types.ts';

type CategoryFilter = 'Semua' | 'Lalu Lintas' | 'Area Publik' | 'Pusat Kota';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.ALL);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Semua');
  const [activeStream, setActiveStream] = useState<CCTVStream | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Favorites System state and handler
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tangerang_cctv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tangerang_cctv_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  const handleToggleFavorite = (e: React.MouseEvent, stream: CCTVStream) => {
    e.stopPropagation(); // Prevent opening the stream modal when clicking favorite icon
    setFavorites(prev => {
      if (prev.includes(stream.id)) {
        return prev.filter(id => id !== stream.id);
      } else {
        return [...prev, stream.id];
      }
    });
  };

  const filteredStreams = useMemo(() => {
    return CCTV_DATA.filter(stream => {
      const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stream.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === Region.ALL || stream.region === selectedRegion;
      const matchesCategory = selectedCategory === 'Semua' || stream.category === selectedCategory;
      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [searchQuery, selectedRegion, selectedCategory]);

  const favoriteStreams = useMemo(() => {
    return CCTV_DATA.filter(stream => favorites.includes(stream.id));
  }, [favorites]);

  // Query parameter auto-play feature
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cctvId = params.get('cctv');
    if (cctvId) {
      const foundStream = CCTV_DATA.find(s => s.id === cctvId);
      if (foundStream) {
        setActiveStream(foundStream);
      }
    }
  }, []);

  // Modal navigation helpers based on filtered list
  const activeIndexInFiltered = useMemo(() => {
    if (!activeStream) return -1;
    return filteredStreams.findIndex(s => s.id === activeStream.id);
  }, [activeStream, filteredStreams]);

  const handlePrevStream = useCallback(() => {
    if (filteredStreams.length <= 1 || activeIndexInFiltered === -1) return;
    const prevIndex = (activeIndexInFiltered - 1 + filteredStreams.length) % filteredStreams.length;
    setActiveStream(filteredStreams[prevIndex]);
  }, [filteredStreams, activeIndexInFiltered]);

  const handleNextStream = useCallback(() => {
    if (filteredStreams.length <= 1 || activeIndexInFiltered === -1) return;
    const nextIndex = (activeIndexInFiltered + 1) % filteredStreams.length;
    setActiveStream(filteredStreams[nextIndex]);
  }, [filteredStreams, activeIndexInFiltered]);

  // Keyboard navigation support
  useEffect(() => {
    if (!activeStream) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveStream(null);
      } else if (e.key === 'ArrowRight') {
        handleNextStream();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStream();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStream, handleNextStream, handlePrevStream]);

  // Toast trigger helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Share CCTV stream URL
  const handleShareStream = (stream: CCTVStream) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?cctv=${stream.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast(`Tautan untuk "${stream.title}" berhasil disalin ke papan klip!`);
      })
      .catch((err) => {
        console.error('Gagal menyalin tautan:', err);
        showToast('Gagal menyalin tautan.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Panel Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              {/* Region Filters */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Wilayah</p>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[Region.ALL, Region.KOTA, Region.SELATAN, Region.KABUPATEN].map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                        selectedRegion === region
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Kategori Kamera</p>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['Semua', 'Lalu Lintas', 'Area Publik', 'Pusat Kota'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as CategoryFilter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {category === 'Semua' ? 'Semua Kategori' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Favorite Section */}
            {favoriteStreams.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/20 p-6 rounded-2xl border border-amber-100/80 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-amber-500 text-lg">★</span>
                  <h2 className="text-base font-bold text-slate-900">Kamera Favorit Anda</h2>
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {favoriteStreams.length} Berbintang
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteStreams.map((stream) => (
                    <CCTVCard
                      key={`fav-${stream.id}`}
                      stream={stream}
                      onSelect={(s) => setActiveStream(s)}
                      isFavorited={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CCTV Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Live CCTV Tangerang</h2>
                  {selectedCategory !== 'Semua' && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      {selectedCategory}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">{filteredStreams.length} Kamera tersedia</p>
              </div>

              {filteredStreams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStreams.map((stream) => (
                    <CCTVCard 
                      key={stream.id} 
                      stream={stream} 
                      onSelect={(s) => setActiveStream(s)}
                      isFavorited={favorites.includes(stream.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Kamera tidak ditemukan</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">Coba gunakan kata kunci pencarian lain atau pilih wilayah/kategori yang berbeda.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            <SmartTrafficAssistant selectedRegion={selectedRegion} />
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Tentang Layanan</h3>
               <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg h-fit">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Sumber Resmi</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">Video diakses melalui kanal resmi Dishub & Pemerintah Daerah Tangerang Raya.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg h-fit">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Analisis AI</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">Menggunakan Google Gemini untuk menyajikan berita lalu lintas terkini secara instan.</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Dashboard CCTV Tangerang. Seluruh hak cipta pada pemilik konten masing-masing.
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[80] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Stream Modal */}
      {activeStream && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setActiveStream(null)}></div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row">
             {/* Navigation buttons: absolute sides for quick switching */}
             {filteredStreams.length > 1 && (
               <>
                 <button
                  onClick={handlePrevStream}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hidden md:block"
                  title="Kamera Sebelumnya"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <button
                  onClick={handleNextStream}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hidden md:block"
                  title="Kamera Selanjutnya"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </>
             )}

             <div className="flex-1 flex flex-col">
               <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                 <button
                  onClick={() => handleShareStream(activeStream)}
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  title="Salin tautan bagikan"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                   </svg>
                 </button>
                 <button
                  onClick={() => setActiveStream(null)}
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  title="Tutup"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               <div className="aspect-video bg-black relative">
                 <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeStream.youtubeId}?autoplay=1`}
                  title={activeStream.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                 ></iframe>
               </div>

               <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live Stream</span>
                     <span className="text-slate-300">•</span>
                     <span className="text-sm font-medium text-slate-500">{activeStream.region}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{activeStream.title}</h3>
                  <p className="text-slate-500 mt-1">{activeStream.location}</p>

                  {/* Mobile navigation row */}
                  {filteredStreams.length > 1 && (
                    <div className="flex gap-2 mt-4 md:hidden">
                      <button
                        onClick={handlePrevStream}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Sebelumnya
                      </button>
                      <button
                        onClick={handleNextStream}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"
                      >
                        Berikutnya
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-4 gap-4">
                     <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                           Stable Connection
                        </span>
                        <span>Source: YouTube Public Feed</span>
                     </div>
                     <button
                      onClick={() => handleShareStream(activeStream)}
                      className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline text-left self-start sm:self-auto"
                     >
                        Bagikan Lokasi
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                        </svg>
                     </button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
