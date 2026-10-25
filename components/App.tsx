
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { 
    generateEditedImage, 
    generateFilteredImage, 
    generateAdjustedImage, 
    generateInpaintedImage, 
    generateBackgroundRemovedImage, 
    generateHairStyle, 
    generateStudioPortrait, 
    generateImageFromText, 
    generateWithThinkingMode,
    generateImagesPro,
    analyzeMedia,
    generateSpeech,
    generateAvatar
} from '../services/geminiService';
import { Header } from './Header';
import Spinner from './Spinner';
import FilterPanel from './FilterPanel';
import AdjustmentPanel from './AdjustmentPanel';
import EnhancePanel from './EnhancePanel';
import { UndoIcon, RedoIcon, EyeIcon, BullseyeIcon, PaletteIcon, SunIcon, SparklesIcon, CropIcon, DownloadIcon, HairIcon, ResetIcon, ColorSwatchIcon, StudioIcon, PlusCircleIcon, HistoryIcon, BrainIcon, SearchIcon, AudioSparkIcon, AvatarIcon, TypeIcon, StackIcon, ZoomInIcon, KeyboardIcon } from './icons';
import StartScreen from './StartScreen';
import EditorDisplay from './EditorDisplay';
import RetouchPanel from './RetouchPanel';
import HairPanel from './HairPanel';
import CropPanel from './CropPanel';
import ColorGradingPanel from './ColorGradingPanel';
import SaveModal from './SaveModal';
import StudioPanel from './StudioPanel';
import BatchEditModal from './BatchEditModal';
import HistoryPanel from './HistoryPanel';
import ThinkingModePanel from './ThinkingModePanel';
import AvatarPanel from './AvatarPanel';
import PromptHistoryModal from './PromptHistoryModal';
import CustomFilterModal from './CustomFilterModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import TextPanel from './TextPanel';
import DrawPanel from './DrawPanel';
import LayersPanel from './LayersPanel';
import { transformImageFile, type FilterPreset, type AdjustmentOptions } from '../services/imageFilters';


const MAX_HISTORY_SIZE = 25; 

export interface LayerTransform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    skewX: number;
    skewY: number;
}

export interface Layer {
    id: string;
    name: string;
    file: File;
    visible: boolean;
    opacity: number;
    blendMode: string;
    mask?: string | null;
    transform?: LayerTransform;
}

export interface HistoryItem {
    layers: Layer[];
    label: string;
    timestamp: number;
}

// Define and export missing types used by other components
export type RetouchTool = 'point' | 'erase' | 'fill' | 'background';
export type EraseMode = 'smart' | 'manual';
export type BrushShape = 'round' | 'square';

export interface CustomFilter {
    id: string;
    name: string;
    settings: {
        brightness: number;
        contrast: number;
        saturation: number;
        sharpness: number;
    };
}

export interface PromptRecord {
    prompt: string;
    lastUsed: number;
    count: number;
}

export type Tab = 'retouch' | 'avatar' | 'filters' | 'adjust' | 'enhance' | 'crop' | 'hair' | 'studio' | 'grading' | 'generate' | 'thinking' | 'analyze' | 'speech' | 'text' | 'draw' | 'layers' | 'history';

export interface TextOverlay {
    text: string;
    font: string;
    size: number;
    color: string;
    opacity: number;
    x: number;
    y: number;
}

