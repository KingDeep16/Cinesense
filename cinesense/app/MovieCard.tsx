'use client';

import { useState, useEffect } from 'react';

export default function MovieCard({ movie }: { movie: any }) {
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPoster() {
      try {
        // We use your TMDB token to find the poster path
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie.Title)}&year=${movie.ReleaseYear}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        setPosterPath(data.results?.[0]?.poster_path || null);
      } catch (err) {
        console.error("Poster fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    getPoster();
  }, [movie.Title, movie.ReleaseYear]);

  return (
    <div className="group relative bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
      <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full animate-pulse bg-slate-800 text-slate-500 text-xs">
            Searching TMDB...
          </div>
        ) : posterPath ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
            alt={movie.Title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600 italic text-xs p-4 text-center">
            No Poster Found
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h2 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">{movie.Title}</h2>
        <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
          <span>{movie.ReleaseYear}</span>
          <span className="text-blue-400 font-bold flex items-center gap-1">★ {movie.TMDBRating}</span>
        </div>
      </div>
    </div>
  );
}