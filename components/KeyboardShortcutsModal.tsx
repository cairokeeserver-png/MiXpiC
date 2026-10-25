/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KeyboardIcon } from './icons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Tools' | 'History' | 'Canvas' | 'Layers';
}

const SHORTCUTS: ShortcutItem[] = [
  // Tools
  { keys: ['R'], description: 'Switch to Retouch tool', category: 'Tools' },
  { keys: ['L'], description: 'Open Layers panel', category: 'Tools' },
  { keys: ['F'], description: 'Open Filters panel', category: 'Tools' },
  { keys: ['A'], description: 'Open Adjustments panel', category: 'Tools' },
  { keys: ['C'], description: 'Open Crop tool', category: 'Tools' },
  { keys: ['D'], description: 'Open Draw & Mask tool', category: 'Tools' },
  { keys: ['T'], description: 'Open Text overlay tool', category: 'Tools' },
  { keys: ['H'], description: 'Open History panel', category: 'Tools' },
  { keys: ['E'], description: 'Open Magic Enhance panel', category: 'Tools' },

  // History
  { keys: ['Ctrl / ⌘', 'Z'], description: 'Undo last change', category: 'History' },
  { keys: ['Ctrl / ⌘', 'Shift', 'Z'], description: 'Redo change (or Ctrl+Y)', category: 'History' },

  // Canvas
  { keys: ['0'], description: 'Reset Zoom & Center Canvas', category: 'Canvas' },
  { keys: ['+', '='], description: 'Zoom In', category: 'Canvas' },
  { keys: ['-'], description: 'Zoom Out', category: 'Canvas' },
  { keys: ['Space + Drag'], description: 'Pan around image canvas', category: 'Canvas' },

  // Layers
  { keys: ['Ctrl / ⌘', 'Click'], description: 'Toggle layer in multi-selection', category: 'Layers' },
  { keys: ['Shift', 'Click'], description: 'Select range of layers', category: 'Layers' },
  { keys: ['?'], description: 'Toggle this Shortcuts Guide', category: 'Layers' },
  { keys: ['Esc'], description: 'Close dialogs or clear selection', category: 'Layers' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories: Array<ShortcutItem['category']> = ['Tools', 'History', 'Layers', 'Canvas'];

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#12151F] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <KeyboardIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Global Manager
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Quickly navigate tools, undo/redo, and manipulate layers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
          {categories.map(category => {
            const items = SHORTCUTS.filter(s => s.category === category);
            return (
              <div key={category} className="space-y-2.5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400/90 flex items-center gap-2">
                  <span>{category}</span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition"
                    >
                      <span className="text-xs text-gray-300 font-medium pr-2">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd className="px-2 py-0.5 min-w-[24px] text-center bg-gray-900 border border-white/15 rounded-lg text-[11px] font-mono font-semibold text-gray-200 shadow-sm">
                              {k}
                            </kbd>
                            {kIdx < shortcut.keys.length - 1 && (
                              <span className="text-[10px] text-gray-500">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-gray-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-[10px] font-mono text-gray-300">?</kbd> anytime to toggle this modal</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
