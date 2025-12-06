'use client';

import Link from 'next/link';
import { FileText, Folder } from 'lucide-react';
import { FileEntry } from '@/lib/types';

export function FileCard({ file }: { file: FileEntry }) {
    const encodedPath = encodeURIComponent(file.path);
    const folderName = file.folder?.split('/').pop() || 'Root';

    return (
        <Link
            href={`/reader?path=${encodedPath}`}
            className="group relative flex flex-col p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10"
        >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center w-11 h-11 mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                <FileText size={18} strokeWidth={2} />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-base font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug mb-2">
                {file.name.replace('.md', '')}
            </h3>

            {/* Folder badge */}
            <div className="relative z-10 flex items-center mt-auto pt-3 border-t border-white/5">
                <div className="flex items-center text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    <Folder size={12} className="mr-1.5 text-cyan-600" />
                    <span className="truncate max-w-[180px]">{folderName}</span>
                </div>
            </div>
        </Link>
    );
}
