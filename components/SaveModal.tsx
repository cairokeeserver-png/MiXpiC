/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    defaultFileName: string;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, imageFile, defaultFileName }) => {
    const [quality, setQuality] = useState(92);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen || !imageFile) return null;

    const handleDownload = async () => {
        if (!imageFile) return;
        setIsDownloading(true);

        try {
            const imageURL = URL.createObjectURL(imageFile);
            await new Promise<void>((resolve, reject) => {
                const image = new Image();
                image.src = imageURL;
                image.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = image.naturalWidth;
                        canvas.height = image.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Could not get canvas context');
                        
                        ctx.drawImage(image, 0, 0);
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        link.download = `${defaultFileName}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        URL.revokeObjectURL(imageURL);
                        onClose();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                image.onerror = reject;
            });
        } catch (error) {
            console.error("Failed to download image:", error);
            // Optionally set an error state to show to the user
        } finally {
            setIsDownloading(false);
        }
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
                    <h2 className="text-xl font-bold">Save Image</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white transition-colors">&times;</button>
                </div>
                
                <div className="space-y-6">
                    {/* Quality Slider */}
                    <div className="flex flex-col gap-2 pt-2">
                        <label htmlFor="quality-slider" className="text-sm font-medium text-gray-400 flex justify-between">
                            <span>JPEG Quality</span>
                            <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">{quality}%</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Low</span>
                            <input
                                id="quality-slider"
                                type="range"
                                min="50"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-xs text-gray-500">High</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Preparing...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5" /> Download as JPEG
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveModal;