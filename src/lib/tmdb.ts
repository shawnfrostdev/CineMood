'use server';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY environment variable is not set');
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds timeout

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const url = `${TMDB_API_URL}${endpoint}?${queryParams}`;
  
  try {
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching from TMDB (${endpoint}):`, error);
    throw error;
  }
}

export async function getTrendingMovies(page: number = 1) {
  try {
    return await fetchTMDB('/trending/movie/week', { page: page.toString() });
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return { results: [] };
  }
}

export async function getTrendingTVShows(page: number = 1) {
  try {
    return await fetchTMDB('/trending/tv/week', { page: page.toString() });
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return { results: [] };
  }
}

export async function getMovieById(id: string) {
  try {
    return await fetchTMDB(`/movie/${id}`);
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error);
    return null;
  }
}

export async function getTVShowById(id: string) {
  try {
    return await fetchTMDB(`/tv/${id}`);
  } catch (error) {
    console.error(`Error fetching TV show ${id}:`, error);
    return null;
  }
}

export async function searchMovies(query: string, page: number = 1) {
  try {
    return await fetchTMDB('/search/movie', { query, page: page.toString() });
  } catch (error) {
    console.error('Error searching movies:', error);
    return { results: [] };
  }
}

export async function searchTVShows(query: string, page: number = 1) {
  try {
    return await fetchTMDB('/search/tv', { query, page: page.toString() });
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return { results: [] };
  }
}

export async function getMovieRecommendations(movieId: string) {
  try {
    return await fetchTMDB(`/movie/${movieId}/recommendations`);
  } catch (error) {
    console.error(`Error fetching movie recommendations for ${movieId}:`, error);
    return { results: [] };
  }
}

export async function getTVShowRecommendations(tvId: string) {
  try {
    return await fetchTMDB(`/tv/${tvId}/recommendations`);
  } catch (error) {
    console.error(`Error fetching TV show recommendations for ${tvId}:`, error);
    return { results: [] };
  }
}

export async function getMovieCredits(movieId: string) {
  if (!movieId || isNaN(Number(movieId))) {
    console.warn(`Invalid movie ID: ${movieId}`);
    return null;
  }

  try {
    return await fetchTMDB(`/movie/${movieId}/credits`);
  } catch (error) {
    console.error(`Error fetching movie credits for ${movieId}:`, error);
    return null;
  }
}

export async function getTVShowCredits(tvId: string) {
  if (!tvId || isNaN(Number(tvId))) {
    console.warn(`Invalid TV show ID: ${tvId}`);
    return null;
  }

  try {
    return await fetchTMDB(`/tv/${tvId}/credits`);
  } catch (error) {
    console.error(`Error fetching TV show credits for ${tvId}:`, error);
    return null;
  }
}

export async function getPersonCredits(personId: string) {
  if (!personId || isNaN(Number(personId))) {
    console.warn(`Invalid person ID: ${personId}`);
    return null;
  }

  try {
    const data = await fetchTMDB(`/person/${personId}/combined_credits`);
    
    // Filter out items without required fields
    if (data && data.cast) {
      data.cast = data.cast.filter(item => 
        item && 
        item.id && 
        item.media_type && 
        (item.title || item.name) && 
        item.poster_path && 
        item.vote_count > 0
      );
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching person credits for ${personId}:`, error);
    return null;
  }
} 