export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Invalid data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
}

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isStateLoaded, setIsStateLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('retouch');
  
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayHotspot, setDisplayHotspot] = useState<{ x: number, y: number } | null>(null);
  const [eraseMask, setEraseMask] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [brushOpacity, setBrushOpacity] = useState(0.7);
  const [brushShape, setBrushShape] = useState<BrushShape>('round');
  const [eraseMode, setEraseMode] = useState<EraseMode>('smart');
  const [activeRetouchTool, setActiveRetouchTool] = useState<RetouchTool>('point');

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [isComparing, setIsComparing] = useState(false);
  const [isColorPicking, setIsColorPicking] = useState<boolean>(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [isEyePicking, setIsEyePicking] = useState<boolean>(false);
  const [eyeHotspot, setEyeHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayEyeHotspot, setDisplayEyeHotspot] = useState<{ x: number, y: number } | null>(null);
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isBatchEditModalOpen, setIsBatchEditModalOpen] = useState(false);
  const [isCustomFilterModalOpen, setIsCustomFilterModalOpen] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [filterToEdit, setFilterToEdit] = useState<CustomFilter | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  // Prompt history and thinking response state
  const [promptHistory, setPromptHistory] = useState<PromptRecord[]>([]);
  const [isPromptHistoryOpen, setIsPromptHistoryOpen] = useState(false);
  const [activePromptSetter, setActivePromptSetter] = useState<((p: string) => void) | null>(null);
  const [thinkingResponse, setThinkingResponse] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [freehandDrawing, setFreehandDrawing] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const editorDisplayRef = useRef<{ clearMask: () => void, clearFreehand: () => void }>(null);

  useEffect(() => {
    setIsStateLoaded(true);
  }, []);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [shortcutNotification, setShortcutNotification] = useState<{ text: string, key: string } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback((text: string, key: string) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setShortcutNotification({ text, key });
    notificationTimeoutRef.current = setTimeout(() => {
      setShortcutNotification(null);
    }, 1500);
  }, []);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const currentLayers = history[historyIndex]?.layers || [];
  const currentImage = currentLayers.length > 0 ? currentLayers[currentLayers.length - 1].file : undefined;
  const originalImage = history[0]?.layers[0]?.file;

  useEffect(() => {
    const displayFile = isComparing ? originalImage : currentImage;
    if (!displayFile) { setImageSrc(''); return; }
    const url = URL.createObjectURL(displayFile);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [currentImage, originalImage, isComparing]);

  const addToHistory = useCallback((newLayers: Layer[], label: string) => {
    setHistory(prev => {
        const base = prev.slice(0, historyIndex + 1);
        const next = [...base, { layers: newLayers, label, timestamp: Date.now() }];
        return next.slice(-MAX_HISTORY_SIZE);
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    setLayers(newLayers);
  }, [historyIndex]);

  useEffect(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
        setLayers(history[historyIndex].layers);
    }
  }, [historyIndex, history]);

  // Keep selectedLayerIds in sync when active layer changes
  useEffect(() => {
    if (activeLayerId) {
      setSelectedLayerIds(prev => prev.length === 0 ? [activeLayerId] : prev);
    }
  }, [activeLayerId]);

  // Global Keyboard Shortcut Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]')
        )
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Escape key - close open modals
      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsSaveModalOpen(false);
        setIsBatchEditModalOpen(false);
        setIsCustomFilterModalOpen(false);
        setIsPromptHistoryOpen(false);
        return;
      }

      // '?' key or Shift + / -> toggle shortcuts guide
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
        return;
      }

      // Undo: Ctrl/Cmd + Z (without Shift)
      if (isCmdOrCtrl && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          setHistoryIndex(h => Math.max(0, h - 1));
          showNotification('Undo', isMac ? '⌘Z' : 'Ctrl+Z');
        }
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        (isCmdOrCtrl && (e.key === 'z' || e.key === 'Z') && e.shiftKey) ||
        (isCmdOrCtrl && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          setHistoryIndex(h => Math.min(history.length - 1, h + 1));
          showNotification('Redo', isMac ? '⌘⇧Z' : 'Ctrl+Shift+Z');
        }
        return;
      }

      // Reset Zoom / Pan (0 or Ctrl + 0)
      if (e.key === '0' || (isCmdOrCtrl && e.key === '0')) {
        e.preventDefault();
        setScale(1);
        setPan({ x: 0, y: 0 });
        showNotification('Reset View', '0');
        return;
      }

      // Zoom In (+ or =)
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale(s => Math.min(s + 0.25, 5));
        return;
      }

      // Zoom Out (-)
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale(s => Math.max(s - 0.25, 0.2));
        return;
      }

      // Don't trigger letter hotkeys if Ctrl/Cmd/Alt is held
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Tool Switching Hotkeys
      const key = e.key.toLowerCase();
      switch (key) {
        case 'r':
          e.preventDefault();
          setActiveTab('retouch');
          showNotification('Retouch Tool', 'R');
          break;
        case 'l':
          e.preventDefault();
          setActiveTab('layers');
          showNotification('Layers Panel', 'L');
          break;
        case 'f':
          e.preventDefault();
          setActiveTab('filters');
          showNotification('Filters Panel', 'F');
          break;
        case 'a':
          e.preventDefault();
          setActiveTab('adjust');
          showNotification('Adjustments', 'A');
          break;
        case 'c':
          e.preventDefault();
          setActiveTab('crop');
          showNotification('Crop Tool', 'C');
          break;
        case 'd':
          e.preventDefault();
          setActiveTab('draw');
          showNotification('Draw & Mask', 'D');
          break;
        case 't':
          e.preventDefault();
          setActiveTab('text');
          showNotification('Text Tool', 'T');
          break;
        case 'h':
          e.preventDefault();
          setActiveTab('history');
          showNotification('History Panel', 'H');
          break;
        case 'e':
          e.preventDefault();
          setActiveTab('enhance');
          showNotification('Magic Enhance', 'E');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length, showNotification]);

  // Batch Filter & Adjustment Handlers
  const handleBatchApplyFilter = async (targetLayerIds: string[], filterPreset: FilterPreset) => {
    if (targetLayerIds.length === 0) return;
    setIsLoading(`Applying ${filterPreset.name} to ${targetLayerIds.length} layers...`);
    try {
      const updatedLayers = await Promise.all(
        layers.map(async (layer) => {
          if (!targetLayerIds.includes(layer.id)) return layer;
          const newFile = await transformImageFile(layer.file, filterPreset.cssFilter);
          return {
            ...layer,
            file: newFile,
          };
        })
      );
      setLayers(updatedLayers);
      addToHistory(updatedLayers, `Batch Filter: ${filterPreset.name} (${targetLayerIds.length} layers)`);
      showNotification(`Applied ${filterPreset.name}`, `${targetLayerIds.length} layers`);
    } catch (e: any) {
      setError(e.message || "Failed to apply filter to selected layers");
    } finally {
      setIsLoading(null);
    }
  };

  const handleBatchApplyAdjustment = async (targetLayerIds: string[], adjustments: AdjustmentOptions, label?: string) => {
    if (targetLayerIds.length === 0) return;
    setIsLoading(`Applying adjustments to ${targetLayerIds.length} layers...`);
    try {
      const updatedLayers = await Promise.all(
        layers.map(async (layer) => {
          if (!targetLayerIds.includes(layer.id)) return layer;
          const newFile = await transformImageFile(layer.file, adjustments);
          return {
            ...layer,
            file: newFile,
          };
        })
      );
      setLayers(updatedLayers);
      addToHistory(updatedLayers, `Batch Adjust: ${label || 'Custom'} (${targetLayerIds.length} layers)`);
      showNotification(label || 'Applied Adjustments', `${targetLayerIds.length} layers`);
    } catch (e: any) {
      setError(e.message || "Failed to apply adjustments to selected layers");
    } finally {
      setIsLoading(null);
    }
  };

  const handleBatchUpdateProperties = (targetLayerIds: string[], updates: Partial<Layer>) => {
    if (targetLayerIds.length === 0) return;
    const updatedLayers = layers.map(layer => {
      if (!targetLayerIds.includes(layer.id)) return layer;
      return { ...layer, ...updates };
    });
    setLayers(updatedLayers);

    if (updates.blendMode !== undefined) {
      addToHistory(updatedLayers, `Batch Blend Mode: ${updates.blendMode} (${targetLayerIds.length} layers)`);
      showNotification(`Batch Blend: ${updates.blendMode}`, `${targetLayerIds.length} layers`);
    } else {
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory[historyIndex]) {
          newHistory[historyIndex] = { ...newHistory[historyIndex], layers: updatedLayers };
        }
        return newHistory;
      });
    }
  };

  const handleBatchDeleteLayers = (targetLayerIds: string[]) => {
    if (layers.length <= targetLayerIds.length) return;
    const remaining = layers.filter(l => !targetLayerIds.includes(l.id));
    setLayers(remaining);
    addToHistory(remaining, `Batch Delete (${targetLayerIds.length} layers)`);
    const nextActive = remaining[remaining.length - 1]?.id || null;
    setActiveLayerId(nextActive);
    setSelectedLayerIds(nextActive ? [nextActive] : []);
    showNotification('Deleted Layers', `${targetLayerIds.length} layers`);
  };


  // Prompt history management
  const addToPromptHistory = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    setPromptHistory(prev => {
        const existing = prev.find(p => p.prompt === prompt);
        if (existing) {
            return prev.map(p => p.prompt === prompt ? { ...p, count: p.count + 1, lastUsed: Date.now() } : p);
        }
        return [{ prompt, count: 1, lastUsed: Date.now() }, ...prev].slice(0, 50);
    });
  }, []);

  const openHistoryModal = useCallback((setter: (p: string) => void) => {
    setActivePromptSetter(() => setter);
    setIsPromptHistoryOpen(true);
  }, []);

  const handleSelectPrompt = (prompt: string) => {
    if (activePromptSetter) {
        activePromptSetter(prompt);
    }
    setIsPromptHistoryOpen(false);
  };

  const handleSaveCustomFilter = (filter: CustomFilter) => {
    setCustomFilters(prev => {
      const exists = prev.find(f => f.id === filter.id);
      if (exists) {
        return prev.map(f => f.id === filter.id ? filter : f);
      }
      return [...prev, filter];
    });
  };

  const handleDeleteCustomFilter = (id: string) => {
    setCustomFilters(prev => prev.filter(f => f.id !== id));
  };

  const applyCustomFilter = (filter: CustomFilter) => {
    const { brightness, contrast, saturation, sharpness } = filter.settings;
    const prompt = `Apply custom filter "${filter.name}": adjust brightness by ${brightness}%, contrast by ${contrast}%, saturation by ${saturation}%, and sharpness to ${sharpness}%. The result must be photorealistic and preserve identity.`;
    runTask(`Applying ${filter.name}...`, "Custom Filter", generateAdjustedImage, currentImage, prompt);
  };

  const getCompositeImage = async (): Promise<File | null> => {
      if (!imgRef.current || layers.length === 0) return null;
      const canvas = document.createElement('canvas');
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      for (const layer of layers) {
          if (!layer.visible) continue;
          
          const layerCanvas = document.createElement('canvas');
          layerCanvas.width = canvas.width;
          layerCanvas.height = canvas.height;
          const lctx = layerCanvas.getContext('2d');
          if (!lctx) continue;

          const img = new Image();
          await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = URL.createObjectURL(layer.file);
          });
          
          lctx.save();
          if (layer.transform) {
             const { x, y, scaleX, scaleY, rotation, skewX, skewY } = layer.transform;
             lctx.translate(canvas.width / 2 + x, canvas.height / 2 + y);
             lctx.rotate((rotation * Math.PI) / 180);
             lctx.scale(scaleX, scaleY);
             lctx.transform(1, Math.tan((skewY * Math.PI)/180), Math.tan((skewX * Math.PI)/180), 1, 0, 0);
             lctx.translate(-canvas.width / 2, -canvas.height / 2);
          }
          
          lctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          lctx.restore();
          
          if (layer.mask) {
             const maskImg = new Image();
             await new Promise<void>((resolve) => { maskImg.onload = () => resolve(); maskImg.src = layer.mask as string; });
             lctx.globalCompositeOperation = 'destination-in';
             lctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
          }

          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = layer.blendMode === 'normal' ? 'source-over' : (layer.blendMode as GlobalCompositeOperation);
          ctx.drawImage(layerCanvas, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(img.src);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      return dataURLtoFile(dataUrl, `composite-${Date.now()}.png`);
  };

  const runTask = async (msg: string, label: string, task: any, ...args: any[]) => {
    setIsLoading(msg);
    try {
        const composite = await getCompositeImage();
        const taskArgs = args.map(arg => arg === currentImage ? (composite || currentImage) : arg);
        const result = await task(...taskArgs);
        if (typeof result === 'string' && result.startsWith('data:')) {
            const newLayer: Layer = {
                id: `layer-${Date.now()}`,
                name: label,
                file: dataURLtoFile(result, `${label}-${Date.now()}.png`),
                visible: true,
                opacity: 1,
                blendMode: 'normal'
            };
            addToHistory([...layers, newLayer], label);
            setActiveLayerId(newLayer.id);
        }
        return result;
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(null);
    }
  };

  const handleImageClick = (nx: number, ny: number, dx: number, dy: number) => {
    if (isLoading) return;
    if (isColorPicking && imgRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth; canvas.height = imgRef.current.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(imgRef.current, 0, 0);
            const p = ctx.getImageData(nx, ny, 1, 1).data;
            setPickedColor(`#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`);
            setIsColorPicking(false);
        }
        return;
    }
    if (isEyePicking) {
        setEyeHotspot({ x: nx, y: ny });
        setDisplayEyeHotspot({ x: dx, y: dy });
        setIsEyePicking(false);
        return;
    }
    if (activeTab === 'retouch' && activeRetouchTool === 'point') {
        setEditHotspot({ x: nx, y: ny });
        setDisplayHotspot({ x: dx, y: dy });
    }
  };

  const tabs: { id: Tab; icon: any; name: string; shortcut?: string }[] = [
    { id: 'retouch', icon: BullseyeIcon, name: 'Edit', shortcut: 'R' },
    { id: 'filters', icon: PaletteIcon, name: 'Filter', shortcut: 'F' },
    { id: 'layers', icon: StackIcon, name: 'Layers', shortcut: 'L' },
    { id: 'adjust', icon: SunIcon, name: 'Adj', shortcut: 'A' },
    { id: 'enhance', icon: SparklesIcon, name: 'Magic', shortcut: 'E' },
    { id: 'crop', icon: CropIcon, name: 'Crop', shortcut: 'C' },
    { id: 'draw', icon: PaletteIcon, name: 'Draw', shortcut: 'D' },
    { id: 'text', icon: TypeIcon, name: 'Text', shortcut: 'T' },
    { id: 'history', icon: HistoryIcon, name: 'Hist', shortcut: 'H' },
    { id: 'avatar', icon: AvatarIcon, name: 'Avatar' },
    { id: 'hair', icon: HairIcon, name: 'Hair' },
    { id: 'studio', icon: StudioIcon, name: 'Studio' },
    { id: 'grading', icon: ColorSwatchIcon, name: 'Grade' },
    { id: 'generate', icon: PlusCircleIcon, name: 'New' },
    { id: 'analyze', icon: SearchIcon, name: 'Search' },
    { id: 'speech', icon: AudioSparkIcon, name: 'Speak' },
    { id: 'thinking', icon: BrainIcon, name: 'Ask' },
  ];

  if (!isStateLoaded) return <main className="h-screen flex items-center justify-center bg-[#090A0F]"><Spinner /></main>;
  if (!currentImage && !['generate', 'thinking'].includes(activeTab)) {
    return <main className="h-screen flex items-center justify-center bg-[#090A0F]"><StartScreen onFileSelect={(f) => { 
        if(f?.[0]) { 
            const newLayer: Layer = { id: `layer-${Date.now()}`, name: 'Background', file: f[0], visible: true, opacity: 1, blendMode: 'normal' };
            setHistory([{layers: [newLayer], label: 'Original', timestamp: Date.now()}]); 
            setHistoryIndex(0); 
            setLayers([newLayer]);
            setActiveLayerId(newLayer.id);
            setSelectedLayerIds([newLayer.id]);
            setActiveTab('retouch'); 
        } 
    }} /></main>;
  }

  return (
    <div className="flex flex-col h-screen text-gray-200 bg-[#090A0F] overflow-hidden">
      {error && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 max-w-md w-full bg-red-900/90 border border-red-500 text-white p-4 rounded-2xl z-[200] backdrop-blur-xl flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">&times;</button>
        </div>
      )}

      {/* Floating shortcut feedback toast */}
      {shortcutNotification && (
        <div className="fixed top-16 right-6 z-[200] bg-gray-900/95 border border-blue-500/40 text-white px-3.5 py-2 rounded-xl backdrop-blur-xl flex items-center gap-2.5 shadow-2xl shadow-blue-900/20 animate-fade-in pointer-events-none">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <KeyboardIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-gray-100">{shortcutNotification.text}</span>
          <kbd className="text-[10px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-blue-300 border border-white/15">
            {shortcutNotification.key}
          </kbd>
        </div>
      )}
      
      <Header 
        onFileSelect={(f) => { 
          if(f?.[0]) { 
              const newLayer: Layer = { id: `layer-${Date.now()}`, name: 'Background', file: f[0], visible: true, opacity: 1, blendMode: 'normal' };
              setHistory([{layers: [newLayer], label: 'Original', timestamp: Date.now()}]); 
              setHistoryIndex(0); 
              setLayers([newLayer]);
              setActiveLayerId(newLayer.id);
              setSelectedLayerIds([newLayer.id]);
              setActiveTab('retouch');
          } 
        }} 
        isLoading={Boolean(isLoading)} 
        onBatchEditClick={() => setIsBatchEditModalOpen(true)}
        onShortcutsClick={() => setIsShortcutsModalOpen(true)}
      />

      <main className="flex-grow grid grid-cols-[80px_1fr_400px] overflow-hidden">
        <aside className="bg-black/40 border-r border-white/5 flex flex-col items-center gap-3 py-6 z-20 overflow-y-auto scrollbar-none">
            {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  title={tab.shortcut ? `${tab.name} [${tab.shortcut}]` : tab.name}
                  className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <tab.icon className="w-6 h-6" />
                    <span className="text-[9px] mt-1 font-bold uppercase tracking-wider">{tab.name}</span>
                    {tab.shortcut && (
                      <span className={`absolute top-1 right-1 text-[8px] font-mono font-bold px-1 rounded transition ${
                        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/50 text-gray-400 group-hover:text-gray-200'
                      }`}>
                        {tab.shortcut}
                      </span>
                    )}
                </button>
            ))}
        </aside>


        <div className="relative flex flex-col items-center justify-center p-8 bg-black/20 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 z-40 backdrop-blur-md flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-6 text-lg font-bold text-blue-200 tracking-wide animate-pulse">{isLoading}</p>
              </div>
            )}
            
            <div 
                className="relative w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center"
                onWheel={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                        e.preventDefault();
                        setScale(s => Math.min(Math.max(0.1, s - e.deltaY * 0.01), 5));
                    }
                }}
                onMouseDown={(e) => {
                    if (e.button === 1 || e.altKey || e.button === 0 && e.shiftKey) {
                        e.preventDefault();
                        setIsPanning(true);
                        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                    }
                }}
                onMouseMove={(e) => {
                    if (isPanning) {
                        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
                    }
                }}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => setIsPanning(false)}
            >
                {imageSrc && (
                  activeTab === 'crop' ? (
                      <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={setCompletedCrop} aspect={aspect} className="max-w-full max-h-full">
                        <img ref={imgRef} src={imageSrc} className="max-w-full max-h-full object-contain block" />
                      </ReactCrop>
                  ) : (
                    <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out', transformOrigin: 'center' }}>
                        <EditorDisplay
                          ref={editorDisplayRef}
                          imgRef={imgRef}
                          imageSrc={imageSrc}
                          layers={layers}
                          onImageClick={handleImageClick}
                          isDrawingEnabled={(activeTab === 'retouch' && (activeRetouchTool === 'erase' || activeRetouchTool === 'fill')) || activeTab === 'draw'}
                          onMaskChange={setEraseMask}
                          brushSize={brushSize / scale}
                          brushOpacity={brushOpacity}
                          brushShape={brushShape}
                          brushColor={brushColor}
                          isFreehandDrawing={activeTab === 'draw'}
                          onFreehandChange={setFreehandDrawing}
                          textOverlay={textOverlay}
                          onTextMove={(x, y) => setTextOverlay(prev => prev ? { ...prev, x, y } : null)}
                          scale={scale}
                        >
                          {displayHotspot && activeTab === 'retouch' && activeRetouchTool === 'point' && (
                              <div className="absolute z-10 w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: displayHotspot.x, top: displayHotspot.y }}>
                                  <BullseyeIcon className="w-full h-full text-blue-400 drop-shadow-2xl animate-pulse" />
                              </div>
                          )}
                          {displayEyeHotspot && activeTab === 'adjust' && (
                              <div className="absolute z-10 w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: displayEyeHotspot.x, top: displayEyeHotspot.y }}>
                                  <BullseyeIcon className="w-full h-full text-cyan-400 drop-shadow-2xl animate-pulse" />
                              </div>
                          )}
                        </EditorDisplay>
                    </div>
                  )
                )}
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-30">
                <button onClick={() => { setScale(1); setPan({x:0, y:0}); }} className="p-3 hover:bg-white/10 rounded-xl transition text-gray-300 hover:text-white" title="Reset Zoom/Pan [0]"><ZoomInIcon className="w-5 h-5" /></button>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <button onClick={() => setHistoryIndex(h => Math.max(0, h-1))} disabled={historyIndex <= 0 || Boolean(isLoading)} className="p-3 hover:bg-white/10 rounded-xl transition text-gray-300 hover:text-white disabled:opacity-20" title="Undo [Ctrl+Z / ⌘Z]"><UndoIcon className="w-5 h-5" /></button>
                <button onClick={() => setHistoryIndex(h => Math.min(history.length-1, h+1))} disabled={historyIndex >= history.length - 1 || Boolean(isLoading)} className="p-3 hover:bg-white/10 rounded-xl transition text-gray-300 hover:text-white disabled:opacity-20" title="Redo [Ctrl+Shift+Z / ⌘⇧Z / Ctrl+Y]"><RedoIcon className="w-5 h-5" /></button>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <button onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} onMouseLeave={() => setIsComparing(false)} disabled={Boolean(isLoading) || history.length < 2} className="px-5 py-3 hover:bg-white/10 rounded-xl transition font-bold text-sm flex items-center gap-2 disabled:opacity-20"><EyeIcon className="w-5 h-5" /> Compare</button>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <button onClick={() => setIsShortcutsModalOpen(true)} className="p-3 hover:bg-white/10 text-gray-300 hover:text-blue-400 rounded-xl transition" title="Keyboard Shortcuts [?]"><KeyboardIcon className="w-5 h-5" /></button>
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                <button onClick={() => setIsSaveModalOpen(true)} disabled={Boolean(isLoading) || !currentImage} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"><DownloadIcon className="w-5 h-5" /> Export</button>
            </div>

        </div>

        <aside className="bg-[#0D0F16] border-l border-white/5 backdrop-blur-3xl overflow-y-auto z-20">
            <div className="p-6 h-full">
                {/* Fix: Passed required onOpenHistory prop to RetouchPanel and fixed isLoading type with Boolean() */}
                {activeTab === 'retouch' && <RetouchPanel isLoading={Boolean(isLoading)} activeTool={activeRetouchTool} onSetActiveTool={setActiveRetouchTool} editHotspot={editHotspot} onApplyPointEdit={(p) => { addToPromptHistory(p); runTask("Retouching...", "Edit", generateEditedImage, currentImage, p, editHotspot); }} onOpenHistory={openHistoryModal} hasMask={!!eraseMask} eraseMode={eraseMode} onSetEraseMode={setEraseMode} brushSize={brushSize} onSetBrushSize={setBrushSize} brushOpacity={brushOpacity} onSetBrushOpacity={setBrushOpacity} brushShape={brushShape} onSetBrushShape={setBrushShape} onClearMask={() => { setEraseMask(null); editorDisplayRef.current?.clearMask(); }} onApplyErase={() => runTask("Erasing...", "Erase", generateInpaintedImage, currentImage, dataURLtoFile(eraseMask!, 'mask.png'), eraseMode)} onApplyFill={(p) => runTask("Generating fill...", "Gen Fill", generateInpaintedImage, currentImage, dataURLtoFile(eraseMask!, 'mask.png'), eraseMode, p)} onRemoveBackground={() => runTask("Removing background...", "BG Removal", generateBackgroundRemovedImage, currentImage)} />}
                {activeTab === 'avatar' && <AvatarPanel onGenerateAvatar={(p) => runTask("Generating Avatar...", "Avatar", generateAvatar, currentImage, p)} isLoading={Boolean(isLoading)} />}
                {activeTab === 'filters' && (
                  <FilterPanel 
                    onApplyFilter={(p) => runTask("Applying style...", "Filter", generateFilteredImage, currentImage, p)} 
                    isLoading={Boolean(isLoading)} 
                    customFilters={customFilters}
                    onApplyCustomFilter={applyCustomFilter}
                    onCreateFilter={() => { setFilterToEdit(null); setIsCustomFilterModalOpen(true); }}
                    onEditFilter={(f) => { setFilterToEdit(f); setIsCustomFilterModalOpen(true); }}
                    onDeleteFilter={handleDeleteCustomFilter}
                  />
                )}
                {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={(p) => runTask("Adjusting...", "Adjustment", generateAdjustedImage, currentImage, p)} onApplyPointAdjustment={(p, h) => runTask("Fixing details...", "Point Fix", generateEditedImage, currentImage, p, h)} isLoading={Boolean(isLoading)} eyeHotspot={eyeHotspot} onClearEyeHotspot={() => setEyeHotspot(null)} onSetIsEyePicking={setIsEyePicking} isEyePicking={isEyePicking} />}
                {/* Fix: Passed required props (onShowPreview, onHidePreview, onAddToHistory, onOpenHistory) to EnhancePanel */}
                {activeTab === 'enhance' && <EnhancePanel onApplyEnhancement={(p) => runTask("Enhancing...", "Enhance", generateAdjustedImage, currentImage, p)} isLoading={Boolean(isLoading)} onShowPreview={() => {}} onHidePreview={() => {}} onAddToHistory={addToPromptHistory} onOpenHistory={openHistoryModal} />}
                {activeTab === 'crop' && <CropPanel onApplyCrop={() => {}} onRotate={() => {}} onSetAspect={setAspect} isLoading={Boolean(isLoading)} isCropping={false} onResetCrop={() => {}} onZoomToFill={() => {}} />}
                {/* Fix: Added missing hair, studio, and grading panels logic */}
                {activeTab === 'hair' && <HairPanel onApplyHairStyle={(p) => runTask("Styling hair...", "Hair", generateHairStyle, currentImage, p)} isLoading={Boolean(isLoading)} pickedColor={pickedColor} onActivateColorPicker={() => setIsColorPicking(true)} onClearPickedColor={() => setPickedColor(null)} />}
                {activeTab === 'studio' && <StudioPanel onGenerateStudioPortrait={(p) => runTask("Studio mode...", "Studio", generateStudioPortrait, currentImage, p)} isLoading={Boolean(isLoading)} onOpenHistory={openHistoryModal} onAddToHistory={addToPromptHistory} />}
                {activeTab === 'grading' && <ColorGradingPanel onApplyGrade={(p) => runTask("Grading...", "Color Grade", generateAdjustedImage, currentImage, p)} isLoading={Boolean(isLoading)} onShowPreview={() => {}} onHidePreview={() => {}} pickedColor={pickedColor} onActivateColorPicker={() => setIsColorPicking(true)} onClearPickedColor={() => setPickedColor(null)} />}
                {activeTab === 'generate' && <ProGenPanel onGenerate={(p, s, a) => runTask("Generating Pro...", "Pro Gen", generateImagesPro, p, a, s)} isLoading={Boolean(isLoading)} />}
                {activeTab === 'analyze' && <AnalyzePanel image={currentImage!} isLoading={Boolean(isLoading)} />}
                {activeTab === 'speech' && <SpeechPanel image={currentImage!} isLoading={Boolean(isLoading)} />}
                {activeTab === 'text' && (
                    <TextPanel 
                        overlay={textOverlay} 
                        onChange={setTextOverlay} 
                        onApply={() => {
                            if (!textOverlay || !imgRef.current) return;
                            const canvas = document.createElement('canvas');
                            const img = imgRef.current;
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.font = `${textOverlay.size * (img.naturalWidth / img.clientWidth)}px ${textOverlay.font}`;
                                ctx.fillStyle = textOverlay.color;
                                ctx.globalAlpha = textOverlay.opacity;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                // Convert display coordinates to natural coordinates
                                const nx = (textOverlay.x / img.clientWidth) * img.naturalWidth;
                                const ny = (textOverlay.y / img.clientHeight) * img.naturalHeight;
                                ctx.fillText(textOverlay.text, nx, ny);
                                const dataUrl = canvas.toDataURL('image/png');
                                const newLayer: Layer = {
                                    id: `layer-${Date.now()}`,
                                    name: 'Text Overlay',
                                    file: dataURLtoFile(dataUrl, `text-${Date.now()}.png`),
                                    visible: true,
                                    opacity: 1,
                                    blendMode: 'normal'
                                };
                                addToHistory([...layers, newLayer], "Text Overlay");
                                setActiveLayerId(newLayer.id);
                                setTextOverlay(null);
                            }
                        }}
                        isLoading={Boolean(isLoading)} 
                    />
                )}
                {activeTab === 'draw' && (
                    <DrawPanel 
                        isLoading={Boolean(isLoading)}
                        brushSize={brushSize}
                        onSetBrushSize={setBrushSize}
                        brushOpacity={brushOpacity}
                        onSetBrushOpacity={setBrushOpacity}
                        brushColor={brushColor}
                        onSetBrushColor={setBrushColor}
                        hasDrawing={!!freehandDrawing}
                        hasActiveLayer={!!activeLayerId}
                        onClearDraw={() => {
                            setFreehandDrawing(null);
                            editorDisplayRef.current?.clearFreehand();
                        }}
                        onApplyAsMask={() => {
                            if (!freehandDrawing || !activeLayerId) return;
                            const newLayers = layers.map(l => l.id === activeLayerId ? { ...l, mask: freehandDrawing } : l);
                            setLayers(newLayers);
                            addToHistory(newLayers, "Apply Mask");
                            setFreehandDrawing(null);
                            editorDisplayRef.current?.clearFreehand();
                            setActiveTab('layers');
                        }}
                        onApplyDraw={() => {
                            if (!freehandDrawing || !imgRef.current) return;
                            const newLayer: Layer = {
                                id: `layer-${Date.now()}`,
                                name: 'Drawing',
                                file: dataURLtoFile(freehandDrawing, `draw-${Date.now()}.png`),
                                visible: true,
                                opacity: 1,
                                blendMode: 'normal'
                            };
                            addToHistory([...layers, newLayer], "Freehand Drawing");
                            setActiveLayerId(newLayer.id);
                            setFreehandDrawing(null);
                            editorDisplayRef.current?.clearFreehand();
                        }}
                    />
                )}
                {activeTab === 'layers' && (
                    <LayersPanel
                        layers={layers}
                        activeLayerId={activeLayerId}
                        selectedLayerIds={selectedLayerIds}
                        onLayerSelect={(id) => {
                            setActiveLayerId(id);
                            if (!selectedLayerIds.includes(id)) {
                                setSelectedLayerIds([id]);
                            }
                        }}
                        onSelectLayers={setSelectedLayerIds}
                        onLayerChange={(id, updates) => {
                            const newLayers = layers.map(l => l.id === id ? { ...l, ...updates } : l);
                            setLayers(newLayers);
                            
                            if (updates.blendMode !== undefined) {
                                addToHistory(newLayers, `Change Blend Mode`);
                            } else if (updates.mask === null) {
                                addToHistory(newLayers, `Remove Layer Mask`);
                            } else {
                                // Don't add to history for every opacity/transform tweak to avoid spamming history
                                // We update the current history item in place for continuous layer tweaks
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    if (newHistory[historyIndex]) {
                                        newHistory[historyIndex] = { ...newHistory[historyIndex], layers: newLayers };
                                    }
                                    return newHistory;
                                });
                            }
                        }}
                        onLayerMove={(id, direction) => {
                            const index = layers.findIndex(l => l.id === id);
                            if (index < 0) return;
                            const newLayers = [...layers];
                            if (direction === 'up' && index < layers.length - 1) {
                                [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
                            } else if (direction === 'down' && index > 0) {
                                [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
                            }
                            setLayers(newLayers);
                            addToHistory(newLayers, "Reorder Layers");
                        }}
                        onLayerDelete={(id) => {
                            const newLayers = layers.filter(l => l.id !== id);
                            setLayers(newLayers);
                            addToHistory(newLayers, "Delete Layer");
                            const nextActive = newLayers[newLayers.length - 1]?.id || null;
                            setActiveLayerId(nextActive);
                            setSelectedLayerIds(nextActive ? [nextActive] : []);
                        }}
                        onBatchApplyFilter={handleBatchApplyFilter}
                        onBatchApplyAdjustment={handleBatchApplyAdjustment}
                        onBatchUpdateProperties={handleBatchUpdateProperties}
                        onBatchDeleteLayers={handleBatchDeleteLayers}
                        customFilters={customFilters}
                        isLoading={Boolean(isLoading)}
                    />
                )}
                {/* Fix: Added missing thinking mode processing logic */}
                {activeTab === 'thinking' && <ThinkingModePanel onProcess={(p) => runTask("Thinking...", "Think", async (prompt: string) => { const res = await generateWithThinkingMode(prompt); setThinkingResponse(res); return res; }, p)} isLoading={Boolean(isLoading)} response={thinkingResponse} />}
                {/* Fix: Implemented undo/redo/canUndo/canRedo logic for HistoryPanel */}
                {activeTab === 'history' && (
                    <HistoryPanel 
                        history={history} 
                        currentIndex={historyIndex} 
                        onRevert={setHistoryIndex} 
                        isLoading={Boolean(isLoading)} 
                        onUndo={() => setHistoryIndex(h => Math.max(0, h-1))} 
                        onRedo={() => setHistoryIndex(h => Math.min(history.length-1, h+1))} 
                        canUndo={historyIndex > 0} 
                        canRedo={historyIndex < history.length - 1} 
                    />
                )}
            </div>
        </aside>
      </main>
      
      <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} imageFile={currentImage!} defaultFileName={`pixshop-edit-${Date.now()}`} />
      <BatchEditModal isOpen={isBatchEditModalOpen} onClose={() => setIsBatchEditModalOpen(false)} />
      <CustomFilterModal 
        isOpen={isCustomFilterModalOpen} 
        onClose={() => setIsCustomFilterModalOpen(false)} 
        onSave={handleSaveCustomFilter} 
        filterToEdit={filterToEdit} 
      />
      {/* Added PromptHistoryModal for managing saved prompts */}
      <PromptHistoryModal isOpen={isPromptHistoryOpen} onClose={() => setIsPromptHistoryOpen(false)} history={promptHistory} onSelectPrompt={handleSelectPrompt} onClearHistory={() => setPromptHistory([])} />
      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)} />

    </div>
  );
};

