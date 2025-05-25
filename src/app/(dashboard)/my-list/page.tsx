'use client';

import { useState, useEffect } from 'react';
import Toggle from '@/components/ui/Toggle';
import MovieCard from '@/components/ui/MovieCard';
import { useListStore, MediaItem } from '@/lib/store';

const contentTypes = [
  { label: 'Movies', value: 'movies' },
  { label: 'TV Shows', value: 'tvshows' },
];

export default function MyListPage() {
  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  
  const { savedItems, removeFromList, getFilteredList } = useListStore((state) => ({
    savedItems: state.savedItems,
    removeFromList: state.removeFromList,
    getFilteredList: state.getFilteredList,
  }));
  
  useEffect(() => {
    const mediaType = contentType === 'movies' ? 'movie' : 'tv';
    setFilteredItems(getFilteredList(mediaType));
  }, [contentType, savedItems, getFilteredList]);
  
  const handleRemove = (id: string) => {
    removeFromList(id);
    console.log(`Removed ${id} from list`);
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-[#F0EDD1]">My List</h1>
        <Toggle 
          options={contentTypes} 
          onChange={setContentType} 
        />
      </div>

      <div className="flex-1 overflow-auto pb-4">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 h-full px-1 place-items-center">
            {filteredItems.map((item) => (
              <div className="w-[200px] h-[300px]">
                <MovieCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  posterPath={item.posterPath}
                  mediaType={item.mediaType}
                  type="mylist"
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0C100E] rounded-lg p-4 text-center text-[#F0EDD1]">
            <h2 className="text-lg mb-2">Your list is empty</h2>
            <p className="text-[#436029] text-sm">
              Add some {contentType === 'movies' ? 'movies' : 'TV shows'} to your list from the recommendations or selection pages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 