/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import type { PromptRecord } from './App';
import { SearchIcon } from './icons';

interface PromptHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: PromptRecord[];
    onSelectPrompt: (prompt: string) => void;
    onClearHistory: () => void;
}

const timeAgo = (timestamp: number): string => {
    if (!timestamp) return '';
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return "just now";
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
    
    return Math.floor(seconds) + " seconds ago";
};

const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({ isOpen, onClose, history, onSelectPrompt, onClearHistory }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            // Reset search term when modal is closed
            setSearchTerm('');
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    
    const filteredHistory = history.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.lastUsed - a.lastUsed); // Ensure it's always sorted by most recent

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99] animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-history-title"
        >
            <div 
                className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-lg text-gray-200 flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 id="prompt-history-title" className="text-xl font-bold">Prompt History</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white transition-colors" aria-label="Close prompt history">&times;</button>
                </div>
                
                <div className="mb-4 flex-shrink-0 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search history..."
                        className="bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full text-base"
                        aria-label="Search prompt history"
                        aria-controls="prompt-history-list"
                    />
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {filteredHistory.length > 0 ? (
                        <ul id="prompt-history-list" className="space-y-2">
                            {filteredHistory.map((item, index) => (
                                <li key={`${item.lastUsed}-${index}`}>
                                    <button
                                        onClick={() => onSelectPrompt(item.prompt)}
                                        className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-gray-300"
                                    >
                                        <p className="line-clamp-2 text-sm font-medium">{item.prompt}</p>
                                        <div className="text-xs text-gray-500 mt-1.5 flex justify-between items-center">
                                            <span>Used: {item.count} time{item.count > 1 ? 's' : ''}</span>
                                            <span>{timeAgo(item.lastUsed)}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>{history.length > 0 ? 'No prompts match your search.' : 'Your recent prompts will appear here.'}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex-shrink-0">
                    <button
                        onClick={onClearHistory}
                        disabled={history.length === 0}
                        className="w-full bg-red-800/50 hover:bg-red-800/80 text-white font-semibold py-2 px-4 rounded-md transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptHistoryModal;