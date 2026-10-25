/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import type { CustomFilter } from './App';

const AdjustmentSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, unit = '%', onChange }) => (
  <div className="flex flex-col gap-2 pt-2">
    <label htmlFor={`${label}-slider`} className="text-sm font-medium text-gray-400 flex justify-between">
      <span>{label}</span>
      <span className="font-mono">{value}{unit}</span>
    </label>
    <input
      id={`${label}-slider`}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);


interface CustomFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (filter: CustomFilter) => void;
    filterToEdit?: CustomFilter | null;
}

const CustomFilterModal: React.FC<CustomFilterModalProps> = ({ isOpen, onClose, onSave, filterToEdit }) => {
    const [name, setName] = useState('');
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [sharpness, setSharpness] = useState(0);

    useEffect(() => {
        if (filterToEdit) {
            setName(filterToEdit.name);
            setBrightness(filterToEdit.settings.brightness);
            setContrast(filterToEdit.settings.contrast);
            setSaturation(filterToEdit.settings.saturation);
            setSharpness(filterToEdit.settings.sharpness);
        } else {
            // Reset for new filter
            setName('');
            setBrightness(0);
            setContrast(0);
            setSaturation(0);
            setSharpness(0);
        }
    }, [filterToEdit, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newFilter: CustomFilter = {
            id: filterToEdit?.id || crypto.randomUUID(),
            name: name.trim() || 'Untitled Filter',
            settings: {
                brightness,
                contrast,
                saturation,
                sharpness
            }
        };
        onSave(newFilter);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99] animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md text-gray-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{filterToEdit ? 'Edit Filter' : 'Create Custom Filter'}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="filter-name" className="text-sm font-medium text-gray-400">Filter Name</label>
                        <input
                            id="filter-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., 'My Moody Look'"
                            className="mt-1 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full text-base"
                        />
                    </div>

                    <AdjustmentSlider label="Brightness" value={brightness} min={-100} max={100} onChange={setBrightness} />
                    <AdjustmentSlider label="Contrast" value={contrast} min={-100} max={100} onChange={setContrast} />
                    <AdjustmentSlider label="Saturation" value={saturation} min={-100} max={100} onChange={setSaturation} />
                    <AdjustmentSlider label="Sharpness" value={sharpness} min={0} max={100} onChange={setSharpness} />

                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Save Filter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomFilterModal;
