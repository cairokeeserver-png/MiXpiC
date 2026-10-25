
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SparklesIcon, EyeSparkleIcon, PortraitIcon, SunIcon, PaletteIcon, ColorizeIcon } from './icons';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  onApplyPointAdjustment: (prompt: string, hotspot: { x: number, y: number }) => void;
  isLoading: boolean;
  isEyePicking: boolean;
  onSetIsEyePicking: (isPicking: boolean) => void;
  eyeHotspot: { x: number, y: number } | null;
  onClearEyeHotspot: () => void;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void; onApply: () => void; isLoading: boolean }> = ({ label, value, min, max, onChange, onApply, isLoading }) => (
  <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-wider">
      <span>{label}</span>
      <span className="text-blue-400 font-mono">{value}%</span>
    </div>
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={isLoading} className="flex-grow h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
      <button onClick={onApply} disabled={isLoading || value === 0} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-bold rounded-lg transition uppercase">Fix</button>
    </div>
  </div>
);

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, onApplyPointAdjustment, isLoading, isEyePicking, onSetIsEyePicking, eyeHotspot, onClearEyeHotspot }) => {
  const [bright, setBright] = useState(0);
  const [blur, setBlur] = useState(0);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgSat, setBgSat] = useState(0);

  const portraitTools = [
    { name: 'Smooth Skin', p: 'Naturally smooth skin texture, preserving identity.' },
    { name: 'Brighten Eyes', p: 'Subtly enhance clarity and brightness of the eyes.' },
    { name: 'Reduce Shadows', p: 'Naturally soften dark shadows and under-eye circles.' },
    { name: 'Whiten Teeth', p: 'Gently whiten teeth for a clean, natural portrait.' },
  ];

  const restoreTools = [
    { name: 'General Restore', p: 'Automatic high-quality enhancement and denoising.' },
    { name: 'Hi-Fi Portrait', p: 'Restore facial fidelity and sharpness strictly preserving identity.' },
    { name: 'Fix Distortion', p: 'Correct distorted or unnatural facial features common in AI media.' },
  ];

  const lightingStyles = [
    { name: 'Dramatic', p: 'Apply dramatic, high-contrast lighting with deep shadows and strong highlights.' },
    { name: 'Natural', p: 'Refine lighting for a soft, natural daylight effect.' },
    { name: 'Studio', p: 'Apply professional three-point studio lighting.' },
    { name: 'Rembrandt', p: 'Apply classic Rembrandt lighting with characteristic triangle of light on the cheek.' },
  ];

  const colorTools = [
    { name: 'Auto Color Fix', p: 'Automatically improve color balance and vibrancy using AI.' },
    { name: 'Vibrance Boost', p: 'Intelligently boost color vibrancy without over-saturating skin tones.' },
    { name: 'Colorize B&W', p: 'Add realistic, natural colors to this black and white image using AI.' },
    { name: 'Mood Enhance', p: 'Apply an AI-powered color grade to enhance the overall mood and visual appeal.' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* AI Lighting Section */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-1 flex items-center gap-2"><SunIcon className="w-3 h-3" /> AI Lighting Refinement</h4>
        <div className="grid grid-cols-2 gap-2">
          {lightingStyles.map(t => (
            <button key={t.name} onClick={() => onApplyAdjustment(t.p)} disabled={isLoading} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-bold text-gray-400 transition hover:text-white">{t.name}</button>
          ))}
        </div>
      </div>

      {/* AI Color Section */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 px-1 flex items-center gap-2"><PaletteIcon className="w-3 h-3" /> AI Color & Mood</h4>
        <button 
          onClick={() => onApplyAdjustment('Apply a master edit. Apply advanced, professional-style color, tone, and lighting adjustments to enhance the image\'s mood and depth. Ensure photorealism and strict identity preservation.')} 
          disabled={isLoading} 
          className="w-full py-4 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 hover:from-indigo-600/30 hover:to-blue-600/30 border border-indigo-500/30 rounded-2xl text-xs font-bold text-indigo-200 transition shadow-lg shadow-indigo-900/20"
        >
          Auto Master Edit
        </button>
        <div className="grid grid-cols-2 gap-2">
          {colorTools.map(t => (
            <button key={t.name} onClick={() => onApplyAdjustment(t.p)} disabled={isLoading} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-bold text-gray-400 transition hover:text-white flex flex-col items-center gap-1">
              {t.name === 'Colorize B&W' && <ColorizeIcon className="w-3 h-3 mb-1 text-indigo-400" />}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eye AI Section */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 px-1 flex items-center gap-2"><EyeSparkleIcon className="w-3 h-3" /> Eye AI Precision</h4>
        <button onClick={() => onApplyAdjustment('Detect all eyes and fix any distortions, making them clear and photorealistic.')} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/30 rounded-2xl text-xs font-bold text-cyan-200 transition">Auto-Fix All Eyes</button>
        <div className="flex gap-2">
            <button onClick={() => { onClearEyeHotspot(); onSetIsEyePicking(true); }} className={`flex-1 py-3 rounded-xl text-[10px] font-bold border transition ${isEyePicking ? 'bg-cyan-500 text-white border-cyan-400 animate-pulse' : 'bg-white/5 border-white/10 text-gray-400'}`}>{isEyePicking ? 'Click Eye...' : 'Select Specific'}</button>
            <button onClick={() => eyeHotspot && onApplyPointAdjustment('Fix this specific eye to be clear and natural.', eyeHotspot)} disabled={!eyeHotspot || isLoading} className="flex-1 py-3 bg-white/10 rounded-xl text-[10px] font-bold border border-white/10 disabled:opacity-20">Apply Hotspot</button>
        </div>
      </div>

      {/* Portrait Touch-up */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 px-1 flex items-center gap-2"><PortraitIcon className="w-3 h-3" /> Portrait Touch-up</h4>
        <div className="grid grid-cols-2 gap-2">
          {portraitTools.map(t => (
            <button key={t.name} onClick={() => onApplyAdjustment(t.p)} disabled={isLoading} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-bold text-gray-400 transition hover:text-white">{t.name}</button>
          ))}
        </div>
      </div>

      {/* Face Restoration */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 px-1 flex items-center gap-2"><SparklesIcon className="w-3 h-3" /> Face Restoration</h4>
        <button 
          onClick={() => onApplyAdjustment('Perform a high-fidelity photographic face restoration. Improve sharpness, reduce noise, and correct minor camera-induced flaws like red-eye or distortion. The result must be a natural, high-quality portrait that preserves the person\'s original identity.')} 
          disabled={isLoading} 
          className="w-full py-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 rounded-2xl text-xs font-bold text-purple-200 transition flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" /> High-Fidelity Face Restoration
        </button>
        <div className="flex flex-col gap-2">
          {restoreTools.map(t => (
            <button key={t.name} onClick={() => onApplyAdjustment(t.p)} disabled={isLoading} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left flex justify-between items-center group transition">
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-white">{t.name}</span>
              <span className="text-[9px] text-gray-600 font-mono">PRO</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lighting & Background */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-1">Lighting & Environment</h4>
        <Slider label="Exposure" value={bright} min={-100} max={100} onChange={setBright} onApply={() => onApplyAdjustment(`Adjust brightness by ${bright}%`)} isLoading={isLoading} />
        <Slider label="Background Blur" value={bgBlur} min={0} max={100} onChange={setBgBlur} onApply={() => onApplyAdjustment(`Apply realistic ${bgBlur}% blur to the background`)} isLoading={isLoading} />
        <Slider label="Background Color" value={bgSat} min={-100} max={100} onChange={setBgSat} onApply={() => onApplyAdjustment(`Adjust background saturation by ${bgSat}%`)} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AdjustmentPanel;
