import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with the ADMIN key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function GET() {
  // 1. Get 50 movies that are missing posters (let's do small batches to be safe)
  const { data: movies, error } = await supabaseAdmin
    .from('Movies')
    .select('id, Title, ReleaseYear')
    .is('PosterUrl', null)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!movies || movies.length === 0) return NextResponse.json({ message: "No movies left to update!" });

  let updatedCount = 0;

  for (const movie of movies) {
    try {
      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie.Title)}&year=${movie.ReleaseYear}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
      });
      const tmdbData = await res.json();
      const posterPath = tmdbData.results?.[0]?.poster_path;

      if (posterPath) {
        await supabaseAdmin
          .from('movies')
          .update({ PosterUrl: posterPath })
          .eq('id', movie.id);
        updatedCount++;
      }
    } catch (e) {
      console.error(`Failed ${movie.Title}`, e);
    }
  }

  return NextResponse.json({ 
    message: `Successfully updated ${updatedCount} posters!`,
    remaining: "Refresh to do the next 50."
  });
}