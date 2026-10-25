/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    TrashIcon, 
    ChevronUpIcon, 
    ChevronDownIcon, 
    CheckIcon,
    SlidersIcon,
    PaletteIcon,
    StackIcon
} from './icons';
import type { Layer, CustomFilter } from './App';
import { PRESET_FILTERS, type FilterPreset, type AdjustmentOptions } from '../services/imageFilters';

interface LayersPanelProps {
    layers: Layer[];
    activeLayerId: string | null;
    selectedLayerIds?: string[];
    onLayerSelect: (id: string) => void;
    onSelectLayers?: (ids: string[]) => void;
    onLayerChange: (id: string, updates: Partial<Layer>) => void;
    onLayerMove: (id: string, direction: 'up' | 'down') => void;
    onLayerDelete: (id: string) => void;
    onBatchApplyFilter?: (layerIds: string[], filterPreset: FilterPreset) => void;
    onBatchApplyAdjustment?: (layerIds: string[], adjustments: AdjustmentOptions, label?: string) => void;
    onBatchUpdateProperties?: (layerIds: string[], updates: Partial<Layer>) => void;
    onBatchDeleteLayers?: (layerIds: string[]) => void;
    customFilters?: CustomFilter[];
    isLoading?: boolean;
}

const BLEND_MODES = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'exclusion', label: 'Exclusion' },
];

