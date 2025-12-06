'use client';

import { Type, AlignJustify, Sun, Moon, Minus, Plus, BookOpen } from 'lucide-react';

export interface ReadingSettings {
    fontSize: number;        // 14-24
    lineHeight: number;      // 1.5-2.5
    maxWidth: 'narrow' | 'medium' | 'wide' | 'full';
    theme: 'dark' | 'sepia' | 'light';
    fontFamily: 'sans' | 'serif' | 'mono';
}

interface ReaderSettingsProps {
    settings: ReadingSettings;
    onChange: (settings: ReadingSettings) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const defaultSettings: ReadingSettings = {
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 'medium',
    theme: 'dark',
    fontFamily: 'serif',
};

export function ReaderSettings({ settings, onChange, isOpen, onClose }: ReaderSettingsProps) {
    if (!isOpen) return null;

    const update = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="fixed right-6 top-20 z-50 w-80 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-cyan-400" />
                    <span className="font-semibold text-white">Reading View</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white text-sm"
                >
                    Done
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Font Size */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                        Font Size
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => update('fontSize', Math.max(14, settings.fontSize - 2))}
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-2xl font-semibold text-white">{settings.fontSize}</span>
                            <span className="text-gray-500 text-sm ml-1">px</span>
                        </div>
                        <button
                            onClick={() => update('fontSize', Math.min(28, settings.fontSize + 2))}
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Line Height */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                        Line Spacing
                    </label>
                    <div className="flex gap-2">
                        {[1.5, 1.8, 2.0, 2.2].map(h => (
                            <button
                                key={h}
                                onClick={() => update('lineHeight', h)}
                                className={`flex-1 py-2 rounded-lg text-sm transition-all ${settings.lineHeight === h
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/[0.04] text-gray-400 hover:text-white border border-transparent'
                                    }`}
                            >
                                {h}×
                            </button>
                        ))}
                    </div>
                </div>

                {/* Max Width */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                        Content Width
                    </label>
                    <div className="flex gap-2">
                        {(['narrow', 'medium', 'wide', 'full'] as const).map(w => (
                            <button
                                key={w}
                                onClick={() => update('maxWidth', w)}
                                className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${settings.maxWidth === w
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/[0.04] text-gray-400 hover:text-white border border-transparent'
                                    }`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Family */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                        Font
                    </label>
                    <div className="flex gap-2">
                        {([
                            { id: 'sans', label: 'Sans', sample: 'Aa' },
                            { id: 'serif', label: 'Serif', sample: 'Aa' },
                            { id: 'mono', label: 'Mono', sample: 'Aa' },
                        ] as const).map(f => (
                            <button
                                key={f.id}
                                onClick={() => update('fontFamily', f.id)}
                                className={`flex-1 py-3 rounded-lg transition-all ${settings.fontFamily === f.id
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/[0.04] text-gray-400 hover:text-white border border-transparent'
                                    }`}
                            >
                                <span className={`text-lg ${f.id === 'serif' ? 'font-serif' : f.id === 'mono' ? 'font-mono' : 'font-sans'}`}>
                                    {f.sample}
                                </span>
                                <span className="block text-xs mt-1 opacity-60">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                        Theme
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => update('theme', 'dark')}
                            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${settings.theme === 'dark'
                                    ? 'bg-gray-800 text-white border border-cyan-500/30'
                                    : 'bg-gray-800/50 text-gray-400 border border-transparent'
                                }`}
                        >
                            <Moon size={16} />
                            <span className="text-sm">Dark</span>
                        </button>
                        <button
                            onClick={() => update('theme', 'sepia')}
                            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${settings.theme === 'sepia'
                                    ? 'bg-amber-900/40 text-amber-200 border border-amber-500/30'
                                    : 'bg-amber-900/20 text-gray-400 border border-transparent'
                                }`}
                        >
                            <BookOpen size={16} />
                            <span className="text-sm">Sepia</span>
                        </button>
                        <button
                            onClick={() => update('theme', 'light')}
                            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${settings.theme === 'light'
                                    ? 'bg-gray-100 text-gray-900 border border-cyan-500/30'
                                    : 'bg-gray-200/20 text-gray-400 border border-transparent'
                                }`}
                        >
                            <Sun size={16} />
                            <span className="text-sm">Light</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
