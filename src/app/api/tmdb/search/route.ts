import { NextResponse } from 'next/server';
import { searchMovies, searchTVShows } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  try {
    if (type === 'movies') {
      const data = await searchMovies(query);
      return NextResponse.json(data);
    } else if (type === 'tvshows') {
      const data = await searchTVShows(query);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use "movies" or "tvshows".' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error searching TMDB data:', error);
    return NextResponse.json({ error: 'Failed to search data from TMDB API' }, { status: 500 });
  }
} 