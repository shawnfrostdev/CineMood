'use client';

import { useState, useEffect } from 'react';
import Toggle from '@/components/ui/Toggle';
import MovieCard from '@/components/ui/MovieCard';
import RefreshButton from '@/components/ui/RefreshButton';
import { useListStore } from '@/lib/store';

const contentTypes = [
  { label: 'Movies', value: 'movies' },
  { label: 'TV Shows', value: 'tvshows' },
];

const GRID_SIZE = 8; // 4x2 grid
const TRANSITION_DURATION = 300; // 300ms for transitions

interface MediaItem {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  isTransitioning?: boolean;
  transitionState?: 'fadeOut' | 'placeholder' | 'fadeIn' | null;
}

export default function RecommendPage() {
  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [movieItems, setMovieItems] = useState<MediaItem[]>([]);
  const [movieQueue, setMovieQueue] = useState<MediaItem[]>([]);
  const [tvItems, setTvItems] = useState<MediaItem[]>([]);
  const [tvQueue, setTvQueue] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [movieError, setMovieError] = useState<string | null>(null);
  const [tvError, setTvError] = useState<string | null>(null);
  
  const { savedItems } = useListStore();

  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    const mediaType = contentType === 'movies' ? 'movie' : 'tv';
    const setItems = mediaType === 'movie' ? setMovieItems : setTvItems;
    const setQueue = mediaType === 'movie' ? setMovieQueue : setTvQueue;
    const setError = mediaType === 'movie' ? setMovieError : setTvError;
    
    try {
      const userItems = savedItems.filter(item => item.mediaType === mediaType);
      
      if (userItems.length === 0) {
        setItems([]);
        setQueue([]);
        setError(`Add some ${mediaType}s to your list to get recommendations`);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/tmdb/actor-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems: userItems,
          mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      
      if (!data.recommendations || data.recommendations.length === 0) {
        setItems([]);
        setQueue([]);
        setError('No recommendations found based on your list');
      } else {
        // Shuffle all recommendations
        const allItems = shuffleArray(data.recommendations).map(item => ({
          ...item,
          isTransitioning: false,
          transitionState: null
        }));

        // Split into displayed and queued items
        setItems(allItems.slice(0, GRID_SIZE));
        setQueue(allItems.slice(GRID_SIZE));
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
      setItems([]);
      setQueue([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Only fetch on initial page load
  useEffect(() => {
    fetchRecommendations();
  }, []); // Empty dependency array - only runs once

  const handleContentTypeChange = (newType: string) => {
    if (newType === contentType) return;
    setContentType(newType);
  };

  const handleRefresh = async () => {
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);
    await fetchRecommendations();
  };

  const replaceItemWithTransition = async (index: number) => {
    const isMovie = contentType === 'movies';
    const items = isMovie ? movieItems : tvItems;
    const setItems = isMovie ? setMovieItems : setTvItems;
    const queue = isMovie ? movieQueue : tvQueue;
    const setQueue = isMovie ? setMovieQueue : setTvQueue;

    // 1. Start fade out
    setItems(prev => 
      prev.map((item, idx) => 
        idx === index 
          ? { ...item, transitionState: 'fadeOut' }
          : item
      )
    );

    // 2. Show placeholder after fade out
    await new Promise(resolve => setTimeout(resolve, TRANSITION_DURATION));
    setItems(prev => 
      prev.map((item, idx) => 
        idx === index 
          ? { ...item, transitionState: 'placeholder' }
          : item
      )
    );

    // 3. Prepare new item
    if (queue.length > 0) {
      const [nextItem, ...remainingQueued] = queue;
      setQueue(remainingQueued);

      // 4. Start fade in of new item
      await new Promise(resolve => setTimeout(resolve, 50));
      setItems(prev => 
        prev.map((item, idx) => 
          idx === index 
            ? { ...nextItem, transitionState: 'fadeIn' }
            : item
        )
      );

      // 5. Clear transition state
      await new Promise(resolve => setTimeout(resolve, TRANSITION_DURATION));
      setItems(prev => 
        prev.map((item, idx) => 
          idx === index 
            ? { ...nextItem, transitionState: null }
            : item
        )
      );
    }
  };

  const handleAddToList = (id: string, title: string, posterPath: string, mediaType: 'movie' | 'tv') => {
    const { addToList } = useListStore.getState();
    addToList({
      id,
      title,
      posterPath,
      mediaType,
    });
    
    const items = mediaType === 'movie' ? movieItems : tvItems;
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      replaceItemWithTransition(itemIndex);
    }
  };
  
  const handleSkip = async (id: string) => {
    const items = contentType === 'movies' ? movieItems : tvItems;
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      replaceItemWithTransition(itemIndex);
    }
  };

  const currentMediaType = contentType === 'movies' ? 'movie' : 'tv';
  const currentItems = contentType === 'movies' ? movieItems : tvItems;
  const currentError = contentType === 'movies' ? movieError : tvError;

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-[#F0EDD1]">Recommendations</h1>
        <Toggle 
          options={contentTypes} 
          onChange={handleContentTypeChange} 
        />
      </div>

      <div className="flex-1 overflow-auto pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-3 border-[#436029] border-t-transparent animate-spin mb-3"></div>
              <p className="text-[#F0EDD1] text-sm">
                {isRefreshing ? 'Refreshing recommendations...' : 'Loading recommendations...'}
              </p>
            </div>
          </div>
        ) : currentError ? (
          <div className="bg-[#0C100E] rounded-lg p-4 text-center text-[#F0EDD1]">
            <h2 className="text-lg mb-2">No recommendations available</h2>
            <p className="text-[#436029] text-sm">{currentError}</p>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 h-full px-1 place-items-center">
            {currentItems.map((item, index) => (
              <div key={item.id} className="w-[200px] h-[300px]">
                {item.transitionState === 'placeholder' ? (
                  <div className="w-full h-full bg-[#0C100E] rounded-lg animate-pulse" />
                ) : (
                  <MovieCard
                    id={item.id}
                    title={item.title || item.name || 'Unknown Title'}
                    posterPath={item.poster_path}
                    mediaType={currentMediaType}
                    type="recommend"
                    onAddToList={handleAddToList}
                    onSkip={handleSkip}
                    transitionState={item.transitionState}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
    </div>
  );
}