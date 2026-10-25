
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { BrainIcon } from './icons';

interface ThinkingModePanelProps {
  onProcess: (prompt: string) => void;
  isLoading: boolean;
  response: string | null;
}

const ThinkingModePanel: React.FC<ThinkingModePanelProps> = ({ onProcess, isLoading, response }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim() && !isLoading) {
            onProcess(prompt.trim());
        }
    };

    return (
        <div className="w-full bg-gray-800/50 rounded-lg p-6 flex flex-col gap-5">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 flex items-center justify-center gap-2">
                    <BrainIcon className="w-6 h-6 text-purple-400" />
                    Thinking Mode
                </h3>
                {/* Updated model name in description text to Gemini 3 Pro */}
                <p className="text-sm text-gray-400 mt-1">For your most complex queries. Powered by Gemini 3 Pro.</p>
            </div>

            <div className="flex flex-col gap-3">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a complex prompt, like 'Analyze the recurring visual motifs in Wes Anderson's filmography and explain their narrative significance.' or 'Write a short story in the style of Edgar Allan Poe about an AI that becomes self-aware.'"
                    className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base resize-y min-h-[150px]"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-purple-800 disabled:to-purple-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Thinking...' : 'Submit'}
                </button>
            </div>

            {response && !isLoading && (
                <div className="mt-4 p-4 bg-black/20 border border-gray-700 rounded-lg animate-fade-in max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-gray-300 mb-2">Response:</h4>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default ThinkingModePanel;
