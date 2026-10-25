/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { HistoryIcon } from './icons';

interface ExpandPanelProps {
  onApplyEnhancement: (prompt: string, customPrompt?: string) => void;
  isLoading: boolean;
  onOpenHistory: (setter: (prompt: string) => void) => void;
}

const ExpandPanel: React.FC<ExpandPanelProps> = ({ onApplyEnhancement, isLoading, onOpenHistory }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  
  const defaultExpandPrompt = "You are an AI photo expansion expert. Your task is to expand the borders of this image, logically and realistically generating what might exist just outside the original frame. Maintain the original image's style, lighting, and perspective. The transition between the original image and the expanded area must be seamless. The final image should be larger than the original but contain the original image perfectly in its center.";

  const handleApply = () => {
    onApplyEnhancement(defaultExpandPrompt, customPrompt.trim());
  };

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-6 flex flex-col gap-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-300">AI Image Expansion</h3>
        <p className="text-sm text-gray-400 mt-1">Imagine what's beyond the frame. AI will expand the scene naturally.</p>
      </div>
      
      <div className="flex flex-col gap-3">
        <label htmlFor="expand-prompt" className="text-sm font-medium text-gray-400">
          Guide the expansion (optional)
        </label>
        <div className="relative">
          <textarea
            id="expand-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'a bustling city street with cars', 'a calm beach with waves'"
            className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={() => onOpenHistory(setCustomPrompt)}
            title="Prompt History"
            aria-label="Open prompt history"
            className="absolute right-3 top-3 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
            disabled={isLoading}
          >
            <HistoryIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mt-1">
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br from-teal-600 to-teal-500 shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-teal-800 disabled:to-teal-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          {customPrompt.trim() ? 'Expand with Guidance' : 'Expand Image'}
        </button>
      </div>
    </div>
  );
};

export default ExpandPanel;