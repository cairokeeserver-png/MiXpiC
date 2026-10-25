/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { RotateLeftIcon, RotateRightIcon } from './icons';

type AspectRatio = 'Free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  onZoomToFill: () => void;
  onRotate: (direction: 'left' | 'right') => void;
  isLoading: boolean;
  isCropping: boolean;
  onResetCrop: () => void;
}

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onSetAspect, onZoomToFill, onRotate, isLoading, isCropping, onResetCrop }) => {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>('Free');

  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
  }

  const aspects: { name: AspectRatio, value: number | undefined }[] = [
    { name: 'Free', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '3:4', value: 3 / 4 },
    { name: '16:9', value: 16 / 9 },
    { name: '9:16', value: 9 / 16 },
  ];

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-6 flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-center text-gray-300">Crop & Rotate</h3>
      
      {/* Aspect Ratio */}
      <div className="w-full flex flex-col gap-3">
          <h4 className="font-semibold text-gray-400 text-sm">Aspect Ratio</h4>
          <div className="flex w-full bg-gray-900/50 p-1 rounded-lg">
              {aspects.map(({ name, value }) => (
                  <button
                      key={name}
                      onClick={() => handleAspectChange(name, value)}
                      disabled={isLoading}
                      className={`flex-1 p-2 rounded-md transition-all duration-200 text-sm font-semibold text-center ${activeAspect === name ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}
                  >
                      {name}
                  </button>
              ))}
          </div>
      </div>
      
      {/* Rotate */}
      <div className="w-full flex flex-col gap-3">
          <h4 className="font-semibold text-gray-400 text-sm">Rotate</h4>
          <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={() => onRotate('left')}
                  disabled={isLoading}
                  className="p-3 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  title="Rotate Counter-Clockwise"
              >
                  <RotateLeftIcon className="w-5 h-5" /> 90&deg;
              </button>
              <button
                  onClick={() => onRotate('right')}
                  disabled={isLoading}
                  className="p-3 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  title="Rotate Clockwise"
              >
                  <RotateRightIcon className="w-5 h-5" /> 90&deg;
              </button>
          </div>
      </div>
      
      <div className="border-t border-gray-700/50 w-full my-2"></div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
          <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={onZoomToFill}
                  disabled={isLoading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-5 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Zoom to Fill
              </button>
              <button
                  onClick={onResetCrop}
                  disabled={isLoading || !isCropping}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-5 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Reset Crop
              </button>
          </div>
          <button
              onClick={onApplyCrop}
              disabled={isLoading || !isCropping}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-5 rounded-lg transition-all text-base disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
              Apply Crop
          </button>
      </div>
    </div>
  );
};

export default CropPanel;