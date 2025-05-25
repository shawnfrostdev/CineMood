import { NextResponse } from 'next/server';
import { getMovieCredits, getTVShowCredits, getPersonCredits } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
  }
  
  try {
    if (type === 'movie') {
      const data = await getMovieCredits(id);
      return NextResponse.json(data);
    } else if (type === 'tv') {
      const data = await getTVShowCredits(id);
      return NextResponse.json(data);
    } else if (type === 'person') {
      const data = await getPersonCredits(id);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use "movie", "tv", or "person".' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits from TMDB API' }, { status: 500 });
  }
} 