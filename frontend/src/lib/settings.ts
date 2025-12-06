'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    watchFolders: string[];
    addFolder: (folder: string) => void;
    removeFolder: (folder: string) => void;
    setFolders: (folders: string[]) => void;
}

export const useSettings = create<SettingsState>()(
    persist(
        (set) => ({
            // Default folders - empty means scan from home directory
            // Users can add folders in Settings
            watchFolders: [],
            addFolder: (folder) => set((state) => ({
                watchFolders: [...state.watchFolders, folder]
            })),
            removeFolder: (folder) => set((state) => ({
                watchFolders: state.watchFolders.filter(f => f !== folder)
            })),
            setFolders: (folders) => set({ watchFolders: folders }),
        }),
        {
            name: 'markdown-library-settings',
        }
    )
);
