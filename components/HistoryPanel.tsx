
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState, useRef } from 'react';
import { RedoIcon, UndoIcon, CheckCircleIcon, ClockIcon, HistoryIcon } from './icons';
import type { HistoryItem } from './App';

interface HistoryPanelProps {
  history: HistoryItem[];
  currentIndex: number;
  onRevert: (index: number) => void;
  isLoading: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HistoryCard: React.FC<{
  item: HistoryItem;
  index: number;
  isCurrent: boolean;
  isFuture: boolean;
  onRevert: (index: number) => void;
  isLoading: boolean;
}> = ({ item, index, isCurrent, isFuture, onRevert, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Assuming the last layer is the composite or the most representative
    const displayFile = item.layers && item.layers.length > 0 ? item.layers[item.layers.length - 1].file : null;
    if (displayFile) {
        const objectUrl = URL.createObjectURL(displayFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }
  }, [item.layers]);

  const timestamp = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative pl-10 group">
      {/* Timeline Line */}
      <div className={`absolute left-[19px] top-0 bottom-0 w-0.5 ${isFuture ? 'bg-gray-800' : 'bg-blue-500/30'} group-last:bottom-1/2`}></div>
      
      {/* Timeline Dot */}
      <div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-300
          ${isCurrent ? 'bg-blue-600 border-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 
            isFuture ? 'bg-gray-900 border-gray-700' : 'bg-gray-800 border-blue-500/30'}`}
      >
        {isCurrent ? <CheckCircleIcon className="w-6 h-6 text-white" /> : <div className={`w-2.5 h-2.5 rounded-full ${isFuture ? 'bg-gray-600' : 'bg-blue-400'}`}></div>}
      </div>

      <button
        onClick={() => onRevert(index)}
        disabled={isLoading || isCurrent}
        className={`w-full flex flex-col gap-3 p-3.5 rounded-2xl transition-all duration-300 text-left border
          ${isCurrent ? 'bg-blue-600/10 border-blue-500/50 shadow-xl' : 'bg-gray-900/40 border-white/5 hover:bg-gray-800/60 hover:border-white/10 hover:translate-x-1'}
          ${isFuture ? 'opacity-40 grayscale' : 'opacity-100'}
          ${isLoading ? 'cursor-not-allowed' : ''}`}
      >
        <div className="w-full aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/10 shadow-inner group-hover:shadow-blue-500/10 transition-all duration-500">
          {previewUrl && <img src={previewUrl} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className={`font-bold truncate text-sm tracking-tight ${isCurrent ? 'text-blue-300' : 'text-gray-200'}`}>
              {item.label}
            </span>
            <span className="text-[10px] text-gray-500 font-mono flex-shrink-0 bg-black/40 px-1.5 py-0.5 rounded-md">{timestamp}</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 font-medium">
            {isCurrent ? 'Currently Viewing' : isFuture ? 'Redo to restore' : 'Click to revert'}
          </span>
        </div>
      </button>
    </div>
  );
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentIndex,
  onRevert,
  isLoading,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full flex flex-col bg-gray-800/20">
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            Edit History
        </h3>
        
        <div className="flex gap-2 mt-4">
            <button
                onClick={onUndo}
                disabled={!canUndo || isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
            >
                <UndoIcon className="w-4 h-4" /> Undo
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo || isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
            >
                <RedoIcon className="w-4 h-4" /> Redo
            </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {[...history].reverse().map((item, revIndex) => {
          const originalIndex = history.length - 1 - revIndex;
          const isCurrent = originalIndex === currentIndex;
          const isFuture = originalIndex > currentIndex;
          
          return (
            <HistoryCard
              key={`${item.timestamp}-${originalIndex}`}
              item={item}
              index={originalIndex}
              isCurrent={isCurrent}
              isFuture={isFuture}
              onRevert={onRevert}
              isLoading={isLoading}
            />
          );
        })}
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <HistoryIcon className="w-12 h-12 mb-2" />
            <p className="text-sm">No history yet</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-900/50 border-t border-gray-700/50">
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            Note: Making a new edit while viewing a previous state will overwrite the future timeline.
          </p>
      </div>
    </div>
  );
};

export default HistoryPanel;
