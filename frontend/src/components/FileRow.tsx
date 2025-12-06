'use client';

import Link from 'next/link';
import { FileText, Folder, MoreHorizontal, Play } from 'lucide-react';
import { FileEntry } from '@/lib/types';

interface FileRowProps {
    file: FileEntry;
    index: number;
}

export function FileRow({ file, index }: FileRowProps) {
    const encodedPath = encodeURIComponent(file.path);
    const folderName = file.folder?.split('/').pop() || 'Root';
    const displayName = file.name.replace('.md', '');

    return (
        <Link
            href={`/reader?path=${encodedPath}`}
            className="group grid grid-cols-[40px_1fr_200px_100px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
            {/* Index / Play button */}
            <div className="flex items-center justify-center">
                <span className="text-sm text-gray-600 group-hover:hidden">{index + 1}</span>
                <Play size={14} className="text-white hidden group-hover:block fill-current" />
            </div>

            {/* Title */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-gray-400" />
                </div>
                <span className="text-sm font-medium text-white truncate">
                    {displayName}
                </span>
            </div>

            {/* Folder (like Album) */}
            <div className="text-sm text-gray-500 truncate hover:text-white hover:underline">
                {folderName}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                    onClick={(e) => e.preventDefault()}
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </Link>
    );
}
