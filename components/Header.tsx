/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UploadIcon, LogoIcon, StackIcon, KeyboardIcon } from './icons';

interface HeaderProps {
    onFileSelect: (files: FileList | null) => void;
    isLoading: boolean;
    onBatchEditClick: () => void;
    onShortcutsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onFileSelect, isLoading, onBatchEditClick, onShortcutsClick }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileSelect(e.target.files);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <header className="flex-shrink-0 bg-gray-900/50 border-b border-gray-700/50 p-2 flex justify-between items-center backdrop-blur-sm z-50">
            <div className="flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-xl font-bold text-gray-100 tracking-tight">mokhles editor pro</h1>
            </div>
            <div className="flex items-center gap-3">
                {onShortcutsClick && (
                    <button
                        onClick={onShortcutsClick}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2 px-3 rounded-md transition-all duration-200 text-xs border border-white/10"
                        title="Keyboard Shortcuts (?)"
                    >
                        <KeyboardIcon className="w-4 h-4 text-blue-400" />
                        <span>Shortcuts</span>
                        <kbd className="text-[10px] bg-black/40 px-1 py-0.5 rounded border border-white/10 font-mono text-gray-400">?</kbd>
                    </button>
                )}
                <button
                    onClick={onBatchEditClick}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-white/10 text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Process multiple images"
                >
                    <StackIcon className="w-5 h-5" />
                    Batch Edit
                </button>
                <button
                    onClick={handleButtonClick}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-blue-500 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload an image"
                >
                    <UploadIcon className="w-5 h-5" />
                    Upload Image
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                />
            </div>
        </header>
    );
};

