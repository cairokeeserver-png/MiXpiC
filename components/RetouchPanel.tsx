/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { BullseyeIcon, EraserIcon, BackgroundRemovalIcon, HistoryIcon, MagicWandIcon } from './icons';
import type { RetouchTool, EraseMode, BrushShape } from './App';

interface RetouchPanelProps {
    isLoading: boolean;
    activeTool: RetouchTool;
    onSetActiveTool: (tool: RetouchTool) => void;
    
    // Point & Edit props
    editHotspot: { x: number, y: number } | null;
    onApplyPointEdit: (prompt: string) => void;
    onOpenHistory: (setter: (prompt: string) => void) => void;

    // Magic Eraser props
    onApplyErase: () => void;
    hasMask: boolean;
    eraseMode: EraseMode;
    onSetEraseMode: (mode: EraseMode) => void;
    brushSize: number;
    onSetBrushSize: (size: number) => void;
    brushOpacity: number;
    onSetBrushOpacity: (opacity: number) => void;
    brushShape: BrushShape;
    onSetBrushShape: (shape: BrushShape) => void;
    onClearMask: () => void;

    // Gen Fill props
    onApplyFill: (prompt: string) => void;

    // Background Removal props
    onRemoveBackground: () => void;
}

const RetouchPanel: React.FC<RetouchPanelProps> = ({
    isLoading,
    activeTool,
    onSetActiveTool,
    editHotspot,
    onApplyPointEdit,
    onOpenHistory,
    onApplyErase,
    hasMask,
    eraseMode,
    onSetEraseMode,
    brushSize,
    onSetBrushSize,
    brushOpacity,
    onSetBrushOpacity,
    brushShape,
    onSetBrushShape,
    onClearMask,
    onApplyFill,
    onRemoveBackground,
}) => {
    const [pointEditPrompt, setPointEditPrompt] = useState('');
    const [fillPrompt, setFillPrompt] = useState('');

    const handleApplyPointEdit = () => {
        onApplyPointEdit(pointEditPrompt);
        setPointEditPrompt('');
    };

    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col gap-6 backdrop-blur-sm">
            {/* Tool Selector */}
            <div className="flex w-full bg-gray-900/50 p-1 rounded-lg">
                <button
                    onClick={() => onSetActiveTool('point')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-all duration-200 text-sm font-semibold ${activeTool === 'point' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    <BullseyeIcon className="w-5 h-5" /> Point & Edit
                </button>
                <button
                    onClick={() => onSetActiveTool('erase')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-all duration-200 text-sm font-semibold ${activeTool === 'erase' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    <EraserIcon className="w-5 h-5" /> Magic Eraser
                </button>
                <button
                    onClick={() => onSetActiveTool('fill')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-all duration-200 text-sm font-semibold ${activeTool === 'fill' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    <MagicWandIcon className="w-5 h-5" /> Gen Fill
                </button>
                 <button
                    onClick={() => onSetActiveTool('background')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-all duration-200 text-sm font-semibold ${activeTool === 'background' ? 'bg-teal-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    <BackgroundRemovalIcon className="w-5 h-5" /> Background
                </button>
            </div>
            
            {/* Point & Edit Panel */}
            {activeTool === 'point' && (
                <div className="animate-fade-in flex flex-col gap-3">
                    <div className="text-center md:text-left">
                      <h3 className="text-lg font-semibold text-gray-300">Point & Edit</h3>
                      <p className="text-sm text-gray-400">Click a spot on the image, then describe your edit.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <input
                              type="text"
                              value={pointEditPrompt}
                              onChange={(e) => setPointEditPrompt(e.target.value)}
                              placeholder={editHotspot ? "e.g., 'make the shirt blue'" : "Click on the image first"}
                              className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base pr-12"
                              disabled={isLoading || !editHotspot}
                          />
                          <button
                              onClick={() => onOpenHistory(setPointEditPrompt)}
                              title="Prompt History"
                              aria-label="Open prompt history"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
                              disabled={isLoading}
                          >
                              <HistoryIcon className="w-6 h-6" />
                          </button>
                        </div>
                        <button onClick={handleApplyPointEdit} disabled={isLoading || !pointEditPrompt.trim() || !editHotspot} className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none">Apply Edit</button>
                    </div>
                </div>
            )}

            {/* Magic Eraser Panel */}
            {activeTool === 'erase' && (
                <div className="animate-fade-in flex flex-col gap-5">
                     <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-gray-300">Magic Eraser</h3>
                        <p className="text-sm text-gray-400">Paint over an object or person to remove them from the image.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h4 className="text-base font-semibold text-gray-300 -mb-1">Brush Settings</h4>

                        {/* Mode Toggles */}
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Mode</label>
                            <div className="flex w-full bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => onSetEraseMode('smart')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${eraseMode === 'smart' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Smart</button>
                                <button onClick={() => onSetEraseMode('manual')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${eraseMode === 'manual' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Manual</button>
                            </div>
                        </div>

                        {/* Brush Size Slider */}
                        <div className="w-full">
                            <label htmlFor="brush-size" className="text-sm font-medium text-gray-400 flex justify-between mb-1">
                                <span>Brush Size</span>
                                <span>{brushSize}px</span>
                            </label>
                            <input
                                id="brush-size"
                                type="range"
                                min="5"
                                max="100"
                                value={brushSize}
                                onChange={(e) => onSetBrushSize(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                        {/* Brush Opacity Slider */}
                        <div className="w-full">
                            <label htmlFor="brush-opacity" className="text-sm font-medium text-gray-400 flex justify-between mb-1">
                                <span>Opacity</span>
                                <span>{Math.round(brushOpacity * 100)}%</span>
                            </label>
                            <input
                                id="brush-opacity"
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={brushOpacity}
                                onChange={(e) => onSetBrushOpacity(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                         {/* Brush Shape */}
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Brush Shape</label>
                            <div className="flex w-full bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => onSetBrushShape('round')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${brushShape === 'round' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Round</button>
                                <button onClick={() => onSetBrushShape('square')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${brushShape === 'square' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Square</button>
                            </div>
                        </div>
                    </div>
                     
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={onClearMask} disabled={isLoading || !hasMask} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">Clear</button>
                        <button onClick={onApplyErase} disabled={isLoading || !hasMask} className="flex-1 bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-purple-800 disabled:to-purple-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none">Apply Erase</button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                        {eraseMode === 'smart' 
                            ? 'Smart Mode: Loosely paint over an object, and AI will detect its edges for a clean removal.'
                            : 'Manual Mode: Removes only the exact area you paint over. Perfect for precise touch-ups.'
                        }
                    </p>
                </div>
            )}

            {/* Gen Fill Panel */}
            {activeTool === 'fill' && (
                <div className="animate-fade-in flex flex-col gap-5">
                     <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-gray-300">Generative Fill</h3>
                        <p className="text-sm text-gray-400">Paint an area and describe what to generate, or leave blank to match surroundings.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h4 className="text-base font-semibold text-gray-300 -mb-1">Brush Settings</h4>

                        {/* Mode Toggles */}
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Mode</label>
                            <div className="flex w-full bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => onSetEraseMode('smart')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${eraseMode === 'smart' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Smart</button>
                                <button onClick={() => onSetEraseMode('manual')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${eraseMode === 'manual' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Manual</button>
                            </div>
                        </div>

                        {/* Brush Size Slider */}
                        <div className="w-full">
                            <label htmlFor="fill-brush-size" className="text-sm font-medium text-gray-400 flex justify-between mb-1">
                                <span>Brush Size</span>
                                <span>{brushSize}px</span>
                            </label>
                            <input
                                id="fill-brush-size"
                                type="range"
                                min="5"
                                max="100"
                                value={brushSize}
                                onChange={(e) => onSetBrushSize(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                        {/* Brush Opacity Slider */}
                        <div className="w-full">
                            <label htmlFor="fill-brush-opacity" className="text-sm font-medium text-gray-400 flex justify-between mb-1">
                                <span>Opacity</span>
                                <span>{Math.round(brushOpacity * 100)}%</span>
                            </label>
                            <input
                                id="fill-brush-opacity"
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={brushOpacity}
                                onChange={(e) => onSetBrushOpacity(Number(e.target.value))}
                                disabled={isLoading}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                         {/* Brush Shape */}
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Brush Shape</label>
                            <div className="flex w-full bg-gray-800 p-1 rounded-lg">
                                <button onClick={() => onSetBrushShape('round')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${brushShape === 'round' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Round</button>
                                <button onClick={() => onSetBrushShape('square')} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition ${brushShape === 'square' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Square</button>
                            </div>
                        </div>
                    </div>
                     
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={fillPrompt}
                            onChange={(e) => setFillPrompt(e.target.value)}
                            placeholder="e.g., 'a red sports car' (optional)"
                            className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-green-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                            disabled={isLoading || !hasMask}
                        />
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={onClearMask} disabled={isLoading || !hasMask} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">Clear</button>
                            <button onClick={() => onApplyFill(fillPrompt)} disabled={isLoading || !hasMask} className="flex-1 bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-green-800 disabled:to-green-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none">Generate Fill</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Removal Panel */}
            {activeTool === 'background' && (
                <div className="animate-fade-in flex flex-col gap-4 text-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300">Background Removal</h3>
                        <p className="text-sm text-gray-400 mt-1">Automatically detect the main subject and remove the background, leaving a transparent PNG.</p>
                    </div>
                    <button 
                        onClick={onRemoveBackground}
                        disabled={isLoading}
                        className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br from-teal-600 to-teal-500 shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-teal-800 disabled:to-teal-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Remove Background
                    </button>
                </div>
            )}
        </div>
    );
};

export default RetouchPanel;
