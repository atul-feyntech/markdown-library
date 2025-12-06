// OpenRouter API integration
// Uses free models with high token limits

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models with high context - ordered by preference
const FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',     // Fast, free, good quality
    'meta-llama/llama-3.3-70b-instruct:free', // High quality, free
    'google/gemma-2-9b-it:free',             // Good quality, free
    'mistralai/mistral-7b-instruct:free',    // Fast, free
];

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenRouterConfig {
    apiKey: string;
    model?: string;
}

export async function chatWithAI(
    messages: Message[],
    config: OpenRouterConfig
): Promise<string> {
    const model = config.model || FREE_MODELS[0];

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Markdown Library',
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 2048,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
        console.error('OpenRouter API error:', error);
        throw error;
    }
}

// Generate summary for a markdown document
export async function generateSummary(
    content: string,
    config: OpenRouterConfig
): Promise<string> {
    const messages: Message[] = [
        {
            role: 'system',
            content: 'You are a helpful assistant that summarizes documents concisely. Provide a 2-3 sentence summary capturing the key points.'
        },
        {
            role: 'user',
            content: `Summarize this document:\n\n${content.slice(0, 8000)}` // Limit to first 8k chars
        }
    ];

    return chatWithAI(messages, config);
}

// Classify/categorize a document
export async function classifyDocument(
    content: string,
    filename: string,
    config: OpenRouterConfig
): Promise<{ category: string; tags: string[]; confidence: number }> {
    const messages: Message[] = [
        {
            role: 'system',
            content: `You are a document classifier. Analyze the document and return ONLY a JSON object with:
- category: one of [Documentation, Notes, Research, Tutorial, Reference, Config, Readme, Other]
- tags: array of 2-5 relevant tags
- confidence: 0.0 to 1.0

Return ONLY valid JSON, no explanation.`
        },
        {
            role: 'user',
            content: `Filename: ${filename}\n\nContent:\n${content.slice(0, 4000)}`
        }
    ];

    const response = await chatWithAI(messages, config);

    try {
        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to parse classification:', e);
    }

    return { category: 'Other', tags: [], confidence: 0 };
}

export { FREE_MODELS };
