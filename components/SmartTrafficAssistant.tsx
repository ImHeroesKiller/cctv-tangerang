
import React, { useState, useEffect } from 'react';
import { fetchTrafficInsights } from '../services/gemini';
import { TrafficInsight, Region } from '../types';

interface Props {
  selectedRegion: Region;
}

const SmartTrafficAssistant: React.FC<Props> = ({ selectedRegion }) => {
  const [insight, setInsight] = useState<TrafficInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    const result = await fetchTrafficInsights(selectedRegion === Region.ALL ? "Tangerang Raya" : selectedRegion);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    loadInsights();
  }, [selectedRegion]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-xl backdrop-blur-sm border border-blue-400/30">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.951-.683l2.094-6.33a1 1 0 00-.951-1.317H4.553a1 1 0 00-.951 1.317l2.094 6.33a1 1 0 00.951.683z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 0l-3 3m3-3l3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">Asisten Lalin AI</h2>
            <p className="text-xs text-blue-200/60 font-medium">Data Berbasis Google Search Grounding</p>
          </div>
        </div>
        <button 
          onClick={loadInsights}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Segarkan data"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/5">
            <p className="text-sm leading-relaxed text-blue-50">
              {insight?.summary}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-blue-300 font-medium">Diperbarui: {insight?.timestamp}</span>
            </div>
          </div>

          {insight?.sources && insight.sources.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-wider text-blue-300/80 font-bold px-1">Sumber Terkait</h3>
              <div className="flex flex-wrap gap-2">
                {insight.sources.slice(0, 3).map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 truncate max-w-[150px]"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
