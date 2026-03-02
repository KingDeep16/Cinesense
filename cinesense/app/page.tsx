import { supabase } from '../lib/supabase';
import SearchBar from './SearchBar';
import MovieCard from './moviecard';

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, p?: string }> 
}) {
  // Next.js 15: Await searchParams before use
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const page = parseInt(resolvedParams.p || '1');
  
  const itemsPerPage = 12; // Adjusted for a clean 4-column grid
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch data and count using your PascalCase schema
  let dbQuery = supabase
    .from('Movies')
    .select('*', { count: 'exact' })
    .order('TMDBRating', { ascending: false })
    .range(from, to);

  if (query) {
    dbQuery = dbQuery.ilike('Title', `%${query}%`);
  }

  const { data: movies, count, error } = await dbQuery;

  // Pagination Logic
  const totalCount = count || 0;
  const hasNextPage = to < totalCount - 1; 
  const hasPreviousPage = page > 1;

  if (error) return <div className="text-red-500 p-10 text-center font-mono">Database Error: {error.message}</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          CineSense AI
        </h1>
        <p className="text-slate-400 mb-8 font-medium italic">Discover cinema with intelligence.</p>
        
        <SearchBar />

        {query && (
          <div className="mt-4 animate-fade-in">
            <a href="/" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center justify-center gap-2 underline decoration-blue-500/30 underline-offset-4">
              ← Reset Search
            </a>
            <p className="text-slate-500 mt-2 text-xs uppercase tracking-widest">
              {totalCount} Results for "{query}"
            </p>
          </div>
        )}
      </header>
      
      {/* The Grid: Now using the dynamic MovieCard component */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {movies?.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {/* Empty State */}
      {movies?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-xl font-medium">No movies found matching that title.</p>
        </div>
      )}

      {/* Advanced Pagination Controls */}
      <div className="mt-20 flex justify-center items-center gap-8 pb-20">
        {hasPreviousPage ? (
          <a 
            href={`/?p=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`} 
            className="group px-8 py-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 font-bold shadow-lg"
          >
            <span className="group-hover:-translate-x-1 inline-block transition-transform">←</span> Prev
          </a>
        ) : (
          <span className="px-8 py-3 bg-slate-900/50 text-slate-700 rounded-2xl border border-slate-800/50 cursor-not-allowed font-bold">
            ← Prev
          </span>
        )}
        
        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-slate-600 font-mono text-[10px] uppercase tracking-tighter">Current Page</span>
          <span className="text-blue-400 font-black text-2xl">{page}</span>
        </div>

        {hasNextPage ? (
          <a 
            href={`/?p=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`} 
            className="group px-8 py-3 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-900/40 text-white"
          >
            Next <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
          </a>
        ) : (
          <span className="px-8 py-3 bg-slate-900/50 text-slate-700 rounded-2xl border border-slate-800/50 cursor-not-allowed font-bold">
            End of Line
          </span>
        )}
      </div>
    </main>
  );
}