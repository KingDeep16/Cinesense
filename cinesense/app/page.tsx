import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Fetch movies from our Supabase table
  const { data: movies, error } = await supabase
    .from('Movies')
    .select('*')
    .limit(12); // Let's just grab the first 12 for now

  if (error) return <div>Error loading movies: {error.message}</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          CineSense AI
        </h1>
        <p className="text-slate-400">Intelligent Movie Discovery</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies?.map((movie) => (
          <div key={movie.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors">
            {/* If you have poster_urls, we'd put an <img> here */}
            <div className="p-4">
              <h2 className="font-bold text-lg truncate">{movie.title}</h2>
              <p className="text-sm text-slate-400">{movie.release_year} • {movie.runtime}m</p>
              <div className="mt-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {movie.genres}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}