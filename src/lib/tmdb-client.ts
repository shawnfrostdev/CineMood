'use client';

export async function fetchTrendingMovies() {
  try {
    const response = await fetch('/api/tmdb?type=movies');
    if (!response.ok) {
      throw new Error(`Failed to fetch trending movies: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
}

export async function fetchTrendingTVShows() {
  try {
    const response = await fetch('/api/tmdb?type=tvshows');
    if (!response.ok) {
      throw new Error(`Failed to fetch trending TV shows: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
}

export async function searchMovies(query: string) {
  try {
    const response = await fetch(`/api/tmdb/search?type=movies&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
}

export async function searchTVShows(query: string) {
  try {
    const response = await fetch(`/api/tmdb/search?type=tvshows&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search TV shows: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw error;
  }
}

export async function fetchMovieRecommendations(movieId: string) {
  try {
    const response = await fetch(`/api/tmdb/recommendations?type=movie&id=${movieId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie recommendations: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
}

export async function fetchTVShowRecommendations(tvId: string) {
  try {
    const response = await fetch(`/api/tmdb/recommendations?type=tv&id=${tvId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show recommendations: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show recommendations:', error);
    throw error;
  }
}

export async function fetchMovieCredits(movieId: string) {
  try {
    const response = await fetch(`/api/tmdb/credits?type=movie&id=${movieId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie credits: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
}

export async function fetchTVShowCredits(tvId: string) {
  try {
    const response = await fetch(`/api/tmdb/credits?type=tv&id=${tvId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show credits: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show credits:', error);
    throw error;
  }
}

export async function fetchPersonCredits(personId: string) {
  try {
    const response = await fetch(`/api/tmdb/credits?type=person&id=${personId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch person credits: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching person credits:', error);
    throw error;
  }
} 