'use client';

import { Library, Clock, Heart, FolderOpen, Settings, Plus, Bot } from 'lucide-react';

type SidebarSection = 'library' | 'recent' | 'favorites' | 'playlists';

interface SidebarProps {
    currentSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    onSettingsClick: () => void;
    onComposeClick: () => void;
    onAssistantClick: () => void;
    recentCount?: number;
    totalCount?: number;
}

export function Sidebar({
    currentSection,
    onSectionChange,
    onSettingsClick,
    onComposeClick,
    onAssistantClick,
    recentCount = 0,
    totalCount = 0
}: SidebarProps) {
    const navItems = [
        { id: 'library' as const, icon: Library, label: 'Library', count: totalCount },
        { id: 'recent' as const, icon: Clock, label: 'Recently Added', count: recentCount },
        { id: 'favorites' as const, icon: Heart, label: 'Favorites' },
    ];

    return (
        <aside className="w-64 h-screen bg-[#0d0d0d]/80 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col">
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
                <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Markdown
                </h1>
                <button
                    onClick={onComposeClick}
                    className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                    title="New Document"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
                <div className="space-y-1">
                    {navItems.map(({ id, icon: Icon, label, count }) => (
                        <button
                            key={id}
                            onClick={() => onSectionChange(id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${currentSection === id
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                }
              `}
                        >
                            <Icon size={18} />
                            <span className="flex-1 text-left">{label}</span>
                            {count !== undefined && count > 0 && (
                                <span className="text-xs text-gray-500">{count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Folders section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Folders
                        </span>
                    </div>
                    <button
                        onClick={() => onSectionChange('playlists')}
                        className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${currentSection === 'playlists'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }
            `}
                    >
                        <FolderOpen size={18} />
                        <span>All Folders</span>
                    </button>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.06] space-y-1">
                <button
                    onClick={onAssistantClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all text-sm"
                >
                    <Bot size={18} />
                    <span>AI Assistant</span>
                </button>
                <button
                    onClick={onSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all text-sm"
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
