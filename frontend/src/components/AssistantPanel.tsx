'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Bot, Send, X, History, Clock, Tag, ChevronDown, ChevronUp,
    Sparkles, Settings, FileText, Zap, Loader2
} from 'lucide-react';
import { useHistory, formatDuration, formatDate, DocumentMeta } from '@/lib/history';
import { chatWithAI, generateSummary, classifyDocument, Message, FREE_MODELS } from '@/lib/openrouter';

interface AssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentDocument?: { path: string; name: string; content: string };
}

type TabType = 'chat' | 'history' | 'insights';

export function AssistantPanel({ isOpen, onClose, currentDocument }: AssistantPanelProps) {
    const [tab, setTab] = useState<TabType>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        apiKey, setApiKey,
        documents, getTopDocuments, getRecentSessions, getTotalReadingTime,
        updateDocument
    } = useHistory();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !apiKey) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Build context with current document if available
            const systemMessage: Message = {
                role: 'system',
                content: currentDocument
                    ? `You are a helpful AI assistant for a markdown library. The user is currently viewing a document called "${currentDocument.name}". Here's the document content:\n\n${currentDocument.content.slice(0, 10000)}\n\nHelp the user with questions about this document or any other queries.`
                    : 'You are a helpful AI assistant for a markdown library. Help the user organize, understand, and work with their markdown documents.'
            };

            const response = await chatWithAI(
                [systemMessage, ...newMessages],
                { apiKey, model: selectedModel }
            );

            setMessages([...newMessages, { role: 'assistant', content: response }]);
        } catch (err: any) {
            setMessages([
                ...newMessages,
                { role: 'assistant', content: `Error: ${err.message}. Please check your API key.` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClassifyDocument = async () => {
        if (!currentDocument || !apiKey) return;

        setLoading(true);
        try {
            const result = await classifyDocument(
                currentDocument.content,
                currentDocument.name,
                { apiKey, model: selectedModel }
            );

            updateDocument(currentDocument.path, {
                category: result.category,
                tags: result.tags,
                classified: true,
            });

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `📂 **Classification Complete**\n\n**Category:** ${result.category}\n**Tags:** ${result.tags.join(', ')}\n**Confidence:** ${(result.confidence * 100).toFixed(0)}%`
                }
            ]);
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `Classification failed: ${err.message}` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!currentDocument || !apiKey) return;

        setLoading(true);
        try {
            const summary = await generateSummary(
                currentDocument.content,
                { apiKey, model: selectedModel }
            );

            updateDocument(currentDocument.path, { summary });

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `📝 **Summary**\n\n${summary}` }
            ]);
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `Summary failed: ${err.message}` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const topDocs = getTopDocuments(5);
    const recentSessions = getRecentSessions(10);
    const totalTime = getTotalReadingTime();

    return (
        <div className="w-96 shrink-0 bg-[#161b22] border-l border-white/10 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-cyan-400" />
                    <span className="font-semibold text-white">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Settings size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Settings */}
            {showSettings && (
                <div className="p-4 border-b border-white/10 bg-black/30 space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                            OpenRouter API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-or-..."
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        />
                        <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            className="text-xs text-cyan-500 hover:underline mt-1 inline-block"
                        >
                            Get API Key →
                        </a>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                            Model
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        >
                            {FREE_MODELS.map(m => (
                                <option key={m} value={m}>{m.split('/')[1]?.split(':')[0] || m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {(['chat', 'history', 'insights'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {tab === 'chat' && (
                    <div className="flex flex-col h-full">
                        {/* Quick Actions */}
                        {currentDocument && (
                            <div className="p-3 border-b border-white/[0.06] flex gap-2">
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={loading || !apiKey}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 text-sm"
                                >
                                    <Sparkles size={14} /> Summarize
                                </button>
                                <button
                                    onClick={handleClassifyDocument}
                                    disabled={loading || !apiKey}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50 text-sm"
                                >
                                    <Tag size={14} /> Classify
                                </button>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {!apiKey && (
                                <div className="text-center py-8">
                                    <Bot size={40} className="mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        Add your OpenRouter API key in settings to start chatting
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-cyan-500/20 text-white'
                                            : 'bg-white/5 text-gray-300'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2 rounded-2xl bg-white/5">
                                        <Loader2 size={16} className="animate-spin text-cyan-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder={apiKey ? "Ask about your documents..." : "Add API key first"}
                                    disabled={!apiKey || loading}
                                    className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!apiKey || loading || !input.trim()}
                                    className="p-2 rounded-xl bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'history' && (
                    <div className="p-4 space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/[0.06]">
                                <div className="text-2xl font-bold text-white">{Object.keys(documents).length}</div>
                                <div className="text-xs text-gray-500">Documents Read</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/[0.06]">
                                <div className="text-2xl font-bold text-cyan-400">{formatDuration(totalTime)}</div>
                                <div className="text-xs text-gray-500">Total Time</div>
                            </div>
                        </div>

                        {/* Recent Sessions */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Recent Sessions
                            </h3>
                            <div className="space-y-2">
                                {recentSessions.length === 0 ? (
                                    <p className="text-sm text-gray-600 text-center py-4">No sessions yet</p>
                                ) : (
                                    recentSessions.map((session, i) => (
                                        <div
                                            key={`${session.path}-${i}`}
                                            className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                                        >
                                            <div className="text-sm text-white truncate">{session.name}</div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} /> {formatDuration(session.durationMs)}
                                                </span>
                                                <span>{formatDate(session.startTime)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'insights' && (
                    <div className="p-4 space-y-4">
                        {/* Top Documents */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Most Read Documents
                            </h3>
                            <div className="space-y-2">
                                {topDocs.length === 0 ? (
                                    <p className="text-sm text-gray-600 text-center py-4">Start reading to see insights</p>
                                ) : (
                                    topDocs.map(doc => (
                                        <div
                                            key={doc.path}
                                            className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white truncate">{doc.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {doc.category && (
                                                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                                                {doc.category}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {formatDuration(doc.totalTimeMs)} • {doc.openCount} opens
                                                        </span>
                                                    </div>
                                                    {doc.tags && doc.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {doc.tags.map(tag => (
                                                                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {doc.summary && (
                                                <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                                                    {doc.summary}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