// New sub-panels for clean organization
const ProGenPanel: React.FC<{ onGenerate: (p: string, s: string, a: string) => void, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
    const [p, setP] = useState('');
    const [s, setS] = useState('1K');
    const [a, setA] = useState('1:1');
    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-blue-400">Pro Generator</h3>
            <textarea value={p} onChange={e => setP(e.target.value)} placeholder="Describe your masterpiece..." className="bg-white/5 border border-white/10 rounded-2xl p-4 h-32 outline-none focus:border-blue-500 transition" />
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-500">Size</label>
                    <select value={s} onChange={e => setS(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <option value="1K">1K HD</option>
                        <option value="2K">2K Ultra</option>
                        <option value="4K">4K Pro</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-500">Aspect</label>
                    <select value={a} onChange={e => setA(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-2">
                        {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
            <button onClick={() => onGenerate(p, s, a)} disabled={isLoading || !p.trim()} className="py-4 bg-blue-600 rounded-2xl font-bold shadow-lg shadow-blue-600/20 disabled:opacity-20 transition">Generate Image</button>
        </div>
    );
}

const AnalyzePanel: React.FC<{ image: File, isLoading: boolean }> = ({ image, isLoading }) => {
    const [q, setQ] = useState('');
    const [res, setRes] = useState<{ text: string, urls: string[] } | null>(null);
    const handleAnalyze = async () => {
        setIsLocalLoading(true);
        try {
            const data = await analyzeMedia(image, q);
            setRes(data);
        } finally { setIsLocalLoading(false); }
    };
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-amber-400">Media Analysis</h3>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask Gemini anything about this media..." className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-amber-500 transition" />
            <button onClick={handleAnalyze} disabled={isLoading || isLocalLoading || !q.trim()} className="py-4 bg-amber-600 rounded-2xl font-bold transition disabled:opacity-20">Analyze with Search</button>
            {res && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 animate-fade-in">
                    <p className="text-sm leading-relaxed text-gray-300">{res.text}</p>
                    {res.urls.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-gray-500">Sources:</span>
                            {res.urls.map(url => <a key={url} href={url} target="_blank" className="text-xs text-blue-400 truncate hover:underline" rel="noreferrer">{url}</a>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const SpeechPanel: React.FC<{ image: File, isLoading: boolean }> = ({ image, isLoading }) => {
    const [t, setT] = useState('');
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const handleSpeak = async () => {
        setIsLocalLoading(true);
        try {
            const buffer = await generateSpeech(t);
            const context = new AudioContext();
            const source = context.createBufferSource();
            source.buffer = await context.decodeAudioData(buffer);
            source.connect(context.destination);
            source.start();
        } finally { setIsLocalLoading(false); }
    };
    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-purple-400">AI Speech</h3>
            <p className="text-xs text-gray-500 -mt-4">Convert text descriptions into spoken audio.</p>
            <textarea value={t} onChange={e => setT(e.target.value)} placeholder="Enter text to speak..." className="bg-white/5 border border-white/10 rounded-2xl p-4 h-32 outline-none focus:border-purple-500 transition" />
            <button onClick={handleSpeak} disabled={isLoading || isLocalLoading || !t.trim()} className="py-4 bg-purple-600 rounded-2xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-20"><AudioSparkIcon className="w-5 h-5" /> Generate Speech</button>
        </div>
    );
}

export default App;
