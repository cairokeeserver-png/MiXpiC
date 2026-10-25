
import React from 'react';
import type { TextOverlay } from './App';

interface TextPanelProps {
    overlay: TextOverlay | null;
    onChange: (overlay: TextOverlay | null) => void;
    onApply: () => void;
    isLoading: boolean;
}

const FONTS = [
    { name: 'Sans Serif', value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' },
    { name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
    { name: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
    { name: 'Display', value: '"Space Grotesk", sans-serif' },
];

const COLORS = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#818CF8', '#A78BFA', '#F472B6'
];

const TextPanel: React.FC<TextPanelProps> = ({ overlay, onChange, onApply, isLoading }) => {
    const handleAddText = () => {
        onChange({
            text: 'Your Text Here',
            font: FONTS[0].value,
            size: 48,
            color: '#FFFFFF',
            opacity: 1,
            x: 200,
            y: 200
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-blue-400">Text Overlay</h3>
            
            {!overlay ? (
                <button 
                    onClick={handleAddText}
                    disabled={isLoading}
                    className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition flex flex-col items-center gap-2"
                >
                    <span className="text-2xl">+</span>
                    <span className="text-sm font-bold">Add Text Layer</span>
                </button>
            ) : (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Content</label>
                        <textarea 
                            value={overlay.text}
                            onChange={e => onChange({ ...overlay, text: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition h-24 resize-none"
                            placeholder="Type something..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Font</label>
                            <select 
                                value={overlay.font}
                                onChange={e => onChange({ ...overlay, font: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-blue-500"
                            >
                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Size</label>
                            <input 
                                type="number"
                                value={overlay.size}
                                onChange={e => onChange({ ...overlay, size: parseInt(e.target.value) || 0 })}
                                className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => onChange({ ...overlay, color: c })}
                                    className={`w-6 h-6 rounded-full border-2 transition ${overlay.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Opacity</label>
                            <span className="text-[10px] font-mono text-gray-400">{Math.round(overlay.opacity * 100)}%</span>
                        </div>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={overlay.opacity}
                            onChange={e => onChange({ ...overlay, opacity: parseFloat(e.target.value) })}
                            className="w-full accent-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                            onClick={() => onChange(null)}
                            className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onApply}
                            disabled={isLoading || !overlay.text.trim()}
                            className="py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20"
                        >
                            Burn Text
                        </button>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 text-center italic">
                        Tip: Drag the text on the image to reposition it.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TextPanel;
