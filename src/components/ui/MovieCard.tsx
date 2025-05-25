'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, X, Trash, Check } from 'lucide-react';
import { useListStore } from '@/lib/store';

export type CardType = 'recommend' | 'selection' | 'mylist';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  type: 'list' | 'recommend';
  onAddToList?: (id: string, title: string, posterPath: string, mediaType: 'movie' | 'tv') => void;
  onRemoveFromList?: (id: string) => void;
  onSkip?: (id: string) => void;
  transitionState?: 'fadeOut' | 'placeholder' | 'fadeIn' | null;
}

export default function MovieCard({
  id,
  title,
  posterPath,
  mediaType,
  type,
  onAddToList,
  onRemoveFromList,
  onSkip,
  transitionState
}: MovieCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isInList = useListStore((state) => state.isInList(id));
  
  const imageUrl = posterPath && !imageError
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-poster.jpg';

  const getTransitionClasses = () => {
    switch (transitionState) {
      case 'fadeOut':
        return 'opacity-0 transition-opacity duration-300 ease-out';
      case 'fadeIn':
        return 'opacity-100 transition-opacity duration-300 ease-in';
      default:
        return 'opacity-100';
    }
  };

  return (
    <div 
      className={`relative w-full h-full group ${getTransitionClasses()}`}
    >
      {/* Poster Image */}
      <div className="w-full h-full rounded-lg overflow-hidden bg-[#0C100E]">
        <img
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col justify-between p-4">
        {/* Title */}
        <div className="text-[#F0EDD1] font-medium text-sm line-clamp-2">
          {title}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {type === 'recommend' ? (
            <>
              <button
                onClick={() => onAddToList?.(id, title, posterPath, mediaType)}
                className="w-full py-2 bg-[#436029] hover:bg-[#436029]/80 text-[#F0EDD1] rounded text-sm font-medium transition-colors"
              >
                Add to List
              </button>
              <button
                onClick={() => onSkip?.(id)}
                className="w-full py-2 bg-[#0C100E] hover:bg-[#0C100E]/80 text-[#F0EDD1] rounded text-sm font-medium transition-colors"
              >
                Skip
              </button>
            </>
          ) : (
            <button
              onClick={() => onRemoveFromList?.(id)}
              className="w-full py-2 bg-red-600/80 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 