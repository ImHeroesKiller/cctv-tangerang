
import React, { useState, useEffect } from 'react';
import { fetchTrafficInsights } from '../services/gemini.ts';
import { TrafficInsight, Region } from '../types.ts';

interface Props {
  selectedRegion: Region;
}

type QueryType = 'kemacetan' | 'alternatif' | 'banjir';

const SmartTrafficAssistant: React.FC<Props> = ({ selectedRegion }) => {
  const [insight, setInsight] = useState<TrafficInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeQueryType, setActiveQueryType] = useState<QueryType>('kemacetan');

  const loadInsights = async (queryType: QueryType = activeQueryType) => {
    setLoading(true);
    setActiveQueryType(queryType);
    const regionName = selectedRegion === Region.ALL ? "Tangerang Raya" : selectedRegion;
    const result = await fetchTrafficInsights(regionName, queryType);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    // Reload default 'kemacetan' query when selected region changes
    loadInsights('kemacetan');
  }, [selectedRegion]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-400/30 shadow-inner">
            <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.674a1 1 0 00.951-.683l2.094-6.33a1 1 0 00-.951-1.317H4.553a1 1 0 00-.951 1.317l2.094 6.33a1 1 0 00.951.683z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 0l-3 3m3-3l3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Asisten Lalin AI</h2>
            <p className="text-[10px] text-blue-300/80 font-semibold uppercase tracking-wider">LIVE GEMINI RADAR</p>
          </div>
        </div>
        <button 
          onClick={() => loadInsights(activeQueryType)}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95 border border-white/5 bg-white/5 shadow-sm"
          title="Segarkan laporan"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Preset interactive query buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        <button
          onClick={() => loadInsights('kemacetan')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
            activeQueryType === 'kemacetan'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
              : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
          }`}
        >
          🔥 Info Macet
        </button>
        <button
          onClick={() => loadInsights('alternatif')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
            activeQueryType === 'alternatif'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
              : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
          }`}
        >
          🔄 Rute Alternatif
        </button>
        <button
          onClick={() => loadInsights('banjir')}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
            activeQueryType === 'banjir'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
              : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
          }`}
        >
          🌧️ Banjir/Cuaca
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 py-2 animate-pulse relative z-10">
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 shadow-inner">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5">
              <span className="text-[9px] font-black tracking-widest text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900/50 uppercase">
                {selectedRegion === Region.ALL ? "Tangerang Raya" : selectedRegion}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{insight?.timestamp} WIB</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-200 font-medium">
              {insight?.summary}
            </p>
          </div>

          {insight?.sources && insight.sources.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-wider text-blue-300/80 font-bold px-1">Sumber Pemantauan</h3>
              <div className="flex flex-wrap gap-1.5">
                {insight.sources.slice(0, 3).map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 truncate max-w-[145px]"
                    title={source.title}
                  >
                    <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartTrafficAssistant;
