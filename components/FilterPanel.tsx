
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { CustomFilter } from './App';
import { PlusCircleIcon } from './icons';

interface FilterPanelProps {
  onApplyFilter: (p: string) => void;
  isLoading: boolean;
  customFilters: CustomFilter[];
  onApplyCustomFilter: (filter: CustomFilter) => void;
  onCreateFilter: () => void;
  onEditFilter: (filter: CustomFilter) => void;
  onDeleteFilter: (id: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onApplyFilter, 
  isLoading, 
  customFilters, 
  onApplyCustomFilter, 
  onCreateFilter,
  onEditFilter,
  onDeleteFilter
}) => {
  const filterCategories = [
    {
      title: 'Cinematic',
      styles: [
        { name: 'Teal & Orange', p: 'Cinematic teal shadows and warm orange mid-tones.' },
        { name: 'Cinematic Matte', p: 'Moody matte grade with reduced contrast and crushed blacks.' },
        { name: 'Cinematic Moody', p: 'Apply a cinematic look with moody lighting, rich colors, enhanced contrast, and subtle film grain.' },
        { name: 'Cyberpunk', p: 'Neon magenta and cyan glows with futuristic contrast.' },
      ]
    },
    {
      title: 'Vintage',
      styles: [
        { name: 'Vintage Polaroid', p: 'Retro Polaroid look with soft colors and yellow highlights.' },
        { name: 'Leica Noir', p: 'High-contrast, sharp, grainy Leica-style black and white.' },
        { name: 'Harcourt B&W', p: 'Classic 1930s Hollywood studio glamour B&W.' },
        { name: '90s Camcorder', p: 'Low fidelity 90s camcorder look with VHS tracking lines and color bleed.' },
      ]
    },
    {
      title: 'Artistic',
      styles: [
        { name: 'Oil Painting', p: 'Transform the image into a classic oil painting with thick brush strokes.' },
        { name: 'Watercolor', p: 'Soft, flowing watercolor painting style with paper texture.' },
        { name: 'Pencil Sketch', p: 'Detailed graphite pencil sketch with cross-hatching.' },
        { name: 'Pop Art', p: 'Vibrant, high-contrast pop art style with halftone dots.' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
      <div className="flex flex-col gap-6">
        {filterCategories.map(category => (
          <div key={category.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{category.title}</h3>
            <div className="grid grid-cols-2 gap-3">
              {category.styles.map(s => (
                <button 
                  key={s.name} 
                  onClick={() => onApplyFilter(s.p)} 
                  disabled={isLoading}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition group text-center"
                >
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-white">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-purple-400">Custom Filters</h3>
          <button 
            onClick={onCreateFilter}
            disabled={isLoading}
            className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-full transition"
            title="Create Custom Filter"
          >
            <PlusCircleIcon className="w-5 h-5" />
          </button>
        </div>
        
        {customFilters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {customFilters.map(filter => (
              <div key={filter.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <button 
                    onClick={() => onApplyCustomFilter(filter)}
                    disabled={isLoading}
                    className="flex-grow text-left"
                  >
                    <span className="text-sm font-bold text-gray-200">{filter.name}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] text-gray-500 font-mono">B: {filter.settings.brightness}%</span>
                      <span className="text-[9px] text-gray-500 font-mono">C: {filter.settings.contrast}%</span>
                      <span className="text-[9px] text-gray-500 font-mono">S: {filter.settings.saturation}%</span>
                    </div>
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => onEditFilter(filter)} className="p-1.5 text-gray-400 hover:text-white transition">Edit</button>
                    <button onClick={() => onDeleteFilter(filter.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition">Delete</button>
                  </div>
                </div>
                <button 
                  onClick={() => onApplyCustomFilter(filter)}
                  disabled={isLoading}
                  className="w-full py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-200 rounded-xl text-xs font-bold transition"
                >
                  Apply Filter
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
            <p className="text-xs text-gray-500">No custom filters yet. Create your first one!</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-3xl">
        <h4 className="text-xs font-bold text-gray-200 mb-4">Prompt-based Filter</h4>
        <input 
            placeholder="e.g. 'faded 90s neon'..." 
            onKeyDown={e => e.key === 'Enter' && onApplyFilter((e.target as HTMLInputElement).value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
        />
      </div>
    </div>
  );
};

export default FilterPanel;
