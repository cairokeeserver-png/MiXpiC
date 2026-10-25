/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { HistoryIcon } from './icons';

interface GeneratePanelProps {
  onGenerateImage: (prompt: string) => void;
  isLoading: boolean;
  onOpenHistory: (setter: (prompt:string) => void) => void;
}

const GeneratePanel: React.FC<GeneratePanelProps> = ({ onGenerateImage, isLoading, onOpenHistory }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = () => {
        if (prompt.trim()) {
            onGenerateImage(prompt.trim());
        }
    };

    return (
        <div className="w-full bg-gray-800/50 rounded-lg p-6 flex flex-col gap-5">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300">Generate Image</h3>
                <p className="text-sm text-gray-400 mt-1">Describe anything you can imagine.</p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'a photorealistic portrait of an astronaut on a horse on Mars'"
                        className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base pr-12 resize-y min-h-[120px]"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => onOpenHistory(setPrompt)}
                        title="Prompt History"
                        aria-label="Open prompt history"
                        className="absolute right-3 top-3 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
                        disabled={isLoading}
                    >
                        <HistoryIcon className="w-6 h-6" />
                    </button>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                >
                    Generate
                </button>
            </div>
        </div>
    );
};

export default GeneratePanel;