'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MediaItem {
  id: string;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
}

interface ListStore {
  savedItems: MediaItem[];
  addToList: (item: MediaItem) => void;
  removeFromList: (id: string) => void;
  isInList: (id: string) => boolean;
  getFilteredList: (mediaType: 'movie' | 'tv') => MediaItem[];
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      savedItems: [],
      
      addToList: (item) => {
        const { savedItems } = get();
        if (!savedItems.some((savedItem) => savedItem.id === item.id)) {
          set({ savedItems: [...savedItems, item] });
        }
      },
      
      removeFromList: (id) => {
        const { savedItems } = get();
        set({ savedItems: savedItems.filter((item) => item.id !== id) });
      },
      
      isInList: (id) => {
        const { savedItems } = get();
        return savedItems.some((item) => item.id === id);
      },
      
      getFilteredList: (mediaType) => {
        const { savedItems } = get();
        return savedItems.filter((item) => item.mediaType === mediaType);
      },
    }),
    {
      name: 'cinemood-list',
    }
  )
); 