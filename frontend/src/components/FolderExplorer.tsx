'use client';

import { useState, useMemo } from 'react';
import { FileEntry } from '@/lib/types';
import { FileCard } from './FileCard';
import { Folder, ChevronRight, ChevronDown, FileText } from 'lucide-react';

interface FolderExplorerProps {
    files: FileEntry[];
}

interface TreeNode {
    name: string;
    path: string;
    children: Record<string, TreeNode>;
    files: FileEntry[];
}

export function FolderExplorer({ files }: FolderExplorerProps) {
    const [selectedPath, setSelectedPath] = useState<string>('Root');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['Root']));

    // Build folder tree
    const tree = useMemo(() => {
        const root: TreeNode = { name: 'Root', path: 'Root', children: {}, files: [] };

        files.forEach(file => {
            const parts = file.folder ? file.folder.split('/').filter(Boolean) : [];
            let current = root;
            let currentPath = 'Root';

            if (parts.length === 0) {
                current.files.push(file);
                return;
            }

            for (const part of parts) {
                currentPath += `/${part}`;
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        path: currentPath,
                        children: {},
                        files: []
                    };
                }
                current = current.children[part];
            }
            current.files.push(file);
        });
        return root;
    }, [files]);

    const toggleExpand = (path: string) => {
        const next = new Set(expandedPaths);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        setExpandedPaths(next);
    };

    // Find files for selected path
    const selectedFiles = useMemo(() => {
        const find = (node: TreeNode): TreeNode | null => {
            if (node.path === selectedPath) return node;
            for (const child of Object.values(node.children)) {
                const found = find(child);
                if (found) return found;
            }
            return null;
        };
        return find(tree)?.files || [];
    }, [tree, selectedPath]);

    const renderTree = (node: TreeNode, depth = 0) => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = expandedPaths.has(node.path);
        const isSelected = selectedPath === node.path;

        return (
            <div key={node.path}>
                <button
                    onClick={() => {
                        setSelectedPath(node.path);
                        if (hasChildren) toggleExpand(node.path);
                    }}
                    className={`
                        w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all
                        ${isSelected
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }
                    `}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <div className="w-[14px]" />
                    )}
                    <Folder size={14} className={isSelected ? 'text-cyan-400' : 'text-blue-500'} />
                    <span className="truncate">{node.name}</span>
                    {node.files.length > 0 && (
                        <span className="ml-auto text-xs text-gray-600">{node.files.length}</span>
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div>
                        {Object.values(node.children)
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(child => renderTree(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-220px)]">
            {/* Sidebar */}
            <div className="w-72 shrink-0 rounded-2xl border border-white/[0.06] bg-slate-900/60 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/[0.06]">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Folders</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {renderTree(tree)}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 rounded-2xl border border-white/[0.06] bg-slate-900/40 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">{selectedPath.split('/').pop()}</h2>
                        <p className="text-sm text-gray-500">{selectedFiles.length} files</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {selectedFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600">
                            <FileText size={48} strokeWidth={1} className="mb-4 opacity-30" />
                            <p>No files in this folder</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedFiles.map(file => (
                                <FileCard key={file.path} file={file} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
