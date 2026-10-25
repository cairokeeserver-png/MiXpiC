/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { generateFilteredImage, generateAdjustedImage, generateBackgroundRemovedImage } from '../services/geminiService';
import { UploadIcon, PaletteIcon, SunIcon, SparklesIcon, DownloadIcon, CheckCircleIcon, XCircleIcon, DashCircleIcon } from './icons';
import Spinner from './Spinner';

interface BatchEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type BatchFile = {
    id: string;
    file: File;
    preview: string;
};

type ResultStatus = 'queued' | 'processing' | 'done' | 'error' | 'cancelled';
type StatusMap = Record<string, { status: ResultStatus, dataUrl?: string, error?: string }>;

const operations = {
    filter: {
        name: 'Apply Filter',
        icon: PaletteIcon,
        presets: [
            // Color Grades
            { name: 'Teal & Orange', prompt: 'Apply a cinematic teal and orange color grade. Push cool tones in the shadows towards teal and warm tones, especially skin tones, towards orange for a high-contrast, professional look.' },
            { name: 'Golden Hour', prompt: "Recreate the warm, soft, and golden lighting of the hour just after sunrise or before sunset. Enhance golden hues and soften shadows." },
            { name: 'Cool Blues', prompt: 'Apply a cool cinematic color grade. Shift the shadows and mid-tones towards blue and cyan, while slightly desaturating warmer colors for a modern, moody feel.' },
            { name: 'Cinematic Matte', prompt: 'Apply a cinematic matte color grade. Reduce contrast slightly, shift the mid-tones towards a desaturated, slightly warm tone, and crush the blacks for a moody, filmic look.' },
            
            // Vintage & Film
            { name: 'Vintage Film', prompt: 'Emulate the look of vintage 1970s cinema. Apply a warm, slightly faded color grade with soft contrast, muted colors, and a gentle film grain.' },
            { name: 'Vintage Polaroid', prompt: 'Apply a vintage Polaroid effect with faded colors, a slight yellow tint, and soft focus.' },
            { name: 'Sepia Tone', prompt: 'Apply a classic sepia tone filter, giving the image a warm, brownish monochrome look reminiscent of early photography.' },
            
            // Black & White
            { name: 'Leica B&W', prompt: 'Convert the image to a high-contrast, grainy Leica-style black and white, reminiscent of classic street photography.' },
            { name: 'Harcourt B&W', prompt: 'Apply a classic, dramatic Harcourt Studio-style black and white portrait effect. Use sharp, focused lighting with deep, rich shadows to create a timeless, glamorous Hollywood look.' },
            { name: 'Dramatic B&W', prompt: 'Convert the image to a dramatic, high-contrast black and white. Deepen the blacks and brighten the whites to create a bold, impactful monochrome image.' },
            
            // Artistic
            { name: 'Cyberpunk Neon', prompt: 'Apply a vibrant cyberpunk aesthetic with neon magenta and cyan glows, deep contrast, and crushed blacks. Enhance reflections and bright lights.' },
            { name: 'Infrared Glow', prompt: 'Simulate the look of infrared photography. Make foliage bright white and skies dark and dramatic, creating a surreal, ethereal landscape.' },
            { name: 'Cross-Process', prompt: 'Apply a cross-processing (X-Pro) film effect. Shift the color balance significantly, creating high contrast and unnatural, vibrant colors, often with a green or blue tint in the shadows.' },
            { name: 'Lomography', prompt: 'Apply a Lomo camera effect with high color saturation, vignetting, and a slight blur for a quirky, artistic look.' },
        ],
        service: generateFilteredImage,
    },
    adjustment: {
        name: 'Apply Adjustment',
        icon: SunIcon,
        presets: [
            { name: 'Auto Enhance', prompt: 'Perform an automatic enhancement of the image, adjusting color balance, brightness, contrast, and saturation to professional standards. Fix exposure and apply subtle HDR effects.' },
            { name: 'Portrait Blur', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
            { name: 'Portrait Light', prompt: 'Add dramatic, professional portrait lighting to the main subject, enhancing highlights and shadows.' },
            { name: 'AI Enhance Face', prompt: 'Task: Enhance face with photographic realism. This is a corrective, non-deceptive edit to improve image quality. Improve sharpness and clarity, reduce noise, and correct minor camera-induced imperfections like red-eye or minor distortions. The goal is a natural, high-quality portrait that strictly preserves the person\\\'s identity and does not alter their features.'},
            { name: 'Face Restoration', prompt: 'Task: High-fidelity photographic face restoration. This is a corrective, non-deceptive edit to fix technical image flaws. Focus on improving sharpness, reducing noise, and correcting camera-induced artifacts (like red-eye or minor lens distortion). Strictly preserve the original identity, facial structure, and characteristics.' },
            { name: 'Restore Face', prompt: 'Task: High-fidelity photographic face restoration. This is a corrective, non-deceptive edit to fix technical artifacts. Detect any faces and restore their features. Correct common AI-generated or photographic artifacts, such as distorted eyes, noses, and mouths. The result must be photorealistic and strictly preserve the person\\\'s original identity and characteristics. Do not change any other part of the image or alter the person\\\'s identity.'},
        ],
        service: generateAdjustedImage,
    },
    utility: {
        name: 'Apply Utility',
        icon: SparklesIcon,
        presets: [
            { name: 'Upscale x2', prompt: 'Upscale image 2x, enhancing details and sharpness for higher quality.' },
            { name: 'Remove Background', prompt: '' }, // Special case
        ],
        // Service determined by preset
    },
};

type OperationType = keyof typeof operations;

const BatchEditModal: React.FC<BatchEditModalProps> = ({ isOpen, onClose }) => {
    const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
    const [statuses, setStatuses] = useState<StatusMap>({});
    const [activeOperation, setActiveOperation] = useState<OperationType>('filter');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const isCancelledRef = useRef(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Use a ref to keep track of the latest batchFiles to prevent stale closures in cleanup functions.
    const batchFilesRef = useRef(batchFiles);
    useEffect(() => {
        batchFilesRef.current = batchFiles;
    });

    useEffect(() => {
        // On unmount, revoke all object URLs to prevent memory leaks.
        return () => {
            batchFilesRef.current.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, []);

    if (!isOpen) return null;

    const resetState = () => {
        // Use the ref for cleanup to ensure we have the latest list of files.
        batchFilesRef.current.forEach(f => URL.revokeObjectURL(f.preview));
        setBatchFiles([]);
        setStatuses({});
        setSelectedPreset(null);
        setCustomPrompt('');
        setIsProcessing(false);
        setCompletedCount(0);
        isCancelledRef.current = false;
        onClose();
    };

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const newBatchFiles: BatchFile[] = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => {
                const id = crypto.randomUUID();
                return { id, file, preview: URL.createObjectURL(file) };
            });
        
        setBatchFiles(prev => [...prev, ...newBatchFiles]);
        setStatuses(prev => {
            const newStatuses: StatusMap = {};
            newBatchFiles.forEach(f => {
                newStatuses[f.id] = { status: 'queued' };
            });
            return { ...prev, ...newStatuses };
        });
    };

    const removeFile = (idToRemove: string) => {
        setBatchFiles(prev => prev.filter(f => {
            if (f.id === idToRemove) {
                URL.revokeObjectURL(f.preview);
                return false;
            }
            return true;
        }));
        setStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[idToRemove];
            return newStatuses;
        });
    };

    const handleStartProcessing = async () => {
        const finalPrompt = customPrompt.trim() || selectedPreset;
        if (!finalPrompt) return;

        setIsProcessing(true);
        isCancelledRef.current = false;
        setCompletedCount(0);

        // Reset statuses to queued before starting
        const initialStatuses: StatusMap = {};
        batchFiles.forEach(f => {
            initialStatuses[f.id] = { status: 'queued' };
        });
        setStatuses(initialStatuses);
        
        for (let i = 0; i < batchFiles.length; i++) {
            if (isCancelledRef.current) {
                 setStatuses(prev => {
                    const newStatuses = {...prev};
                    for (let j = i; j < batchFiles.length; j++) {
                        const file = batchFiles[j];
                        if (newStatuses[file.id]?.status === 'queued') {
                             newStatuses[file.id] = { status: 'cancelled' };
                        }
                    }
                    return newStatuses;
                });
                break;
            }

            const currentFile = batchFiles[i];
            setStatuses(prev => ({ ...prev, [currentFile.id]: { status: 'processing' } }));

            try {
                let resultDataUrl: string;
                if (finalPrompt === 'Remove Background') {
                    resultDataUrl = await generateBackgroundRemovedImage(currentFile.file);
                } else {
                    let service: (file: File, prompt: string) => Promise<string>;
                    switch (activeOperation) {
                        case 'filter':
                            service = operations.filter.service;
                            break;
                        case 'adjustment':
                            service = operations.adjustment.service;
                            break;
                        case 'utility':
                            service = generateAdjustedImage;
                            break;
                        default:
                            throw new Error(`Invalid operation: ${activeOperation}`);
                    }
                    resultDataUrl = await service(currentFile.file, finalPrompt);
                }
                
                setStatuses(prev => ({ ...prev, [currentFile.id]: { status: 'done', dataUrl: resultDataUrl } }));
            } catch (e: any) {
                console.error(`Failed to process ${currentFile.file.name}:`, e);
                setStatuses(prev => ({ ...prev, [currentFile.id]: { status: 'error', error: e.message || 'An unknown error occurred.' } }));
            }
            setCompletedCount(prev => prev + 1);
        }
        setIsProcessing(false);
    };

    const handleCancel = () => {
        isCancelledRef.current = true;
        setIsProcessing(false);
    };

    const handleDownload = (id: string) => {
        const status = statuses[id];
        const file = batchFiles.find(f => f.id === id);
        if (status?.status === 'done' && status.dataUrl && file) {
            const link = document.createElement('a');
            link.href = status.dataUrl;
            const nameParts = file.file.name.split('.');
            nameParts.pop();
            const name = nameParts.join('.');
            link.download = `${name}-edited.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isReadyToProcess = (batchFiles.length > 0) && (selectedPreset || customPrompt.trim());
    
    const showStatusIndicators = isProcessing || completedCount > 0;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99] animate-fade-in"
            onClick={resetState}
        >
            <div 
                className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] text-gray-200 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700/50 flex-shrink-0">
                    <h2 className="text-xl font-bold">Batch Editor</h2>
                    <button onClick={resetState} className="text-2xl text-gray-400 hover:text-white transition-colors">&times;</button>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Image Area */}
                    <div className="w-2/3 flex flex-col p-4 overflow-hidden">
                        {batchFiles.length === 0 ? (
                             <div 
                                className={`w-full h-full flex flex-col items-center justify-center text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-gray-700/50 border-dashed'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                                onDragLeave={() => setIsDraggingOver(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); handleFileChange(e.dataTransfer.files); }}
                            >
                                <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-200">Select Images</h3>
                                <p className="text-gray-400">Drag & drop files here or click the button below.</p>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-6 inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 transition-colors">
                                    Select Images
                                </button>
                                <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/*" />
                            </div>
                        ) : (
                            <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2">
                                {batchFiles.map(bf => {
                                    const statusInfo = statuses[bf.id];
                                    const status = statusInfo?.status;

                                    return (
                                        <div key={bf.id} className="relative aspect-square bg-black/20 rounded-lg overflow-hidden group">
                                            <img src={status === 'done' && statusInfo.dataUrl ? statusInfo.dataUrl : bf.preview} alt={bf.file.name} className="w-full h-full object-cover" />
                                            
                                            {showStatusIndicators && (
                                                <>
                                                    {status === 'processing' && (
                                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center backdrop-blur-sm">
                                                            <div className="w-10 h-10"><Spinner /></div>
                                                            <p className="text-sm font-semibold text-white mt-2 animate-pulse">Processing...</p>
                                                        </div>
                                                    )}
                                                    {status === 'error' && (
                                                        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center p-2 text-center backdrop-blur-sm">
                                                            <XCircleIcon className="w-8 h-8 text-red-300 mb-2 flex-shrink-0" />
                                                            <p className="text-sm font-semibold text-red-200">Failed</p>
                                                            <div className="text-xs text-red-300 mt-1 w-full overflow-y-auto">
                                                                <p title={statusInfo.error}>{statusInfo.error}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(status === 'queued' || status === 'done' || status === 'cancelled') && (
                                                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/70 text-xs font-semibold backdrop-blur-sm">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {status === 'queued' && <>
                                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                                    <span className="text-gray-300">Queued</span>
                                                                </>}
                                                                {status === 'done' && <>
                                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                                    <span className="text-green-300">Done</span>
                                                                </>}
                                                                {status === 'cancelled' && <>
                                                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                                                    <span className="text-gray-400">Cancelled</span>
                                                                </>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {(!isProcessing && status !== 'processing') && (
                                                <button onClick={() => removeFile(bf.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            )}

                                            {status === 'done' && (
                                                <button onClick={() => handleDownload(bf.id)} className="absolute top-1 left-1 bg-blue-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500" title="Download Image">
                                                    <DownloadIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Controls Panel */}
                    <aside className="w-1/3 bg-gray-900/30 border-l border-gray-700/50 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-base font-semibold text-gray-300">1. Select Operation Type</h3>
                             <div className="flex w-full bg-gray-900/50 p-1 rounded-lg">
                                {Object.keys(operations).map(key => {
                                    const op = operations[key as OperationType];
                                    return (
                                        <button key={key} onClick={() => { setActiveOperation(key as OperationType); setSelectedPreset(null); setCustomPrompt(''); }} disabled={isProcessing} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md transition-all duration-200 text-sm font-semibold ${activeOperation === key ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:bg-white/10'}`}>
                                            <op.icon className="w-5 h-5" /> {op.name.split(' ')[1]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                             <h3 className="text-base font-semibold text-gray-300">2. Configure Operation</h3>
                             <div className="grid grid-cols-1 gap-2">
                                {operations[activeOperation].presets.map(preset => (
                                    <button key={preset.name} onClick={() => { setSelectedPreset(preset.prompt || preset.name); setCustomPrompt(''); }} disabled={isProcessing} className={`w-full text-left p-3 rounded-md transition-colors text-sm font-medium ${selectedPreset === (preset.prompt || preset.name) ? 'bg-blue-500/30 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
                                        {preset.name}
                                    </button>
                                ))}
                             </div>
                             {(activeOperation === 'filter' || activeOperation === 'adjustment') &&
                                <>
                                    <p className="text-center text-xs text-gray-500">OR</p>
                                    <textarea value={customPrompt} onChange={e => { setCustomPrompt(e.target.value); setSelectedPreset(null); }} placeholder="Describe a custom operation..." disabled={isProcessing} rows={3} className="bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full text-sm resize-none" />
                                </>
                             }
                        </div>

                        <div className="flex-grow"></div>

                        <div className="flex flex-col gap-4">
                             <h3 className="text-base font-semibold text-gray-300">3. Process Images</h3>
                             {isProcessing ? (
                                 <button onClick={handleCancel} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-5 rounded-lg transition-all">
                                    Cancel
                                 </button>
                             ) : (
                                <button onClick={handleStartProcessing} disabled={!isReadyToProcess} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-lg transition-all disabled:bg-blue-800 disabled:cursor-not-allowed">
                                    Start Batch Edit ({batchFiles.length})
                                </button>
                             )}
                        </div>
                    </aside>
                </div>
                
                {/* Footer / Progress Bar */}
                {(isProcessing || completedCount > 0) && (
                    <div className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-900/30" role="status" aria-live="polite">
                        <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
                            <span className={isProcessing ? 'animate-pulse' : ''}>{isProcessing ? "Processing..." : "Complete"}</span>
                            <span>{completedCount} / {batchFiles.length}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5 shadow-inner" aria-label="Overall batch progress">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full" 
                                style={{ width: `${(completedCount / (batchFiles.length || 1)) * 100}%`, transition: 'width 0.5s ease' }}
                                role="progressbar"
                                aria-valuenow={completedCount}
                                aria-valuemin={0}
                                aria-valuemax={batchFiles.length}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchEditModal;