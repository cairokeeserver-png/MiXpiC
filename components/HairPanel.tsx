/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { EyedropperIcon } from './icons';

interface HairPanelProps {
  onApplyHairStyle: (prompt: string) => void;
  isLoading: boolean;
  pickedColor: string | null;
  onActivateColorPicker: () => void;
  onClearPickedColor: () => void;
}

type Gender = 'male' | 'female';

const HairPanel: React.FC<HairPanelProps> = ({ onApplyHairStyle, isLoading, pickedColor, onActivateColorPicker, onClearPickedColor }) => {
  const [gender, setGender] = useState<Gender>('female');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [hairLength, setHairLength] = useState(0); // -50 to +50

  useEffect(() => {
    if (pickedColor) {
      setSelectedColor(pickedColor);
      onClearPickedColor();
    }
  }, [pickedColor, onClearPickedColor]);

  const maleStyles = ['Buzz Cut', 'Crew Cut', 'Pompadour', 'Long Hair', 'Fade', 'Man Bun', 'Bald'];
  const femaleStyles = ['Bob Cut', 'Pixie Cut', 'Long Wavy', 'High Ponytail', 'Braids', 'Updo', 'Short Curls'];
  const colors = [
    { name: 'Natural Black', value: 'natural black' },
    { name: 'Chocolate Brown', value: 'chocolate brown' },
    { name: 'Ash Blonde', value: 'ash blonde' },
    { name: 'Fiery Red', value: 'fiery red' },
    { name: 'Platinum Blonde', value: 'platinum blonde' },
    { name: 'Deep Blue', value: 'deep blue' },
    { name: 'Hot Pink', value: 'hot pink' },
    { name: 'Lavender', value: 'lavender purple' },
  ];

  const handleApply = () => {
    if (!selectedStyle) return;

    let prompt = `Apply a photorealistic ${selectedStyle.toLowerCase()} hairstyle to the person in the image.`;
    if (selectedStyle.toLowerCase() === 'bald') {
        prompt = 'Make the person in the image bald. The result should look completely natural and photorealistic.';
    } else {
        if (selectedColor) {
          prompt += ` The hair color should be ${selectedColor}.`;
        }
        if (hairLength > 10) {
          prompt += ` Make the hair significantly longer.`;
        } else if (hairLength < -10) {
          prompt += ` Make the hair significantly shorter.`;
        }
        prompt += ' The result should look completely natural and blend seamlessly with the person\'s head and face.'
    }

    onApplyHairStyle(prompt);
  };
  
  const currentStyles = gender === 'male' ? maleStyles : femaleStyles;

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-center text-gray-300">AI Hair Stylist</h3>
      
      {/* Gender Selection */}
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-gray-400 text-sm">Gender</h4>
        <div className="flex w-full bg-gray-900/50 p-1 rounded-lg">
          <button onClick={() => { setGender('female'); setSelectedStyle(''); }} className={`flex-1 p-2 text-sm font-semibold rounded-md transition ${gender === 'female' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Female</button>
          <button onClick={() => { setGender('male'); setSelectedStyle(''); }} className={`flex-1 p-2 text-sm font-semibold rounded-md transition ${gender === 'male' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Male</button>
        </div>
      </div>

      {/* Style Selection */}
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-gray-400 text-sm">Style</h4>
        <div className="grid grid-cols-3 gap-3">
          {currentStyles.map(style => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              disabled={isLoading}
              className={`text-center bg-white/10 text-gray-200 font-semibold py-3 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedStyle === style ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-gray-400 text-sm">Color (Optional)</h4>
        <div className="grid grid-cols-5 gap-2">
          {colors.map(color => (
            <button
              key={color.name}
              title={color.name}
              aria-label={`Select hair color: ${color.name}`}
              onClick={() => setSelectedColor(prev => prev === color.value ? '' : color.value)}
              disabled={isLoading || selectedStyle === 'Bald'}
              style={{ backgroundColor: color.value.split(' ')[1] || color.value }}
              className={`w-full h-10 rounded-md transition-all duration-200 border-2 ${selectedColor === color.value ? 'border-blue-400 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800' : 'border-white/20 hover:border-white/50'} ${selectedStyle === 'Bald' ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ))}
        </div>
        <button
            onClick={onActivateColorPicker}
            disabled={isLoading || selectedStyle === 'Bald'}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EyedropperIcon className="w-5 h-5" />
            Pick Color from Image
        </button>
        {selectedColor && !colors.some(c => c.value === selectedColor) && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 p-2 bg-gray-900/50 rounded-md">
              Picked color:
              <div className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: selectedColor }}></div>
              <span className="font-mono">{selectedColor}</span>
          </div>
        )}
      </div>

       {/* Length Slider */}
       <div className="flex flex-col gap-2">
            <label htmlFor="length-slider" className="text-sm font-medium text-gray-400 flex justify-between">
                <span>Length</span>
                <span className="font-mono">{hairLength > 0 ? `+${hairLength}` : hairLength}</span>
            </label>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Shorter</span>
                <input
                    id="length-slider"
                    type="range"
                    min="-50"
                    max="50"
                    step="10"
                    value={hairLength}
                    onChange={(e) => setHairLength(Number(e.target.value))}
                    disabled={isLoading || selectedStyle === 'Bald'}
                    className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 ${selectedStyle === 'Bald' ? 'opacity-50' : ''}`}
                />
                <span className="text-xs text-gray-500">Longer</span>
            </div>
        </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={isLoading || !selectedStyle}
        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Apply Hairstyle
      </button>
    </div>
  );
};

export default HairPanel;