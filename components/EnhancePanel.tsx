/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SparklesIcon, ColorizeIcon, HistoryIcon } from './icons';

interface EnhancePanelProps {
  onApplyEnhancement: (prompt: string) => void;
  isLoading: boolean;
  onShowPreview: (target: HTMLElement, text: string, prompt?: string, type?: 'filter' | 'adjustment') => void;
  onHidePreview: () => void;
  onAddToHistory: (prompt: string) => void;
  onOpenHistory: (setter: (prompt: string) => void) => void;
}

const EnhancePanel: React.FC<EnhancePanelProps> = ({ onApplyEnhancement, isLoading, onShowPreview, onHidePreview, onAddToHistory, onOpenHistory }) => {
  const [upscaleLevel, setUpscaleLevel] = useState<'x2' | 'x4' | null>(null);
  const [upscaleDetails, setUpscaleDetails] = useState('');

  const handleApplyUpscale = () => {
    if (!upscaleLevel) return;
    const upscaleAmount = upscaleLevel === 'x2' ? '2x' : '4x';
    
    let specificInstructions = '';
    if (upscaleDetails.trim()) {
        specificInstructions = upscaleDetails.trim();
        onAddToHistory(specificInstructions);
    }

    const finalPrompt = `Upscale the image ${upscaleAmount}. Enhance fine details and sharpness. ${specificInstructions ? `Specific instructions: "${specificInstructions}"` : ''}. The result must be photorealistic and preserve the original composition and identity.`;

    onApplyEnhancement(finalPrompt);
    setUpscaleLevel(null);
    setUpscaleDetails('');
  };

  if (upscaleLevel) {
    return (
      <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col gap-5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-center text-gray-300">Upscale Details ({upscaleLevel})</h3>
        <p className="text-sm text-center text-gray-400 -mt-3">Optionally, guide the AI on what to focus on.</p>
        <div className="relative">
          <textarea
            value={upscaleDetails}
            onChange={(e) => setUpscaleDetails(e.target.value)}
            placeholder="e.g., 'sharpen the texture of the clothing', 'enhance facial details'"
            className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full h-24 resize-none disabled:cursor-not-allowed disabled:opacity-60 text-base"
            disabled={isLoading}
          />
          <button
            onClick={() => onOpenHistory(setUpscaleDetails)}
            title="Prompt History"
            aria-label="Open upscale prompt history"
            className="absolute right-3 top-3 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
            disabled={isLoading}
          >
            <HistoryIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setUpscaleLevel(null)}
            disabled={isLoading}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-5 rounded-lg transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyUpscale}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-lg transition-all text-sm disabled:bg-blue-800"
          >
            Apply Upscale
          </button>
        </div>
      </div>
    );
  }
  
  const autoEnhancePrompt = 'Perform a corrective automatic enhancement of the image, adjusting color balance, brightness, and contrast. The result should be natural and photorealistic, preserving the subject\'s identity.';
  
  const masterEditPrompt = 'Perform an advanced, professional-style master edit. Improve color, tone, and lighting to enhance the mood and three-dimensional depth. The result should be a high-end, natural photograph that preserves the subject\'s identity.';
  
  const colorizePrompt = 'Colorize this black and white image with realistic, natural-looking colors. The result must be photorealistic and preserve the subject\'s identity.';

  const restoreFacePrompt = 'Perform a high-fidelity photographic face restoration. Improve sharpness, reduce noise, and correct minor camera-induced flaws like red-eye or distortion. The result must be a natural, high-quality portrait that preserves the person\'s original identity.';

  const enhancements = [
    { 
      name: 'Auto Enhance',
      prompt: autoEnhancePrompt,
      action: () => onApplyEnhancement(autoEnhancePrompt),
      style: 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40 disabled:from-blue-800 disabled:to-blue-700'
    },
    { 
      name: 'Upscale x2',
      prompt: `Upscale image 2x, enhancing details and sharpness for higher quality.`,
      action: () => setUpscaleLevel('x2'),
      style: 'bg-gradient-to-br from-green-600 to-green-500 shadow-green-500/20 hover:shadow-green-500/40 disabled:from-green-800 disabled:to-green-700'
    },
    { 
      name: 'Upscale x4',
      prompt: `Upscale image 4x, enhancing details and sharpness for higher quality.`,
      action: () => setUpscaleLevel('x4'),
      style: 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-purple-500/20 hover:shadow-purple-500/40 disabled:from-purple-800 disabled:to-purple-700'
    },
  ];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col gap-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">AI Image Enhancement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enhancements.map(enhancement => (
          <button
            key={enhancement.name}
            onClick={enhancement.action}
            onMouseEnter={(e) => onShowPreview(e.currentTarget, enhancement.name, enhancement.prompt, 'adjustment')}
            onMouseLeave={onHidePreview}
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none ${enhancement.style}`}
          >
            {enhancement.name}
          </button>
        ))}
      </div>
      
      <div className="border-t border-gray-700/50 my-2"></div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2 justify-center mb-3"><SparklesIcon className="w-5 h-5 text-amber-400" /> One-Click Magic</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onApplyEnhancement(masterEditPrompt)}
            onMouseEnter={(e) => onShowPreview(e.currentTarget, 'AI Master Edit', masterEditPrompt, 'adjustment')}
            onMouseLeave={onHidePreview}
            disabled={isLoading}
            className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-amber-700 disabled:to-orange-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
          >
            AI Master Edit
          </button>
          <button
            onClick={() => onApplyEnhancement(restoreFacePrompt)}
            onMouseEnter={(e) => onShowPreview(e.currentTarget, 'Restore Face', restoreFacePrompt, 'adjustment')}
            onMouseLeave={onHidePreview}
            disabled={isLoading}
            className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br from-teal-600 to-teal-500 shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-teal-800 disabled:to-teal-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
          >
            Restore Face
          </button>
          <button
              onClick={() => onApplyEnhancement(colorizePrompt)}
              onMouseEnter={(e) => onShowPreview(e.currentTarget, 'Colorize B&W Image', colorizePrompt, 'adjustment')}
              onMouseLeave={onHidePreview}
              disabled={isLoading}
              className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-indigo-700 disabled:to-violet-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <ColorizeIcon className="w-5 h-5" /> Colorize B&W Image
            </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancePanel;