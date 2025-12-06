'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchFiles } from '@/lib/api';
import { FileEntry } from '@/lib/types';
import { useSettings } from '@/lib/settings';
import { Sidebar } from '@/components/Sidebar';
import { FileRow } from '@/components/FileRow';
import { FileCard } from '@/components/FileCard';
import { FolderBrowser } from '@/components/FolderBrowser';
import { SettingsModal } from '@/components/SettingsModal';
import { ComposeModal } from '@/components/ComposeModal';
import { AssistantPanel } from '@/components/AssistantPanel';
import { Search, LayoutGrid, List, Library } from 'lucide-react';

type SidebarSection = 'library' | 'recent' | 'favorites' | 'playlists';
type ViewStyle = 'list' | 'grid';

export default function Home() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<SidebarSection>('library');
  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const { watchFolders } = useSettings();

  const loadFiles = () => {
    // Pass watch folders to backend, or empty to use default
    fetchFiles(watchFolders.length > 0 ? watchFolders : undefined)
      .then(setFiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
  }, [watchFolders]); // Re-fetch when folders change

  // No longer need client-side folder filtering since backend does it now
  const filteredByFolder = files;

  // Filter by search
  const filteredFiles = useMemo(() => {
    return filteredByFolder.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [filteredByFolder, search]);

  // Sort for recent (by path as proxy for creation - you could add dates later)
  const recentFiles = useMemo(() => {
    return [...filteredFiles].slice(0, 20);
  }, [filteredFiles]);

  const displayFiles = section === 'recent' ? recentFiles : filteredFiles;

  const sectionTitles: Record<SidebarSection, string> = {
    library: 'Library',
    recent: 'Recently Added',
    favorites: 'Favorites',
    playlists: 'All Folders'
  };

  return (
    <div className="flex h-screen bg-[#000000] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentSection={section}
        onSectionChange={setSection}
        onSettingsClick={() => setSettingsOpen(true)}
        onComposeClick={() => setComposeOpen(true)}
        onAssistantClick={() => setAssistantOpen(true)}
        recentCount={recentFiles.length}
        totalCount={filteredByFolder.length}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-2xl font-bold">{sectionTitles[section]}</h1>

          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <button
                onClick={() => setViewStyle('list')}
                className={`p-2 rounded-md transition-colors ${viewStyle === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewStyle('grid')}
                className={`p-2 rounded-md transition-colors ${viewStyle === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-white/[0.06] border border-transparent text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : section === 'playlists' ? (
            /* Folder Browser View - shows ALL files regardless of watch filter */
            <FolderBrowser files={files} />
          ) : displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Library size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-lg">No documents found</p>
              <p className="text-sm mt-2">Try adding folders in Settings</p>
            </div>
          ) : viewStyle === 'list' ? (
            <div className="p-6">
              {/* Column headers */}
              <div className="grid grid-cols-[40px_1fr_200px_100px] gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/[0.06] mb-2">
                <span>#</span>
                <span>Title</span>
                <span>Folder</span>
                <span></span>
              </div>

              {/* File rows */}
              <div className="space-y-1">
                {displayFiles.map((file, i) => (
                  <FileRow key={file.path} file={file} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {displayFiles.map(file => (
                  <FileCard key={file.path} file={file} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSave={loadFiles}
      />
      <AssistantPanel
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}
