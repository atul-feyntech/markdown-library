'use client';

import { LayoutGrid, FolderTree, Layers } from 'lucide-react';

export type ViewMode = 'grid' | 'grouped' | 'explorer';

interface ViewControlsProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

export function ViewControls({ currentMode, onModeChange }: ViewControlsProps) {
    const buttons = [
        { mode: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
        { mode: 'grouped' as const, icon: Layers, label: 'Groups' },
        { mode: 'explorer' as const, icon: FolderTree, label: 'Explorer' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/[0.06]">
            {buttons.map(({ mode, icon: Icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onModeChange(mode)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${currentMode === mode
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                        }
                    `}
                >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
