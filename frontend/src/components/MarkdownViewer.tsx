'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

interface MarkdownViewerProps {
    content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            fontFamily: 'inherit',
        });
    }, []);

    useEffect(() => {
        mermaid.run({ querySelector: '.mermaid' });
    }, [content]);

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom heading styles
                    h1: ({ children }) => (
                        <h1 className="text-4xl font-bold mt-8 mb-6 pb-4 border-b border-current/10">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-10 mb-4">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-8 mb-3">
                            {children}
                        </h3>
                    ),
                    // Paragraphs - use div to avoid hydration errors with nested pre/code
                    p: ({ children }) => (
                        <div className="mb-6 leading-relaxed">
                            {children}
                        </div>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="my-4 ml-6 list-disc space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-4 ml-6 list-decimal space-y-2">
                            {children}
                        </ol>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-cyan-500/50 pl-6 py-2 my-6 italic opacity-90">
                            {children}
                        </blockquote>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    // Code blocks
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');

                        if (!inline && match && match[1] === 'mermaid') {
                            return (
                                <div className="mermaid my-8 flex justify-center">
                                    {String(children).replace(/\n$/, '')}
                                </div>
                            );
                        }

                        if (inline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[0.9em]" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <pre className="my-6 p-4 rounded-xl bg-black/40 border border-white/10 overflow-x-auto">
                                <code className={`font-mono text-sm ${className}`} {...props}>
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    // Tables
                    table: ({ children }) => (
                        <div className="my-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-white/10 px-4 py-2 bg-white/5 text-left font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-white/10 px-4 py-2">
                            {children}
                        </td>
                    ),
                    // Horizontal rule
                    hr: () => (
                        <hr className="my-12 border-t border-current/10" />
                    ),
                    // Images
                    img: ({ src, alt }) => (
                        <figure className="my-8">
                            <img
                                src={src}
                                alt={alt || ''}
                                className="rounded-xl max-w-full mx-auto shadow-lg"
                            />
                            {alt && (
                                <figcaption className="text-center text-sm opacity-60 mt-3">
                                    {alt}
                                </figcaption>
                            )}
                        </figure>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
