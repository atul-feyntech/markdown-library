'use client';

import { useState } from 'react';
import { X, FolderPlus, Trash2, Settings } from 'lucide-react';
import { useSettings } from '@/lib/settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { watchFolders, addFolder, removeFolder } = useSettings();
    const [newFolder, setNewFolder] = useState('');

    if (!isOpen) return null;

    const handleAdd = () => {
        if (newFolder.trim()) {
            addFolder(newFolder.trim());
            setNewFolder('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-[#1c1c1e] rounded-2xl border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <Settings size={20} className="text-gray-400" />
                        <h2 className="text-lg font-semibold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                    {/* Watch Folders */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Watch Folders
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                            Only show markdown files from these folders. Leave empty to show all.
                        </p>

                        {/* Add folder input */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newFolder}
                                onChange={(e) => setNewFolder(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="/Users/yourname/Documents"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                            >
                                <FolderPlus size={18} />
                            </button>
                        </div>

                        {/* Folder list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {watchFolders.length === 0 ? (
                                <p className="text-sm text-gray-600 text-center py-4">
                                    No folders added. Showing all files.
                                </p>
                            ) : (
                                watchFolders.map((folder) => (
                                    <div
                                        key={folder}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/30 border border-white/[0.04]"
                                    >
                                        <span className="text-sm text-gray-300 truncate">{folder}</span>
                                        <button
                                            onClick={() => removeFolder(folder)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/[0.06] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
