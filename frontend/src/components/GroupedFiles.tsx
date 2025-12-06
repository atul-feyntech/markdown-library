'use client';

import { useState } from 'react';
import { FileEntry } from '@/lib/types';
import { FileCard } from './FileCard';
import { Folder, ChevronDown, ChevronRight } from 'lucide-react';

interface GroupedFilesProps {
    files: FileEntry[];
}

export function GroupedFiles({ files }: GroupedFilesProps) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    // Group files by their immediate parent folder name
    const groups = files.reduce((acc, file) => {
        const folderPath = file.folder || 'Root';
        const displayName = folderPath.split('/').pop() || 'Root';

        if (!acc[displayName]) acc[displayName] = [];
        acc[displayName].push(file);
        return acc;
    }, {} as Record<string, FileEntry[]>);

    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    const toggle = (folder: string) => {
        setCollapsed(prev => ({ ...prev, [folder]: !prev[folder] }));
    };

    return (
        <div className="space-y-4">
            {sortedGroups.map(([folder, groupFiles]) => {
                const isCollapsed = collapsed[folder];

                return (
                    <section
                        key={folder}
                        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-900/60 to-slate-950/80 overflow-hidden"
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggle(folder)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                                    <Folder size={18} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-semibold text-white/90">
                                        {folder}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {groupFiles.length} document{groupFiles.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="text-gray-500">
                                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        {/* Content */}
                        {!isCollapsed && (
                            <div className="px-5 pb-5 pt-2 border-t border-white/[0.04]">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {groupFiles.map(file => (
                                        <FileCard key={file.path} file={file} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
