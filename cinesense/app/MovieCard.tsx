'use client';

import { useState, useEffect } from 'react';

export default function MovieCard({ movie }: { movie: any }) {
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [displayedVerdict, setDisplayedVerdict] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function getPoster() {
      try {
        const response = await fetch(
          `/api/poster?title=${encodeURIComponent(movie.Title)}&year=${movie.ReleaseYear}`
        );
        const data = await response.json();
        setPosterPath(data.posterPath);
      } catch (err) {
        console.error("Poster fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    getPoster();
  }, [movie.Title, movie.ReleaseYear]);

  const getAiVerdict = async () => {
    if (aiVerdict) return;
    setIsAnalyzing(true);
    
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: movie.Title, 
          rating: movie.TMDBRating, 
          description: movie.Description,
          releaseYear: movie.ReleaseYear
        }),
      });
      
      const data = await res.json();
      const text = data.verdict;
      setAiVerdict(text);

      let i = 0;
      setDisplayedVerdict(""); 
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedVerdict((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 25);

    } catch (err) {
      setAiVerdict("AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    // Card container with fixed width to ensure uniform grid sizing
    <div className="group relative bg-slate-800/30 rounded-xl border border-slate-700/40 overflow-hidden hover:border-cyan-500/40 transition-all duration-500 shadow-xl flex flex-col h-full w-full max-w-[240px] mx-auto">
      
      {/* FIXED ASPECT RATIO: This ensures every poster box is exactly the same size */}
      <div className="aspect-[2/3] relative w-full overflow-hidden bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full animate-pulse bg-slate-800 text-slate-500 text-[10px] uppercase tracking-widest">
            Loading...
          </div>
        ) : posterPath ? (
          <img 
            src={`https://image.tmdb.org/t/p/w342${posterPath}`} 
            alt={movie.Title}
            // object-cover ensures the image fills the 2/3 box without stretching
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full bg-slate-900 relative">
             <img 
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=342" 
                className="absolute inset-0 object-cover h-full w-full grayscale opacity-20"
                alt="Cinema Placeholder"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 italic">No Poster</div>
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-bold text-cyan-400">
          ★ {movie.TMDBRating}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-3 flex flex-col flex-grow">
        <h2 className="font-bold text-[13px] leading-tight truncate text-slate-100 group-hover:text-cyan-400 transition-colors">
          {movie.Title}
        </h2>
        <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">
          {movie.ReleaseYear} • {movie.Runtime}m
        </p>

        <button 
          onClick={getAiVerdict}
          disabled={isAnalyzing}
          className="mt-3 w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-[8px] font-black tracking-[0.15em] uppercase text-cyan-300 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? '...' : aiVerdict ? 'Verdict Ready' : 'Get AI Review'}
        </button>

        {displayedVerdict && (
          <div className="mt-2.5 text-[9px] leading-relaxed italic text-cyan-100/80 bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/10">
            "{displayedVerdict}"
            <span className="inline-block w-1 h-2 bg-cyan-400 ml-1 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}