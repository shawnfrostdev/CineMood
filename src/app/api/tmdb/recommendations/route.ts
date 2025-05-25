import { NextResponse } from 'next/server';
import { getMovieRecommendations, getTVShowRecommendations } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
  }
  
  try {
    if (type === 'movie') {
      const data = await getMovieRecommendations(id);
      return NextResponse.json(data);
    } else if (type === 'tv') {
      const data = await getTVShowRecommendations(id);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use "movie" or "tv".' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations from TMDB API' }, { status: 500 });
  }
} 