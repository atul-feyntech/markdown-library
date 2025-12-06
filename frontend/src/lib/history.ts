'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReadingSession {
    path: string;
    name: string;
    startTime: number;
    endTime?: number;
    durationMs: number;
}

export interface DocumentMeta {
    path: string;
    name: string;
    folder: string;
    firstOpened: number;
    lastOpened: number;
    totalTimeMs: number;
    openCount: number;
    summary?: string;
    category?: string;
    tags?: string[];
    classified?: boolean;
}

interface HistoryState {
    // Recent sessions
    sessions: ReadingSession[];

    // Document metadata
    documents: Record<string, DocumentMeta>;

    // Current active session
    activeSession: ReadingSession | null;

    // OpenRouter API key
    apiKey: string;

    // Actions
    startSession: (path: string, name: string) => void;
    endSession: () => void;
    updateDocument: (path: string, updates: Partial<DocumentMeta>) => void;
    setApiKey: (key: string) => void;
    getTopDocuments: (limit?: number) => DocumentMeta[];
    getRecentSessions: (limit?: number) => ReadingSession[];
    getTotalReadingTime: () => number;
}

export const useHistory = create<HistoryState>()(
    persist(
        (set, get) => ({
            sessions: [],
            documents: {},
            activeSession: null,
            apiKey: '',

            startSession: (path, name) => {
                const now = Date.now();

                // End any existing session
                const state = get();
                if (state.activeSession) {
                    const duration = now - state.activeSession.startTime;
                    set(s => ({
                        sessions: [
                            { ...s.activeSession!, endTime: now, durationMs: duration },
                            ...s.sessions.slice(0, 99) // Keep last 100 sessions
                        ]
                    }));
                }

                // Start new session
                set({
                    activeSession: {
                        path,
                        name,
                        startTime: now,
                        durationMs: 0,
                    }
                });

                // Update document meta
                const doc = get().documents[path];
                const folder = path.split('/').slice(0, -1).join('/');

                set(s => ({
                    documents: {
                        ...s.documents,
                        [path]: {
                            path,
                            name,
                            folder,
                            firstOpened: doc?.firstOpened || now,
                            lastOpened: now,
                            totalTimeMs: doc?.totalTimeMs || 0,
                            openCount: (doc?.openCount || 0) + 1,
                            summary: doc?.summary,
                            category: doc?.category,
                            tags: doc?.tags,
                            classified: doc?.classified,
                        }
                    }
                }));
            },

            endSession: () => {
                const state = get();
                if (!state.activeSession) return;

                const now = Date.now();
                const duration = now - state.activeSession.startTime;
                const { path } = state.activeSession;

                // Save session
                set(s => ({
                    sessions: [
                        { ...s.activeSession!, endTime: now, durationMs: duration },
                        ...s.sessions.slice(0, 99)
                    ],
                    activeSession: null,
                }));

                // Update document total time
                const doc = get().documents[path];
                if (doc) {
                    set(s => ({
                        documents: {
                            ...s.documents,
                            [path]: {
                                ...doc,
                                totalTimeMs: doc.totalTimeMs + duration,
                            }
                        }
                    }));
                }
            },

            updateDocument: (path, updates) => {
                set(s => ({
                    documents: {
                        ...s.documents,
                        [path]: {
                            ...s.documents[path],
                            ...updates,
                        }
                    }
                }));
            },

            setApiKey: (key) => set({ apiKey: key }),

            getTopDocuments: (limit = 10) => {
                const docs = Object.values(get().documents);
                return docs.sort((a, b) => b.totalTimeMs - a.totalTimeMs).slice(0, limit);
            },

            getRecentSessions: (limit = 10) => {
                return get().sessions.slice(0, limit);
            },

            getTotalReadingTime: () => {
                return Object.values(get().documents).reduce((sum, d) => sum + d.totalTimeMs, 0);
            },
        }),
        {
            name: 'markdown-library-history',
        }
    )
);

// Format duration helper
export function formatDuration(ms: number): string {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
