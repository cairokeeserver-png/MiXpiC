
import React, { useState } from 'react';
import { EraserIcon, PaletteIcon, SunIcon } from './icons';

interface DrawPanelProps {
    isLoading: boolean;
    brushSize: number;
    onSetBrushSize: (size: number) => void;
    brushOpacity: number;
    onSetBrushOpacity: (opacity: number) => void;
    brushColor: string;
    onSetBrushColor: (color: string) => void;
    onApplyDraw: () => void;
    onApplyAsMask: () => void;
    onClearDraw: () => void;
    hasDrawing: boolean;
    hasActiveLayer: boolean;
}

const COLORS = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#818CF8', '#A78BFA', '#F472B6', '#4B5563'
];

const DrawPanel: React.FC<DrawPanelProps> = ({
    isLoading,
    brushSize,
    onSetBrushSize,
    brushOpacity,
    onSetBrushOpacity,
    brushColor,
    onSetBrushColor,
    onApplyDraw,
    onApplyAsMask,
    onClearDraw,
    hasDrawing,
    hasActiveLayer
}) => {
    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-emerald-400">Drawing Tools</h3>
            
            <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Brush Size</label>
                        <span className="text-[10px] font-mono text-gray-400">{brushSize}px</span>
                    </div>
                    <input 
                        type="range"
                        min="1"
                        max="100"
                        value={brushSize}
                        onChange={e => onSetBrushSize(parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Opacity</label>
                        <span className="text-[10px] font-mono text-gray-400">{Math.round(brushOpacity * 100)}%</span>
                    </div>
                    <input 
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={brushOpacity}
                        onChange={e => onSetBrushOpacity(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                            <button 
                                key={c}
                                onClick={() => onSetBrushColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition ${brushColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                                disabled={isLoading}
                            />
                        ))}
                        <input 
                            type="color" 
                            value={brushColor}
                            onChange={e => onSetBrushColor(e.target.value)}
                            className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onClearDraw}
                    disabled={isLoading || !hasDrawing}
                    className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition disabled:opacity-20 flex items-center justify-center gap-2"
                >
                    <EraserIcon className="w-4 h-4" /> Clear
                </button>
                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={onApplyDraw}
                        disabled={isLoading || !hasDrawing}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-20 flex items-center justify-center gap-2"
                    >
                        <PaletteIcon className="w-4 h-4" /> To Layer
                    </button>
                    {hasActiveLayer && (
                        <button 
                            onClick={onApplyAsMask}
                            disabled={isLoading || !hasDrawing}
                            className="py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-20 flex items-center justify-center gap-2"
                        >
                            Mask Active Layer
                        </button>
                    )}
                </div>
            </div>
            
            <p className="text-[10px] text-gray-500 text-center italic">
                Freehand drawing is applied directly to the image. Use "Apply Drawing" to save your changes to history.
            </p>
        </div>
    );
};

export default DrawPanel;
