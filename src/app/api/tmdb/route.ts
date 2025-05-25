import { NextResponse } from 'next/server';
import { getTrendingMovies, getTrendingTVShows } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    if (type === 'movies') {
      const data = await getTrendingMovies();
      return NextResponse.json(data);
    } else if (type === 'tvshows') {
      const data = await getTrendingTVShows();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use "movies" or "tvshows".' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching TMDB data:', error);
    return NextResponse.json({ error: 'Failed to fetch data from TMDB API' }, { status: 500 });
  }
} 