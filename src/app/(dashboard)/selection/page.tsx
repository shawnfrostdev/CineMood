'use client';

import { useState, useEffect } from 'react';
import Toggle from '@/components/ui/Toggle';
import MovieCard from '@/components/ui/MovieCard';
import CollapsibleSearch from '@/components/ui/CollapsibleSearch';
import RefreshButton from '@/components/ui/RefreshButton';
import { fetchTrendingMovies, fetchTrendingTVShows, searchMovies, searchTVShows } from '@/lib/tmdb-client';
import { useListStore } from '@/lib/store';

const contentTypes = [
  { label: 'Movies', value: 'movies' },
  { label: 'TV Shows', value: 'tvshows' },
];

// Maximum number of items to display
const MAX_DISPLAY_ITEMS = 8;

interface MediaItem {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
}

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match gets highest score
  if (s1 === s2) return 1;
  
  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calculate word match score
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  const wordScore = commonWords.length / Math.max(words1.length, words2.length);
  
  // Calculate character match score
  let charMatches = 0;
  const minLength = Math.min(s1.length, s2.length);
  for (let i = 0; i < minLength; i++) {
    if (s1[i] === s2[i]) charMatches++;
  }
  const charScore = charMatches / Math.max(s1.length, s2.length);
  
  // Combine scores with weights
  return (wordScore * 0.6) + (charScore * 0.4);
}

// Sort media items by relevance to search query
function sortByRelevance(items: MediaItem[], searchQuery: string): MediaItem[] {
  return [...items].sort((a, b) => {
    const titleA = (a.title || a.name || '').toLowerCase();
    const titleB = (b.title || b.name || '').toLowerCase();
    const scoreA = calculateSimilarity(titleA, searchQuery.toLowerCase());
    const scoreB = calculateSimilarity(titleB, searchQuery.toLowerCase());
    return scoreB - scoreA;
  });
}

export default function SelectionPage() {
  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<MediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const addToList = useListStore((state) => state.addToList);
  
  const fetchTrending = async () => {
    if (!isSearching) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch movies if we don't have them yet
        if (trendingMovies.length === 0) {
          const moviesData = await fetchTrendingMovies();
          setTrendingMovies(moviesData.results);
        }
        
        // Fetch TV shows if we don't have them yet
        if (trendingTVShows.length === 0) {
          const tvShowsData = await fetchTrendingTVShows();
          setTrendingTVShows(tvShowsData.results);
        }
      } catch (err) {
        console.error('Error fetching trending content:', err);
        setError('Failed to load trending content. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };
  
  useEffect(() => {
    fetchTrending();
  }, [trendingMovies.length, trendingTVShows.length, isSearching]);

  const handleRefresh = () => {
    if (!isSearching) {
      setIsRefreshing(true);
      setTrendingMovies([]);
      setTrendingTVShows([]);
      fetchTrending();
    }
  };
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const searchData = contentType === 'movies'
        ? await searchMovies(query)
        : await searchTVShows(query);
      
      // Sort results by relevance before setting them
      const sortedResults = sortByRelevance(searchData.results || [], query);
      setSearchResults(sortedResults);
    } catch (err) {
      console.error('Error searching content:', err);
      setError(`Failed to search for "${query}". Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchQuery('');
  };
  
  const handleAddToList = (id: string, title: string, posterPath: string, mediaType: 'movie' | 'tv') => {
    // Ensure we're storing the numeric ID
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid ID for ${title}: ${id}`);
      return;
    }

    addToList({
      id: numericId.toString(),
      title,
      posterPath,
      mediaType,
    });
  };
  
  const handleSkip = (id: string) => {
    console.log(`Skipped ${id}`);
  };
  
  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    if (isSearching && searchQuery) {
      // Re-search with new content type
      handleSearch(searchQuery);
    }
  };

  // Get the data to display based on search state
  const allData = isSearching
    ? searchResults
    : contentType === 'movies' ? trendingMovies : trendingTVShows;
  
  // Only limit items when showing trending content, not search results
  const currentData = isSearching ? allData : allData.slice(0, MAX_DISPLAY_ITEMS);
  const currentMediaType = contentType === 'movies' ? 'movie' : 'tv';
  
  // Generate the title based on the current state
  const pageTitle = isSearching
    ? `Results for "${searchQuery}"`
    : 'Selection';

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-[#F0EDD1]">{pageTitle}</h1>
          <Toggle 
            options={contentTypes} 
            onChange={handleContentTypeChange} 
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-3 border-[#436029] border-t-transparent animate-spin mb-3"></div>
              <p className="text-[#F0EDD1] text-sm">
                {isSearching 
                  ? `Searching for "${searchQuery}"...` 
                  : `Loading trending ${contentType === 'movies' ? 'movies' : 'TV shows'}...`
                }
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[#0C100E] rounded-lg p-4 text-center text-[#F0EDD1]">
            <h2 className="text-lg mb-2">Error</h2>
            <p className="text-[#436029] text-sm">{error}</p>
          </div>
        ) : currentData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 h-full px-1 place-items-center">
            {currentData.map((item) => (
              <div key={item.id} className="w-[200px] h-[300px]">
                <MovieCard
                  id={item.id.toString()}
                  title={item.title || item.name || 'Unknown Title'}
                  posterPath={item.poster_path}
                  mediaType={currentMediaType}
                  type="selection"
                  onAddToList={handleAddToList}
                  onSkip={handleSkip}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0C100E] rounded-lg p-4 text-center text-[#F0EDD1]">
            <h2 className="text-lg mb-2">
              {isSearching ? 'No results found' : 'No content available'}
            </h2>
            <p className="text-[#436029] text-sm">
              {isSearching 
                ? `We couldn't find any ${contentType === 'movies' ? 'movies' : 'TV shows'} matching "${searchQuery}".`
                : `We couldn't find any trending ${contentType === 'movies' ? 'movies' : 'TV shows'} at the moment.`
              }
            </p>
          </div>
        )}
      </div>

      {!isSearching && <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />}
      <CollapsibleSearch
        placeholder={`Search ${contentType === 'movies' ? 'movies' : 'TV shows'}...`}
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
    </div>
  );
} 