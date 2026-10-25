/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { HistoryIcon } from './icons';

interface StudioPanelProps {
  onGenerateStudioPortrait: (prompt: string) => void;
  isLoading: boolean;
  onOpenHistory: (setter: (prompt: string) => void) => void;
  onAddToHistory: (prompt: string) => void;
}

type Selection = {
    name: string;
    prompt: string;
};

const styles: Selection[] = [
    { name: 'Corporate Headshot', prompt: 'a professional corporate headshot with a clean, sharp look' },
    { name: 'Cinematic Portrait', prompt: 'a dramatic cinematic portrait with moody lighting and rich colors' },
    { name: 'Fashion Editorial', prompt: 'a high-fashion editorial style portrait' },
    { name: 'Candid Laughter', prompt: 'a candid portrait capturing a moment of genuine laughter' },
    { name: 'Direct Gaze', prompt: 'a professional portrait where the subject is looking directly at the camera' },
    { name: 'Vintage B&W', prompt: 'a classic, timeless black and white vintage portrait reminiscent of early 20th-century photography' },
    { name: 'Vintage Color', prompt: 'a classic vintage portrait with the warm, faded colors and soft focus of a 1970s photograph' },
    { name: 'Cyberpunk', prompt: 'a futuristic cyberpunk portrait with neon-lit reflections and high-tech augmentations' },
    { name: 'Art Deco', prompt: 'an elegant Art Deco style portrait with bold geometric patterns and a glamorous 1920s feel' },
    { name: 'Surrealist', prompt: 'a dreamlike surrealist portrait with unexpected elements and a bizarre, artistic composition' },
];

type AttireCategory = {
    [key: string]: Selection[];
};

const attireCategories: AttireCategory = {
    'Professional': [
        { name: 'Business Suit', prompt: 'wearing a modern, well-fitted business suit' },
        { name: 'Business Casual', prompt: 'wearing a smart business casual outfit' },
        { name: 'Elegant Gown', prompt: 'wearing an elegant, formal evening gown' },
        { name: 'Tuxedo', prompt: 'wearing a classic black tuxedo with a bow tie' },
        { name: 'Formal Blouse', prompt: 'wearing an elegant, formal blouse' },
    ],
    'Fantasy & History': [
        { name: 'Medieval Armor', prompt: 'wearing a shining, full-plate medieval armor' },
        { name: 'Egyptian Pharaoh', prompt: 'wearing the regal attire of an ancient Egyptian Pharaoh with a nemes headdress' },
        { name: 'Greek Soldier Armor', prompt: 'wearing the bronze armor and helmet of an ancient Greek soldier' },
        { name: 'Persian Royal', prompt: 'wearing the ornate, luxurious robes of a Persian royal from the Achaemenid Empire' },
        { name: 'Arabian Noble', prompt: 'wearing the flowing robes and turban of a classic Arabian noble' },
        { name: 'Viking Outfit', prompt: 'wearing a rugged Viking-style leather outfit' },
        { name: 'Regal Cape', prompt: 'wearing a regal and exotic maroon cape over simple dark clothing' },
    ],
    'Superheroes': [
        { name: 'Classic Hero', prompt: 'wearing a classic superhero costume, with a bold chest emblem and a flowing cape' },
        { name: 'Dark Hero', prompt: 'wearing a dark, armored hero costume, with a cowl and cape' },
        { name: 'Web-Slinger', prompt: 'wearing a sleek, red and blue web-patterned superhero suit' },
        { name: 'Amazon Heroine', prompt: 'wearing the armor of an Amazonian heroine, with a golden tiara and bracelets' },
        { name: 'Armored Avenger', prompt: 'wearing a high-tech, metallic suit of armor in red and gold' },
    ],
    'Fun & Party': [
         { name: 'Leather Jacket', prompt: 'wearing a stylish leather jacket' },
         { name: 'Pirate Captain', prompt: 'wearing a dashing pirate captain\'s outfit with a tricorn hat and an eye patch' },
         { name: '80s Rockstar', prompt: 'wearing a flashy 1980s rockstar outfit with bold hair and makeup, reminiscent of the glam rock era' },
         { name: 'Silly Clown', prompt: 'wearing a colorful, oversized clown costume with a rainbow wig and red nose' },
    ],
};


const lightings: Selection[] = [
    { name: 'Rembrandt', prompt: 'dramatic Rembrandt lighting with a strong key light and deep shadows' },
    { name: 'Soft Beauty', prompt: 'soft, flattering beauty lighting that minimizes blemishes' },
    { name: 'Split Lighting', prompt: 'dramatic split lighting, illuminating only one side of the face' },
    { name: 'High-Key Studio', prompt: 'bright, high-key studio lighting with a clean white background' },
    { name: 'Dramatic Rim Light', prompt: 'dramatic rim lighting that outlines the subject with a bright light from behind' },
    { name: 'Cinematic Three-Point', prompt: 'classic cinematic three-point lighting for a balanced, dimensional look' },
    { name: 'Bold Color Gels', prompt: 'creative studio lighting using bold color gels (e.g., pink and blue) for a vibrant, modern feel' },
    { name: 'Low-Key Moody', prompt: 'dark, low-key lighting that creates a moody and mysterious atmosphere' },
];

