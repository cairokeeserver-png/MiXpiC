
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface AvatarPanelProps {
  onGenerateAvatar: (prompt: string) => void;
  isLoading: boolean;
}

const AvatarPanel: React.FC<AvatarPanelProps> = ({ onGenerateAvatar, isLoading }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const avatarStyles = [
    { name: '3D Pixar Style', p: '3D animated character in Pixar/Disney style. High detail, expressive features, soft lighting.' },
    { name: 'Cyberpunk Warrior', p: 'Futuristic cyberpunk warrior with neon accents, cybernetic enhancements, and moody lighting.' },
    { name: 'Anime Character', p: 'High-quality modern anime style character. Sharp lines, vibrant colors, expressive eyes.' },
    { name: 'Renaissance Oil', p: 'Classic Renaissance oil painting. Rich textures, dramatic chiaroscuro lighting, masterwork style.' },
    { name: 'Grand Theft Auto', p: 'GTA 5 loading screen style digital illustration. High contrast, cel-shaded, stylized realism.' },
    { name: 'Futuristic Hologram', p: 'Ethereal futuristic hologram avatar. Glowing cyan energy, digital interference patterns, transparent effects.' },
    { name: 'Claymation', p: 'Handcrafted claymation style character. Visible fingerprints, stop-motion aesthetic, tactile textures.' },
    { name: 'Vector Art', p: 'Minimalist flat vector art illustration. Clean shapes, limited color palette, modern design.' },
  ];

  const handleApply = (prompt: string) => {
    onGenerateAvatar(prompt);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-indigo-400">AI Avatar Creator</h3>
        <p className="text-xs text-gray-500 mt-1">Transform yourself into any character.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {avatarStyles.map(s => (
          <button 
            key={s.name} 
            onClick={() => handleApply(s.p)} 
            disabled={isLoading}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition group text-center active:scale-95"
          >
            <span className="text-[11px] font-bold text-gray-400 group-hover:text-white">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-6 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-bold text-gray-200 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
            Custom Avatar Style
        </h4>
        <textarea 
            placeholder="Describe your desired avatar... e.g. 'as a superhero in a gold suit' or 'as a vintage comic book character'"
            className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(customPrompt.trim()) handleApply(customPrompt);
                    setCustomPrompt('');
                }
            }}
        />
        <button 
            onClick={() => handleApply(customPrompt)}
            disabled={isLoading || !customPrompt.trim()}
            className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-20"
        >
            Generate Custom
        </button>
        <p className="text-[10px] text-gray-500 mt-3 text-center">Identity is preserved during transformation.</p>
      </div>
    </div>
  );
};

export default AvatarPanel;
