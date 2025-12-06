'use client';

import { useState, useMemo } from 'react';
import { FileEntry } from '@/lib/types';
import { FileRow } from './FileRow';
import { FileCard } from './FileCard';
import { Folder, ChevronRight, ChevronDown, FileText, LayoutGrid, List } from 'lucide-react';

interface FolderBrowserProps {
    files: FileEntry[];
}

interface TreeNode {
    name: string;
    path: string;
    children: Record<string, TreeNode>;
    files: FileEntry[];
}

export function FolderBrowser({ files }: FolderBrowserProps) {
    const [selectedPath, setSelectedPath] = useState<string>('Root');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['Root']));
    const [viewStyle, setViewStyle] = useState<'list' | 'grid'>('list');

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
    const selectedNode = useMemo(() => {
        const find = (node: TreeNode): TreeNode | null => {
            if (node.path === selectedPath) return node;
            for (const child of Object.values(node.children)) {
                const found = find(child);
                if (found) return found;
            }
            return null;
        };
        return find(tree);
    }, [tree, selectedPath]);

    const selectedFiles = selectedNode?.files || [];
    const childFolders = selectedNode ? Object.values(selectedNode.children).sort((a, b) => a.name.localeCompare(b.name)) : [];

    const renderTree = (node: TreeNode, depth = 0) => {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = expandedPaths.has(node.path);
        const isSelected = selectedPath === node.path;
        const fileCount = node.files.length;

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
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }
          `}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />
                    ) : (
                        <div className="w-[14px]" />
                    )}
                    <Folder size={14} className={isSelected ? 'text-cyan-400' : 'text-blue-500'} />
                    <span className="truncate flex-1 text-left">{node.name}</span>
                    {fileCount > 0 && (
                        <span className="text-xs text-gray-600">{fileCount}</span>
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
        <div className="flex h-full">
            {/* Folder Tree Sidebar */}
            <div className="w-72 shrink-0 border-r border-white/[0.06] bg-black/20 flex flex-col">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Folders
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {renderTree(tree)}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sub-header */}
                <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-5 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-white">{selectedNode?.name || 'Root'}</h2>
                        <p className="text-xs text-gray-500">
                            {childFolders.length} folders, {selectedFiles.length} files
                        </p>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <button
                            onClick={() => setViewStyle('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewStyle === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <List size={14} />
                        </button>
                        <button
                            onClick={() => setViewStyle('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewStyle === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={14} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Child folders */}
                    {childFolders.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {childFolders.map(folder => (
                                    <button
                                        key={folder.path}
                                        onClick={() => {
                                            setSelectedPath(folder.path);
                                            setExpandedPaths(prev => new Set([...prev, folder.path]));
                                        }}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                            <Folder size={18} className="text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                                                {folder.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {folder.files.length} files
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files */}
                    {selectedFiles.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h3>
                            {viewStyle === 'list' ? (
                                <div className="space-y-1">
                                    {selectedFiles.map((file, i) => (
                                        <FileRow key={file.path} file={file} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {selectedFiles.map(file => (
                                        <FileCard key={file.path} file={file} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {selectedFiles.length === 0 && childFolders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                            <FileText size={40} strokeWidth={1} className="mb-3 opacity-30" />
                            <p>This folder is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
