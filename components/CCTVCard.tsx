
import React from 'react';
import { CCTVStream } from '../types';

interface CCTVCardProps {
  stream: CCTVStream;
  onSelect: (stream: CCTVStream) => void;
}

const CCTVCard: React.FC<CCTVCardProps> = ({ stream, onSelect }) => {
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200"
      onClick={() => onSelect(stream)}
    >
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {/* We use a static thumbnail or simple placeholder to mimic CCTV view before play */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-[10px] font-bold text-white px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Live
            </div>
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
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{stream.title}</h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{stream.category}</span>
        </div>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {stream.location}
        </p>
        <div className="mt-3 text-xs font-medium text-slate-400">
          {stream.region}
        </div>
      </div>
    </div>
  );
};

export default CCTVCard;