const backgrounds: Selection[] = [
    { name: 'Gray Backdrop', prompt: 'in a professional studio with a minimalist gray backdrop' },
    { name: 'Exposed Brick Wall', prompt: 'in a studio with a textured, exposed brick wall background' },
    { name: 'Warm Gradient', prompt: 'in front of a smooth, warm-toned (e.g., orange to yellow) gradient studio backdrop' },
    { name: 'Cool Gradient', prompt: 'in front of a smooth, cool-toned (e.g., blue to purple) gradient studio backdrop' },
    { name: 'Textured Concrete', prompt: 'against a minimalist, textured concrete wall for a modern, industrial look' },
    { name: 'Modern Office', prompt: 'in a sleek, modern office interior with large windows' },
    { name: 'Lush Garden', prompt: 'in a beautiful, lush garden with soft, natural light' },
    { name: 'Misty Forest', prompt: 'in a misty, atmospheric forest at dawn' },
    { name: 'Abstract Swirls', prompt: 'against a dynamic background of abstract, colorful swirls of light' },
    { name: 'Geometric Shapes', prompt: 'against a minimalist background of clean, geometric shapes' },
    { name: 'Giza Pyramids', prompt: 'standing before the majestic Giza Pyramids at sunset' },
    { name: 'Louvre Museum', prompt: 'inside the Louvre Museum, with classic art in the background' },
];

const StudioPanel: React.FC<StudioPanelProps> = ({ onGenerateStudioPortrait, isLoading, onOpenHistory, onAddToHistory }) => {
    const [selectedStyle, setSelectedStyle] = useState<Selection | null>(styles[0]);
    const [attireCategory, setAttireCategory] = useState<string>('Professional');
    const [selectedAttire, setSelectedAttire] = useState<Selection | null>(attireCategories['Professional'][0]);
    const [selectedLighting, setSelectedLighting] = useState<Selection | null>(lightings[0]);
    const [selectedBackground, setSelectedBackground] = useState<Selection | null>(backgrounds[0]);
    const [customBackgroundPrompt, setCustomBackgroundPrompt] = useState('');
    
    const handleGenerate = () => {
        let backgroundDescription = '';
        if (customBackgroundPrompt.trim()) {
            onAddToHistory(customBackgroundPrompt.trim());
            backgroundDescription = `against a custom background described as: "${customBackgroundPrompt.trim()}"`;
        } else if (selectedBackground) {
            backgroundDescription = selectedBackground.prompt;
        }

        if (selectedStyle && selectedAttire && selectedLighting && backgroundDescription) {
            const finalPrompt = `Create ${selectedStyle.prompt}. The subject is ${selectedAttire.prompt}. The setting is ${backgroundDescription}, illuminated by ${selectedLighting.prompt}.`;
            onGenerateStudioPortrait(finalPrompt);
        }
    };
    
    const isReady = selectedStyle && selectedAttire && selectedLighting && (selectedBackground || customBackgroundPrompt.trim());

    const renderSelectionGrid = (
        options: Selection[], 
        selected: Selection | null, 
        setter: React.Dispatch<React.SetStateAction<Selection | null>>,
        onSelect?: () => void,
    ) => (
        <div className="grid grid-cols-2 gap-3">
            {options.map(option => (
                <button
                    key={option.name}
                    onClick={() => {
                        setter(option);
                        onSelect?.();
                    }}
                    disabled={isLoading}
                    className={`text-center bg-white/10 text-gray-200 font-semibold py-3 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selected?.name === option.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
                >
                    {option.name}
                </button>
            ))}
        </div>
    );

    const renderAttireSection = () => (
        <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-gray-400 text-sm">2. Select Attire</h4>
            <div className="flex w-full bg-gray-900/50 p-1 rounded-lg text-xs overflow-x-auto">
              {Object.keys(attireCategories).map(category => (
                <button
                  key={category}
                  onClick={() => {
                      setAttireCategory(category);
                      setSelectedAttire(attireCategories[category][0]); // Select first item in new category
                  }}
                  className={`flex-shrink-0 px-3 py-2 font-semibold rounded-md transition ${attireCategory === category ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
                {attireCategories[attireCategory].map(option => (
                    <button
                        key={option.name}
                        onClick={() => setSelectedAttire(option)}
                        disabled={isLoading}
                        className={`text-center bg-white/10 text-gray-200 font-semibold py-3 px-3 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedAttire?.name === option.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
                    >
                        {option.name}
                    </button>
                ))}
            </div>
        </div>
    );


    return (
        <div className="w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300">AI Portrait Studio</h3>
                <p className="text-sm text-gray-400 mt-1">Design your professional portrait.</p>
            </div>
            
            <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-gray-400 text-sm">1. Select Style</h4>
                {renderSelectionGrid(styles, selectedStyle, setSelectedStyle)}
            </div>

            {renderAttireSection()}

            <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-gray-400 text-sm">3. Select Lighting</h4>
                {renderSelectionGrid(lightings, selectedLighting, setSelectedLighting)}
            </div>

            <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-gray-400 text-sm">4. Select Background</h4>
                {renderSelectionGrid(backgrounds, selectedBackground, setSelectedBackground, () => setCustomBackgroundPrompt(''))}
                <div className="relative mt-2">
                     <input
                        type="text"
                        value={customBackgroundPrompt}
                        onChange={(e) => {
                            setCustomBackgroundPrompt(e.target.value);
                            setSelectedBackground(null);
                        }}
                        placeholder="Or describe a custom background..."
                        className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => onOpenHistory(setCustomBackgroundPrompt)}
                        title="Prompt History"
                        aria-label="Open prompt history"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
                        disabled={isLoading}
                    >
                        <HistoryIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <div className="border-t border-gray-700/50 mt-2"></div>
            
            <button
                onClick={handleGenerate}
                disabled={isLoading || !isReady}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                Generate Portrait
            </button>
        </div>
    );
};

export default StudioPanel;