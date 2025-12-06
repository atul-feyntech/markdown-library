'use client';

import { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useSettings } from '@/lib/settings';

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function ComposeModal({ isOpen, onClose, onSave }: ComposeModalProps) {
    const { watchFolders } = useSettings();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [folder, setFolder] = useState(watchFolders[0] || '/Users/atulchavan/Repository');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;

        setSaving(true);
        try {
            const filename = title.endsWith('.md') ? title : `${title}.md`;
            const path = `${folder}/${filename}`;

            const res = await fetch('http://localhost:8080/api/file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, content })
            });

            if (res.ok) {
                setTitle('');
                setContent('');
                onSave();
                onClose();
            } else {
                alert('Failed to save file');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving file');
        } finally {
            setSaving(false);
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
            <div className="relative w-full max-w-3xl mx-4 bg-[#1c1c1e] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <FileText size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">New Document</h2>
                            <p className="text-xs text-gray-500">Create a new markdown file</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Document title..."
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-lg font-medium focus:outline-none focus:border-cyan-500/50"
                    />

                    {/* Folder selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Save to:</span>
                        <input
                            type="text"
                            value={folder}
                            onChange={(e) => setFolder(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.06] text-gray-300 text-sm focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    {/* Editor */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your markdown..."
                        className="w-full h-72 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 font-mono text-sm resize-none focus:outline-none focus:border-cyan-500/50"
                    />
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/[0.06] flex justify-between items-center">
                    <p className="text-xs text-gray-600">
                        Supports full markdown syntax
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Document'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
