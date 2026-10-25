/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { EyedropperIcon } from './icons';

interface ColorGradingPanelProps {
  onApplyGrade: (prompt: string) => void;
  isLoading: boolean;
  onShowPreview: (target: HTMLElement, text: string, prompt?: string, type?: 'filter' | 'adjustment') => void;
  onHidePreview: () => void;
  pickedColor: string | null;
  onActivateColorPicker: () => void;
  onClearPickedColor: () => void;
}

// Local, reusable Slider Component for HSL adjustments
const HSLSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  isLoading: boolean;
}> = ({ label, value, min, max, onChange, isLoading }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={`${label}-slider`} className="text-sm font-medium text-gray-400 flex justify-between">
      <span>{label}</span>
      <span className="font-mono">{value > 0 ? `+${value}` : value}</span>
    </label>
    <input
      id={`${label}-slider`}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={isLoading}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

const ColorGradingPanel: React.FC<ColorGradingPanelProps> = ({ 
  onApplyGrade, 
  isLoading, 
  onShowPreview, 
  onHidePreview,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<{ name: string; prompt: string } | null>(null);
  const [intensity, setIntensity] = useState(100);

  // Advanced Grading State
  type HSLValue = { h: number; s: number; l: number };
  const colorChannels = ['Reds', 'Oranges', 'Yellows', 'Greens', 'Aquas', 'Blues', 'Purples', 'Magentas'];
  const colorMap: Record<string, string> = {
    Reds: '#ef4444', Oranges: '#f97316', Yellows: '#eab308', Greens: '#22c55e',
    Aquas: '#2dd4bf', Blues: '#3b82f6', Purples: '#8b5cf6', Magentas: '#d946ef',
  };
  const initialHSL: Record<string, HSLValue> = colorChannels.reduce((acc, color) => ({ ...acc, [color]: { h: 0, s: 0, l: 0 } }), {});
  
  const [advancedTab, setAdvancedTab] = useState<'hsl' | 'curves'>('hsl');
  const [hslValues, setHslValues] = useState(initialHSL);
  const [activeHSLColor, setActiveHSLColor] = useState<string>('Reds');
  const [curvesPrompt, setCurvesPrompt] = useState('');

  const presets = [
    { name: 'Teal & Orange', prompt: 'Apply a cinematic teal and orange color grade. Push cool tones in the shadows towards teal and warm tones, especially skin tones, towards orange for a high-contrast, professional look.' },
    { name: 'Vintage Film', prompt: 'Apply the look of vintage 1970s cinema. This involves a warm, slightly faded color grade with soft contrast, muted colors, and a gentle film grain. Give highlights a slight golden tint.' },
    { name: 'Golden Hour', prompt: "Recreate the warm, soft, and golden lighting of the hour just after sunrise or before sunset. Enhance golden hues and soften shadows for a beautiful, serene atmosphere." },
    { name: 'Cyberpunk Neon', prompt: 'Apply a vibrant cyberpunk aesthetic. The grade should feature neon magenta and cyan glows, deep contrast, and crushed blacks. Enhance reflections and bright lights to complete the futuristic look.' },
    { name: 'Film Noir', prompt: 'Apply a high-contrast, moody film noir black and white filter. The grade should crush the blacks, slightly blow out the highlights, and add a subtle film grain to create a dramatic, classic cinematic feel.' },
    { name: 'Neo-Noir', prompt: 'Apply a modern neo-noir cinematic color grade. This style emphasizes deep, moody blues and vibrant neon pinks and magentas. Increase contrast and add a subtle glow to highlights.' },
    { name: 'ARRI Alexa Look', prompt: 'Apply a color grade that emulates the ARRI Alexa cinema camera aesthetic. This involves creating a natural, film-like image with pleasing, accurate skin tones, wide dynamic range, and a slightly desaturated, organic look.' },
    { name: 'RED Camera Look', prompt: 'Apply a color grade emulating a high-end RED digital cinema camera. This involves creating a crisp, vibrant image with high contrast, rich saturation, and a clean, sharp, distinctly digital aesthetic.' },
    { name: 'Blackmagic Look', prompt: 'Apply a color grade that mimics the aesthetic of a Blackmagic cinema camera. The result should be a cinematic, indie-film style grade with deep, moody contrast, rich but naturalistic colors, and a distinctively filmic quality.' },
    { name: 'Sony Cinema Look', prompt: 'Apply a color grade matching a Sony cinema camera. The result should be a clean, precise color grade with a slightly cool, modern aesthetic, excellent detail retention, and true-to-life color reproduction.' },
    { name: 'Cinematic Moody', prompt: 'Apply a cinematic look focusing on moody lighting and rich colors. Enhance contrast significantly, crush the blacks slightly, and add a subtle, organic film grain for a professional movie aesthetic.' },
    { name: 'Moody Greens', prompt: "Apply a moody and atmospheric color grade. Emphasize deep, dark greens and desaturate other colors, particularly reds and yellows. Add a slight cinematic grain for texture." },
    { name: 'Crisp & Clean', prompt: "Apply a clean and crisp commercial look. Increase vibrance and clarity, slightly boost contrast, and ensure whites are pure and bright for a modern, airy feel." },
  ];

  const handlePresetSelect = (preset: { name: string; prompt: string }) => {
    if (selectedPreset?.name === preset.name) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(preset);
      setIntensity(100);
    }
  };

  const handleApplyPreset = () => {
    if (!selectedPreset) return;
    const finalPrompt = `${selectedPreset.prompt} The intensity of this effect should be ${intensity}%. The result must be photorealistic and preserve the person's identity.`;
    onApplyGrade(finalPrompt);
  };

  const handleResetPreset = () => {
    setSelectedPreset(null);
    setIntensity(100);
  };

  const handleHSLChange = (channel: 'h' | 's' | 'l', value: number) => {
    setHslValues(prev => ({
      ...prev,
      [activeHSLColor]: { ...prev[activeHSLColor], [channel]: value }
    }));
  };

  const handleApplyAdvanced = () => {
    let promptParts: string[] = [];
    
    const hasHSLChanges = colorChannels.some(color => 
      hslValues[color].h !== 0 || hslValues[color].s !== 0 || hslValues[color].l !== 0
    );

    if (hasHSLChanges) {
        let hslDescriptions: string[] = [];
        for (const color of colorChannels) {
            const { h, s, l } = hslValues[color];
            if (h !== 0 || s !== 0 || l !== 0) {
                let parts = [];
                if (h !== 0) parts.push(`adjust hue by ${h} degrees`);
                if (s !== 0) parts.push(`${s > 0 ? 'increase' : 'decrease'} saturation by ${Math.abs(s)}%`);
                if (l !== 0) parts.push(`${l > 0 ? 'increase' : 'decrease'} luminance by ${Math.abs(l)}%`);
                hslDescriptions.push(`For the ${color.toLowerCase()} color range: ${parts.join(', ')}.`);
            }
        }
        if (hslDescriptions.length > 0) {
            promptParts.push(`Adjust HSL values as follows: ${hslDescriptions.join(' ')}`);
        }
    }
    
    if (curvesPrompt.trim()) {
      promptParts.push(`For the tone curve, apply this adjustment: "${curvesPrompt.trim()}".`);
    }

    if (promptParts.length > 0) {
      const finalPrompt = `Apply a custom color grade. ${promptParts.join(' ')} The result must be photorealistic and preserve the person's identity.`;
      onApplyGrade(finalPrompt);
    }
  };

  const handleResetAdvanced = () => {
    setHslValues(initialHSL);
    setCurvesPrompt('');
    setActiveHSLColor('Reds');
  };

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-center text-gray-300">Color Grading</h3>
      
      {/* Presets Section */}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-400 text-center -mt-2">1. Select a professional color preset.</p>
        <div className="grid grid-cols-2 gap-3">
          {presets.map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              onMouseEnter={(e) => onShowPreview(e.currentTarget, preset.name, preset.prompt, 'adjustment')}
              onMouseLeave={onHidePreview}
              disabled={isLoading}
              className={`w-full text-center bg-white/10 text-gray-200 font-semibold py-3 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedPreset?.name === preset.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className={`flex flex-col gap-4 transition-opacity duration-300 ${!selectedPreset ? 'opacity-40' : 'opacity-100'}`}>
          <p className="text-sm text-gray-400 text-center">2. Fine-tune the intensity and apply.</p>
          <div className="flex flex-col gap-2">
              <label htmlFor="intensity-slider" className="text-sm font-medium text-gray-400 flex justify-between">
                <span>Intensity</span>
                <span className="font-mono">{intensity}%</span>
              </label>
              <input
                  id="intensity-slider"
                  type="range" min={0} max={100} value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  disabled={isLoading || !selectedPreset}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
              />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-1">
              <button onClick={handleResetPreset} disabled={isLoading || !selectedPreset} className="bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-3 px-4 rounded-md transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">Reset</button>
              <button onClick={handleApplyPreset} disabled={isLoading || !selectedPreset} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-md transition-all text-sm disabled:bg-blue-800 disabled:cursor-not-allowed">Apply Grade</button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700/50"></div>

      {/* Advanced Grading Section */}
      <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold text-gray-300 text-center">Advanced Color Grading</h4>
          <div className="flex w-full bg-gray-900/50 p-1 rounded-lg">
              <button onClick={() => setAdvancedTab('hsl')} className={`flex-1 p-2 text-sm font-semibold rounded-md transition ${advancedTab === 'hsl' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}>HSL</button>
              <button onClick={() => setAdvancedTab('curves')} className={`flex-1 p-2 text-sm font-semibold rounded-md transition ${advancedTab === 'curves' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}>Curves</button>
          </div>

          {advancedTab === 'hsl' && (
              <div className="animate-fade-in flex flex-col gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-4 gap-2">
                      {colorChannels.map(color => (
                          <button
                              key={color}
                              onClick={() => setActiveHSLColor(color)}
                              className={`p-2 rounded-md flex flex-col items-center gap-1.5 transition ${activeHSLColor === color ? 'bg-blue-500/30' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                          >
                              <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: colorMap[color] }}></div>
                              <span className="text-xs text-gray-300 font-medium">{color}</span>
                          </button>
                      ))}
                  </div>
                  <div className="border-t border-gray-700/50 my-1"></div>
                  <div className="flex flex-col gap-3">
                      <HSLSlider label="Hue" value={hslValues[activeHSLColor].h} min={-180} max={180} onChange={(v) => handleHSLChange('h', v)} isLoading={isLoading} />
                      <HSLSlider label="Saturation" value={hslValues[activeHSLColor].s} min={-100} max={100} onChange={(v) => handleHSLChange('s', v)} isLoading={isLoading} />
                      <HSLSlider label="Luminance" value={hslValues[activeHSLColor].l} min={-100} max={100} onChange={(v) => handleHSLChange('l', v)} isLoading={isLoading} />
                  </div>
              </div>
          )}

          {advancedTab === 'curves' && (
              <div className="animate-fade-in flex flex-col gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <label htmlFor="curves-prompt" className="text-sm font-medium text-gray-400">Describe Tone Curve Adjustment</label>
                  <textarea
                      id="curves-prompt"
                      value={curvesPrompt}
                      onChange={(e) => setCurvesPrompt(e.target.value)}
                      placeholder="e.g., 'create a classic S-curve for more contrast', 'lift the shadows and crush the highlights'"
                      className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm resize-none"
                      rows={3}
                      disabled={isLoading}
                  />
              </div>
          )}

          <div className="grid grid-cols-2 gap-3">
              <button onClick={handleResetAdvanced} disabled={isLoading} className="bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-3 px-4 rounded-md transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">Reset Advanced</button>
              <button onClick={handleApplyAdvanced} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-md transition-all text-sm disabled:bg-blue-800 disabled:cursor-not-allowed">Apply Advanced</button>
          </div>
      </div>
    </div>
  );
};

export default ColorGradingPanel;