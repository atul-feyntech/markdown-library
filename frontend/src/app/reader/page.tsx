'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchFileContent } from '@/lib/api';
import { useHistory } from '@/lib/history';
import { AssistantPanel } from '@/components/AssistantPanel';
import { ArrowLeft, Save, Edit, Eye, Settings, ChevronUp, Minus, Plus, Sun, Moon, Bot } from 'lucide-react';
import Link from 'next/link';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview').then(mod => mod.default), { ssr: false });

interface ReadingSettings {
    fontSize: number;
    theme: 'dark' | 'light';
    width: 'narrow' | 'medium' | 'wide' | 'full';
}

const defaultSettings: ReadingSettings = {
    fontSize: 18,
    theme: 'dark',
    width: 'medium',
};

function ReaderContent() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);

    const { startSession, endSession } = useHistory();

    useEffect(() => {
        if (path) {
            const fileName = path.split('/').pop() || 'Document';
            startSession(path, fileName);

            fetchFileContent(path).then(c => {
                setContent(c);
                setEditContent(c);
            }).finally(() => setLoading(false));

            // End session when leaving
            return () => endSession();
        }
    }, [path]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSave = async () => {
        if (!path) return;
        setSaving(true);
        try {
            const res = await fetch('http://localhost:8080/api/file', {
                method: 'POST',
                body: JSON.stringify({ path, content: editContent }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setContent(editContent);
                setIsEditing(false);
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const widthClasses = {
        narrow: 'max-w-2xl',
        medium: 'max-w-4xl',
        wide: 'max-w-6xl',
        full: 'max-w-none',
    };

    const fileName = path?.split('/').pop()?.replace('.md', '') || 'Document';

    if (!path) return <div className="p-12 text-center text-gray-500">No file selected</div>;
    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
            <div className="text-cyan-500 animate-pulse">Loading document...</div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" data-color-mode={settings.theme}>
            {/* Main Content Area */}
            <div
                className="flex-1 flex flex-col min-w-0 transition-colors duration-300 overflow-hidden"
                style={{ backgroundColor: settings.theme === 'dark' ? '#0d1117' : '#ffffff' }}
            >
                {/* Header */}
                <header
                    className={`h-14 border-b backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 ${settings.theme === 'dark'
                        ? 'bg-[#0d1117]/90 border-white/10 text-white'
                        : 'bg-white/90 border-gray-200 text-gray-900'
                        }`}
                >
                    <Link
                        href="/"
                        className={`flex items-center transition-colors ${settings.theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        <span className="hidden sm:inline">Library</span>
                    </Link>

                    <h1 className={`text-sm font-medium truncate max-w-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {fileName}
                    </h1>

                    <div className="flex items-center gap-1">
                        {/* Settings toggle */}
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className={`p-2 rounded-lg transition-colors ${settingsOpen ? 'bg-cyan-500/20 text-cyan-400' :
                                settings.theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <Settings size={18} />
                        </button>

                        {/* Edit/View toggle */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-lg transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-cyan-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            {isEditing ? <Eye size={18} /> : <Edit size={18} />}
                        </button>

                        {/* Save button */}
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`p-2 rounded-lg transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-green-400' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <Save size={18} />
                            </button>
                        )}

                        {/* AI Assistant button */}
                        <button
                            onClick={() => setAssistantOpen(!assistantOpen)}
                            className={`p-2 rounded-lg transition-colors ${assistantOpen ? 'bg-cyan-500/20 text-cyan-400' :
                                settings.theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <Bot size={18} />
                        </button>
                    </div>
                </header>

                {/* Settings Panel */}
                {settingsOpen && (
                    <div
                        className={`fixed right-6 top-20 z-50 w-72 rounded-2xl border shadow-2xl overflow-hidden ${settings.theme === 'dark'
                            ? 'bg-[#161b22] border-white/10'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className={`p-4 border-b ${settings.theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                            <span className={`font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Reading Settings
                            </span>
                        </div>
                        <div className="p-4 space-y-5">
                            {/* Font Size */}
                            <div>
                                <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>Font Size</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(14, s.fontSize - 2) }))}
                                        className={`p-2 rounded-lg ${settings.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className={`text-xl font-semibold flex-1 text-center ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {settings.fontSize}px
                                    </span>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(28, s.fontSize + 2) }))}
                                        className={`p-2 rounded-lg ${settings.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Width */}
                            <div>
                                <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>Width</label>
                                <div className="grid grid-cols-4 gap-1">
                                    {(['narrow', 'medium', 'wide', 'full'] as const).map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setSettings(s => ({ ...s, width: w }))}
                                            className={`py-2 rounded-lg text-xs capitalize transition-all ${settings.width === w
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : settings.theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme */}
                            <div>
                                <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>Theme</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, theme: 'dark' }))}
                                        className={`py-3 rounded-lg flex items-center justify-center gap-2 ${settings.theme === 'dark'
                                            ? 'bg-gray-800 text-white border border-cyan-500/30'
                                            : 'bg-gray-800/80 text-gray-300'
                                            }`}
                                    >
                                        <Moon size={14} /> Dark
                                    </button>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, theme: 'light' }))}
                                        className={`py-3 rounded-lg flex items-center justify-center gap-2 ${settings.theme === 'light'
                                            ? 'bg-gray-100 text-gray-900 border border-cyan-500/30'
                                            : 'bg-gray-200/80 text-gray-600'
                                            }`}
                                    >
                                        <Sun size={14} /> Light
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - scrollable area */}
                <div className="flex-1 overflow-y-auto">
                    <main className={`${widthClasses[settings.width]} mx-auto w-full py-8 px-6`}>
                        {isEditing ? (
                            <div data-color-mode={settings.theme}>
                                <MDEditor
                                    value={editContent}
                                    onChange={(val) => setEditContent(val || '')}
                                    height={700}
                                    preview="live"
                                    hideToolbar={false}
                                />
                            </div>
                        ) : (
                            <div
                                data-color-mode={settings.theme}
                                style={{ fontSize: `${settings.fontSize}px` }}
                                className="wmde-markdown-var"
                            >
                                <MDPreview
                                    source={content}
                                    style={{
                                        backgroundColor: 'transparent',
                                        fontSize: `${settings.fontSize}px`,
                                    }}
                                />
                            </div>
                        )}
                    </main>

                    {/* Scroll to top */}
                    {showScrollTop && (
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${settings.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'
                                }`}
                        >
                            <ChevronUp size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* AI Assistant Panel */}
            <AssistantPanel
                isOpen={assistantOpen}
                onClose={() => setAssistantOpen(false)}
                currentDocument={path ? { path, name: fileName, content } : undefined}
            />
        </div>
    );
}

export default function ReaderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                <div className="text-cyan-500 animate-pulse">Loading viewer...</div>
            </div>
        }>
            <ReaderContent />
        </Suspense>
    );
}
