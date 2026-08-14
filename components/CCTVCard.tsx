
import React from 'react';
import { CCTVStream } from '../types';

interface CCTVCardProps {
  stream: CCTVStream;
  onSelect: (stream: CCTVStream) => void;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, stream: CCTVStream) => void;
}

const CCTVCard: React.FC<CCTVCardProps> = ({ stream, onSelect, isFavorited, onToggleFavorite }) => {
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200 relative flex flex-col justify-between"
      onClick={() => onSelect(stream)}
    >
      <div>
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          {/* Status and Actions Container */}
          <div className="absolute inset-x-0 top-0 p-2 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-red-600 text-[10px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 uppercase select-none shadow">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Live
              </div>
              <button
                onClick={(e) => onToggleFavorite(e, stream)}
                className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 border border-white/20"
                title={isFavorited ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              >
                <svg
                  className={`w-4 h-4 transition-colors ${isFavorited ? 'text-amber-400 fill-current' : 'text-white'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.971 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 12.1c-.772-.56-.373-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={`https://picsum.photos/seed/${stream.id}/640/360`}
                alt={stream.title}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                 </div>
              </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={stream.title}>
              {stream.title}
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
              {stream.category}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{stream.location}</span>
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4 pt-0">
        <div className="text-[11px] font-semibold text-blue-600 bg-blue-50/50 px-2 py-1 rounded inline-block">
          {stream.region}
        </div>
      </div>
    </div>
  );
};

export default CCTVCard;
