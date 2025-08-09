
import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import { generateChecklist } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import { SendIcon } from './components/icons';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'aura-intro',
            text: "Hello! I'm Aura, your personal reminder assistant. Tell me about your plans, and I'll help you create a checklist of things to bring. For example, 'I'm going on a weekend beach trip to Miami.'",
            sender: 'bot',
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            const maxHeight = 200; // Max height for textarea in pixels
            textarea.style.height = 'auto'; // Reset height to recalculate
            const scrollHeight = textarea.scrollHeight;
            textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [input]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const auraData = await generateChecklist(input);
            const botMessage: Message = {
                id: Date.now().toString() + '-bot',
                text: '', // Text is unused when data is present
                sender: 'bot',
                data: auraData
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            const errorBotMessage: Message = {
                id: Date.now().toString() + '-error',
                text: `I'm sorry, I seem to have encountered a problem. ${errorMessage}`,
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <header className="p-4 text-center border-b border-gray-700 shadow-lg">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Aura
                </h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    {messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && <TypingIndicator />}
                    <div ref={chatEndRef}></div>
                </div>
            </main>

            <footer className="p-4 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm">
                <form ref={formRef} onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-4">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell me about your plans..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-white placeholder-gray-500 resize-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition duration-300 transform hover:scale-110"
                    >
                        <SendIcon />
                    </button>
                </form>
                {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
            </footer>
        </div>
    );
};

export default App;