const LayersPanel: React.FC<LayersPanelProps> = ({
    layers,
    activeLayerId,
    selectedLayerIds = [],
    onLayerSelect,
    onSelectLayers,
    onLayerChange,
    onLayerMove,
    onLayerDelete,
    onBatchApplyFilter,
    onBatchApplyAdjustment,
    onBatchUpdateProperties,
    onBatchDeleteLayers,
    customFilters = [],
    isLoading = false,
}) => {
    // Mode tabs: 'layers' (standard list + single layer inspector) or 'batch' (batch filter/adjustment)
    const [viewMode, setViewMode] = useState<'layers' | 'batch'>('layers');
    const [batchSubTab, setBatchSubTab] = useState<'filters' | 'adjustments' | 'properties'>('filters');

    // Batch adjustment state
    const [batchBrightness, setBatchBrightness] = useState<number>(0);
    const [batchContrast, setBatchContrast] = useState<number>(0);
    const [batchSaturation, setBatchSaturation] = useState<number>(0);
    const [batchBlur, setBatchBlur] = useState<number>(0);
    const [batchHue, setBatchHue] = useState<number>(0);

    // Batch properties state
    const [batchOpacity, setBatchOpacity] = useState<number>(1);
    const [batchBlendMode, setBatchBlendMode] = useState<string>('normal');

    // Ensure selectedLayerIds always has at least the activeLayerId if empty
    const effectiveSelectedIds = selectedLayerIds.length > 0 
        ? selectedLayerIds 
        : (activeLayerId ? [activeLayerId] : []);

    const isLayerSelected = (id: string) => effectiveSelectedIds.includes(id);

    const handleToggleSelectLayer = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!onSelectLayers) {
            onLayerSelect(id);
            return;
        }

        if (isLayerSelected(id)) {
            // If it's the last selected item, keep at least one selected
            if (effectiveSelectedIds.length > 1) {
                const updated = effectiveSelectedIds.filter(selectedId => selectedId !== id);
                onSelectLayers(updated);
                if (activeLayerId === id) {
                    onLayerSelect(updated[0]);
                }
            }
        } else {
            const updated = [...effectiveSelectedIds, id];
            onSelectLayers(updated);
            onLayerSelect(id);
        }
    };

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            handleToggleSelectLayer(id, e);
            return;
        }

        if (e.shiftKey && activeLayerId && onSelectLayers) {
            const activeIdx = layers.findIndex(l => l.id === activeLayerId);
            const clickedIdx = layers.findIndex(l => l.id === id);
            if (activeIdx !== -1 && clickedIdx !== -1) {
                const start = Math.min(activeIdx, clickedIdx);
                const end = Math.max(activeIdx, clickedIdx);
                const rangeIds = layers.slice(start, end + 1).map(l => l.id);
                const merged = Array.from(new Set([...effectiveSelectedIds, ...rangeIds]));
                onSelectLayers(merged);
                onLayerSelect(id);
                return;
            }
        }

        // Standard single select
        onLayerSelect(id);
        if (onSelectLayers) {
            onSelectLayers([id]);
        }
    };

    const handleSelectAll = () => {
        if (!onSelectLayers) return;
        onSelectLayers(layers.map(l => l.id));
    };

    const handleDeselectAll = () => {
        if (!onSelectLayers || !activeLayerId) return;
        onSelectLayers([activeLayerId]);
    };

    const handleApplyBatchPreset = (preset: FilterPreset) => {
        if (!onBatchApplyFilter || effectiveSelectedIds.length === 0) return;
        onBatchApplyFilter(effectiveSelectedIds, preset);
    };

    const handleApplyCustomFilter = (filter: CustomFilter) => {
        if (!onBatchApplyAdjustment || effectiveSelectedIds.length === 0) return;
        const { brightness, contrast, saturation, sharpness } = filter.settings;
        onBatchApplyAdjustment(
            effectiveSelectedIds,
            { brightness, contrast, saturation, blur: sharpness < 0 ? Math.abs(sharpness) / 10 : 0 },
            `Custom: ${filter.name}`
        );
    };

    const handleApplyBatchSliders = () => {
        if (!onBatchApplyAdjustment || effectiveSelectedIds.length === 0) return;
        onBatchApplyAdjustment(
            effectiveSelectedIds,
            {
                brightness: batchBrightness,
                contrast: batchContrast,
                saturation: batchSaturation,
                blur: batchBlur,
                hueRotate: batchHue,
            },
            `Adjustments (B:${batchBrightness}% C:${batchContrast}% S:${batchSaturation}%)`
        );
    };

    const handleResetBatchSliders = () => {
        setBatchBrightness(0);
        setBatchContrast(0);
        setBatchSaturation(0);
        setBatchBlur(0);
        setBatchHue(0);
    };

    const handleApplyBatchProperties = () => {
        if (!onBatchUpdateProperties || effectiveSelectedIds.length === 0) return;
        onBatchUpdateProperties(effectiveSelectedIds, {
            opacity: batchOpacity,
            blendMode: batchBlendMode,
        });
    };

    const handleBatchVisibility = (visible: boolean) => {
        if (!onBatchUpdateProperties || effectiveSelectedIds.length === 0) return;
        onBatchUpdateProperties(effectiveSelectedIds, { visible });
    };

    const handleBatchDelete = () => {
        if (!onBatchDeleteLayers || effectiveSelectedIds.length === 0) return;
        if (layers.length <= effectiveSelectedIds.length) {
            // Don't delete all layers, leave at least one
            return;
        }
        onBatchDeleteLayers(effectiveSelectedIds);
    };

    return (
        <div className="w-full bg-[#10131D]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl h-full shadow-2xl overflow-hidden">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StackIcon className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-bold text-gray-100 tracking-tight">Layers</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-semibold">
                            {layers.length}
                        </span>
                    </div>

                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('layers')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                viewMode === 'layers' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Layers
                        </button>
                        <button
                            onClick={() => setViewMode('batch')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                                viewMode === 'batch' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <SlidersIcon className="w-3.5 h-3.5" />
                            <span>Batch</span>
                            {effectiveSelectedIds.length > 1 && (
                                <span className="w-4 h-4 rounded-full bg-blue-400 text-gray-900 text-[10px] font-black flex items-center justify-center">
                                    {effectiveSelectedIds.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Multi-Selection Control Bar */}
                <div className="flex items-center justify-between text-xs bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-300">
                            {effectiveSelectedIds.length} selected
                        </span>
                        {effectiveSelectedIds.length > 1 && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                Multi-Layer
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleSelectAll}
                            className="px-2 py-0.5 text-[10px] font-semibold text-gray-400 hover:text-blue-400 transition"
                        >
                            Select All
                        </button>
                        <span className="text-gray-600">•</span>
                        <button
                            onClick={handleDeselectAll}
                            disabled={effectiveSelectedIds.length <= 1}
                            className="px-2 py-0.5 text-[10px] font-semibold text-gray-400 hover:text-white disabled:opacity-30 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content: Layers list or Batch Actions */}
            {viewMode === 'layers' ? (
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-700">
                    {[...layers].reverse().map((layer, reversedIndex) => {
                        const index = layers.length - 1 - reversedIndex;
                        const isActive = layer.id === activeLayerId;
                        const isSelected = isLayerSelected(layer.id);

                        return (
                            <div 
                                key={layer.id} 
                                className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-blue-900/25 border-blue-500/70 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40' 
                                        : isSelected
                                            ? 'bg-indigo-950/30 border-indigo-500/40'
                                            : 'bg-black/30 border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                                }`}
                                onClick={(e) => handleRowClick(layer.id, e)}
                            >
                                <div className="flex items-center gap-2.5">
                                    {/* Multi-selection Checkbox */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleSelectLayer(layer.id, e)}
                                        title={isSelected ? "Deselect layer" : "Select layer for batch action"}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                            isSelected 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'border-white/20 bg-black/40 hover:border-white/40 text-transparent'
                                        }`}
                                    >
                                        <CheckIcon className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Visibility Toggle */}
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onLayerChange(layer.id, { visible: !layer.visible }); }}
                                        className="text-gray-400 hover:text-white transition p-0.5"
                                        title={layer.visible ? "Hide layer" : "Show layer"}
                                    >
                                        {layer.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4 text-gray-500" />}
                                    </button>

                                    {/* Thumbnail Preview */}
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/50">
                                        <img 
                                            src={URL.createObjectURL(layer.file)} 
                                            alt={layer.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                        {layer.mask && (
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black/80 rounded-tl border-t border-l border-white/30 flex items-center justify-center">
                                                <span className="text-[7px] text-white font-black">M</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 pr-1">
                                        <div className="text-xs font-semibold text-gray-100 truncate flex items-center gap-1.5">
                                            <span>{layer.name}</span>
                                            {isActive && (
                                                <span className="text-[8px] font-black uppercase text-blue-400 tracking-wider bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                                            <span>{Math.round(layer.opacity * 100)}%</span>
                                            <span>•</span>
                                            <span className="capitalize">{layer.blendMode}</span>
                                        </div>
                                    </div>

                                    {/* Layer Reorder & Delete */}
                                    <div className="flex items-center shrink-0 gap-0.5">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onLayerMove(layer.id, 'up'); }}
                                            disabled={index === layers.length - 1}
                                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition"
                                            title="Move layer up"
                                        >
                                            <ChevronUpIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onLayerMove(layer.id, 'down'); }}
                                            disabled={index === 0}
                                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 transition"
                                            title="Move layer down"
                                        >
                                            <ChevronDownIcon className="w-3.5 h-3.5" />
                                        </button>
                                        {layers.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onLayerDelete(layer.id); }}
                                                className="p-1 text-red-400/60 hover:text-red-400 transition ml-0.5"
                                                title="Delete layer"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Single Layer Active Controls */}
                                {isActive && (
                                    <div className="flex flex-col gap-3 mt-1.5 pt-2 border-t border-white/10" onClick={e => e.stopPropagation()}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                                <span>OPACITY</span>
                                                <span className="font-mono text-blue-400">{Math.round(layer.opacity * 100)}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" max="1" step="0.05" 
                                                value={layer.opacity} 
                                                onChange={(e) => onLayerChange(layer.id, { opacity: parseFloat(e.target.value) })}
                                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] font-medium text-gray-400">
                                            <span>BLEND MODE</span>
                                            <select 
                                                value={layer.blendMode}
                                                onChange={(e) => onLayerChange(layer.id, { blendMode: e.target.value })}
                                                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-blue-500"
                                            >
                                                {BLEND_MODES.map(mode => (
                                                    <option key={mode.value} value={mode.value}>
                                                        {mode.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Transform Controls */}
                                        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                                            <div className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Transform</div>
                                            
                                            {/* Scale */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[9px] text-gray-400">
                                                    <span>SCALE</span>
                                                    <span className="font-mono">{Math.round((layer.transform?.scaleX || 1) * 100)}%</span>
                                                </div>
                                                <input type="range" min="-3" max="3" step="0.05" 
                                                    value={layer.transform?.scaleX || 1} 
                                                    onChange={(e) => onLayerChange(layer.id, { transform: { ...(layer.transform || {x:0, y:0, rotation:0, skewX:0, skewY:0, scaleX: 1, scaleY: 1}), scaleX: parseFloat(e.target.value), scaleY: parseFloat(e.target.value) }})}
                                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>

                                            {/* Rotation */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[9px] text-gray-400">
                                                    <span>ROTATE</span>
                                                    <span className="font-mono">{layer.transform?.rotation || 0}°</span>
                                                </div>
                                                <input type="range" min="-180" max="180" step="1" 
                                                    value={layer.transform?.rotation || 0} 
                                                    onChange={(e) => onLayerChange(layer.id, { transform: { ...(layer.transform || {x:0, y:0, rotation:0, skewX:0, skewY:0, scaleX: 1, scaleY: 1}), rotation: parseFloat(e.target.value) }})}
                                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>

                                            {/* Translation X */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[9px] text-gray-400">
                                                    <span>MOVE X</span>
                                                    <span className="font-mono">{layer.transform?.x || 0}px</span>
                                                </div>
                                                <input type="range" min="-1000" max="1000" step="5" 
                                                    value={layer.transform?.x || 0} 
                                                    onChange={(e) => onLayerChange(layer.id, { transform: { ...(layer.transform || {x:0, y:0, rotation:0, skewX:0, skewY:0, scaleX: 1, scaleY: 1}), x: parseFloat(e.target.value) }})}
                                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>
                                            
                                            {/* Translation Y */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[9px] text-gray-400">
                                                    <span>MOVE Y</span>
                                                    <span className="font-mono">{layer.transform?.y || 0}px</span>
                                                </div>
                                                <input type="range" min="-1000" max="1000" step="5" 
                                                    value={layer.transform?.y || 0} 
                                                    onChange={(e) => onLayerChange(layer.id, { transform: { ...(layer.transform || {x:0, y:0, rotation:0, skewX:0, skewY:0, scaleX: 1, scaleY: 1}), y: parseFloat(e.target.value) }})}
                                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>

                                            {/* Skew X */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[9px] text-gray-400">
                                                    <span>SKEW</span>
                                                    <span className="font-mono">{layer.transform?.skewX || 0}°</span>
                                                </div>
                                                <input type="range" min="-90" max="90" step="1" 
                                                    value={layer.transform?.skewX || 0} 
                                                    onChange={(e) => onLayerChange(layer.id, { transform: { ...(layer.transform || {x:0, y:0, rotation:0, skewX:0, skewY:0, scaleX: 1, scaleY: 1}), skewX: parseFloat(e.target.value) }})}
                                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Mask Controls */}
                                        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Mask</div>
                                                {layer.mask && (
                                                    <button onClick={() => onLayerChange(layer.id, { mask: null })} className="text-[10px] text-red-400 hover:text-red-300 font-semibold">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {layer.mask ? (
                                                    <img src={layer.mask} alt="Layer Mask" className="w-full h-12 object-contain bg-black/60 border border-white/10 rounded-xl" />
                                                ) : (
                                                    <div className="text-[10px] text-gray-500 text-center w-full bg-black/30 py-2.5 rounded-xl border border-dashed border-white/10">
                                                        Use Draw tool to paint a mask on this layer.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Batch Actions Panel */
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-700">
                    {/* Batch Sub-navigation */}
                    <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setBatchSubTab('filters')}
                            className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                                batchSubTab === 'filters' 
                                    ? 'bg-blue-600 text-white shadow' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Filters
                        </button>
                        <button
                            onClick={() => setBatchSubTab('adjustments')}
                            className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                                batchSubTab === 'adjustments' 
                                    ? 'bg-blue-600 text-white shadow' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Adjust
                        </button>
                        <button
                            onClick={() => setBatchSubTab('properties')}
                            className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                                batchSubTab === 'properties' 
                                    ? 'bg-blue-600 text-white shadow' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Layer Props
                        </button>
                    </div>

                    {/* Batch Context Banner */}
                    <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-indigo-200">
                                Target: {effectiveSelectedIds.length} of {layers.length} layers
                            </p>
                            <p className="text-[10px] text-gray-400">
                                Selected layers will be updated simultaneously
                            </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            {effectiveSelectedIds.length} Layers
                        </span>
                    </div>

                    {/* Subtab 1: Batch Filters */}
                    {batchSubTab === 'filters' && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-400 mb-2">
                                    Preset Filters
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESET_FILTERS.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleApplyBatchPreset(preset)}
                                            disabled={isLoading || effectiveSelectedIds.length === 0}
                                            className="p-2.5 bg-black/40 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 rounded-xl transition text-left group flex flex-col gap-1 disabled:opacity-30"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                                                    {preset.name}
                                                </span>
                                                {preset.badge && (
                                                    <span className="text-[8px] uppercase font-bold text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded border border-blue-500/20">
                                                        {preset.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-gray-400 line-clamp-1">
                                                {preset.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Saved Filters */}
                            {customFilters.length > 0 && (
                                <div className="pt-2 border-t border-white/10">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-purple-400 mb-2">
                                        Saved Custom Filters
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {customFilters.map(filter => (
                                            <button
                                                key={filter.id}
                                                onClick={() => handleApplyCustomFilter(filter)}
                                                disabled={isLoading || effectiveSelectedIds.length === 0}
                                                className="p-2.5 bg-purple-950/20 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition text-left flex items-center justify-between disabled:opacity-30"
                                            >
                                                <div>
                                                    <span className="text-xs font-bold text-purple-200">
                                                        {filter.name}
                                                    </span>
                                                    <div className="text-[9px] text-gray-400 mt-0.5">
                                                        B: {filter.settings.brightness}% • C: {filter.settings.contrast}% • S: {filter.settings.saturation}%
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-lg">
                                                    Apply
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subtab 2: Batch Adjustments */}
                    {batchSubTab === 'adjustments' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-400">
                                    Adjustment Sliders
                                </h4>
                                <button
                                    onClick={handleResetBatchSliders}
                                    className="text-[10px] text-gray-400 hover:text-white font-semibold transition"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Brightness */}
                            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-300">
                                    <span>BRIGHTNESS</span>
                                    <span className="font-mono text-blue-400">{batchBrightness > 0 ? `+${batchBrightness}` : batchBrightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    value={batchBrightness}
                                    onChange={e => setBatchBrightness(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Contrast */}
                            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-300">
                                    <span>CONTRAST</span>
                                    <span className="font-mono text-blue-400">{batchContrast > 0 ? `+${batchContrast}` : batchContrast}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    value={batchContrast}
                                    onChange={e => setBatchContrast(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Saturation */}
                            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-300">
                                    <span>SATURATION</span>
                                    <span className="font-mono text-blue-400">{batchSaturation > 0 ? `+${batchSaturation}` : batchSaturation}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    value={batchSaturation}
                                    onChange={e => setBatchSaturation(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Blur */}
                            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-300">
                                    <span>BLUR</span>
                                    <span className="font-mono text-blue-400">{batchBlur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="15"
                                    value={batchBlur}
                                    onChange={e => setBatchBlur(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Hue Rotate */}
                            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-gray-300">
                                    <span>HUE ROTATE</span>
                                    <span className="font-mono text-blue-400">{batchHue}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={batchHue}
                                    onChange={e => setBatchHue(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <button
                                onClick={handleApplyBatchSliders}
                                disabled={isLoading || effectiveSelectedIds.length === 0}
                                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-30"
                            >
                                Apply Adjustments to {effectiveSelectedIds.length} Layers
                            </button>
                        </div>
                    )}

                    {/* Subtab 3: Batch Layer Properties */}
                    {batchSubTab === 'properties' && (
                        <div className="flex flex-col gap-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-400">
                                Batch Layer Properties
                            </h4>

                            {/* Batch Opacity */}
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
                                    <span>SET OPACITY FOR ALL</span>
                                    <span className="font-mono text-blue-400">{Math.round(batchOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={batchOpacity}
                                    onChange={e => setBatchOpacity(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Batch Blend Mode */}
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                <span className="text-xs font-semibold text-gray-300">SET BLEND MODE FOR ALL</span>
                                <select
                                    value={batchBlendMode}
                                    onChange={e => setBatchBlendMode(e.target.value)}
                                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    {BLEND_MODES.map(mode => (
                                        <option key={mode.value} value={mode.value}>
                                            {mode.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleApplyBatchProperties}
                                disabled={isLoading || effectiveSelectedIds.length === 0}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-30"
                            >
                                Apply Opacity & Blend Mode
                            </button>

                            {/* Batch Visibility & Delete Actions */}
                            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    Bulk Actions
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleBatchVisibility(true)}
                                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-200 transition"
                                    >
                                        Show Selected
                                    </button>
                                    <button
                                        onClick={() => handleBatchVisibility(false)}
                                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-200 transition"
                                    >
                                        Hide Selected
                                    </button>
                                </div>

                                {layers.length > effectiveSelectedIds.length && (
                                    <button
                                        onClick={handleBatchDelete}
                                        className="mt-1 py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold transition"
                                    >
                                        Delete {effectiveSelectedIds.length} Selected Layers
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LayersPanel;
