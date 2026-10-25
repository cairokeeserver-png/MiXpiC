/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { BrushShape, TextOverlay, Layer } from './App';

interface EditorDisplayProps {
  imgRef: React.RefObject<HTMLImageElement>;
  imageSrc: string;
  layers?: Layer[];
  onImageClick: (naturalX: number, naturalY: number, displayX: number, displayY: number) => void;
  isDrawingEnabled: boolean;
  isColorPicking?: boolean;
  onMaskChange: (maskDataUrl: string | null) => void;
  brushSize: number;
  brushOpacity: number;
  brushShape: BrushShape;
  brushColor?: string;
  isFreehandDrawing?: boolean;
  onFreehandChange?: (dataUrl: string | null) => void;
  textOverlay?: TextOverlay | null;
  onTextMove?: (x: number, y: number) => void;
  children?: React.ReactNode;
  scale?: number;
}

const EditorDisplay = forwardRef<{ clearMask: () => void, clearFreehand: () => void }, EditorDisplayProps>(
  ({ imgRef, imageSrc, layers, onImageClick, isDrawingEnabled, isColorPicking, onMaskChange, brushSize, brushOpacity, brushShape, brushColor = '#8b5cf6', isFreehandDrawing, onFreehandChange, textOverlay, onTextMove, children, scale = 1 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const freehandCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDraggingText, setIsDraggingText] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
    const [previewColor, setPreviewColor] = useState<string | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [naturalSize, setNaturalSize] = useState<{w: number, h: number} | null>(null);
    const [lastCoords, setLastCoords] = useState<{ x: number, y: number } | null>(null);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            if (canvasRef.current && freehandCanvasRef.current) {
                canvasRef.current.width = img.naturalWidth;
                canvasRef.current.height = img.naturalHeight;
                freehandCanvasRef.current.width = img.naturalWidth;
                freehandCanvasRef.current.height = img.naturalHeight;
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (textOverlay && onTextMove) {
            const coords = getCoords(e);
            if (coords) {
                // Simple hit test for text
                const dist = Math.sqrt(Math.pow(coords.x - textOverlay.x, 2) + Math.pow(coords.y - textOverlay.y, 2));
                if (dist < 50) { // 50px radius for hit test
                    setIsDraggingText(true);
                    return;
                }
            }
        }
        startDrawing(e);
    };

    const getCoords = (e: React.MouseEvent<HTMLElement, MouseEvent>): { x: number, y: number } | null => {
        const container = containerRef.current;
        if (!container || !naturalSize) return null;
        const rect = container.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * naturalSize.w,
            y: ((e.clientY - rect.top) / rect.height) * naturalSize.h
        };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // Handled in handleMouseMove for smoother drawing
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (!isDrawingEnabled) return;
        const coords = getCoords(e);
        const activeCanvas = isFreehandDrawing ? freehandCanvasRef.current : canvasRef.current;
        const ctx = activeCanvas?.getContext('2d');
        if (!coords || !ctx || !containerRef.current || !naturalSize) return;

        setIsDrawing(true);
        setLastCoords(coords);
        
        ctx.beginPath();
        const lineWidth = brushSize * (naturalSize.w / containerRef.current.getBoundingClientRect().width);
        ctx.lineWidth = lineWidth * scale;
        ctx.lineCap = brushShape === 'round' ? 'round' : 'square';
        ctx.lineJoin = brushShape === 'round' ? 'round' : 'miter';
        ctx.strokeStyle = isFreehandDrawing ? brushColor : `rgba(139, 92, 246, ${brushOpacity})`;
        if (isFreehandDrawing) {
            ctx.globalAlpha = brushOpacity;
        } else {
            ctx.globalAlpha = 1;
        }
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const coords = getCoords(e);
        if (coords) {
            setCursorPos({ x: coords.x, y: coords.y, visible: true });
            
            if (isDraggingText && onTextMove) {
                onTextMove(coords.x, coords.y);
            }

            if (isDrawing && isDrawingEnabled && lastCoords) {
                const activeCanvas = isFreehandDrawing ? freehandCanvasRef.current : canvasRef.current;
                const ctx = activeCanvas?.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    ctx.moveTo(lastCoords.x, lastCoords.y);
                    ctx.lineTo(coords.x, coords.y);
                    ctx.stroke();
                    setLastCoords(coords);
                }
            }

            if (isColorPicking && previewCanvasRef.current && naturalSize && containerRef.current) {
                const naturalX = Math.round(coords.x);
                const naturalY = Math.round(coords.y);
                const ctx = previewCanvasRef.current.getContext('2d');
                if (ctx) {
                    const pixel = ctx.getImageData(naturalX, naturalY, 1, 1).data;
                    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
                    setPreviewColor(hex);
                }
            } else {
                setPreviewColor(null);
            }
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || !isDrawingEnabled) return;
        setIsDrawing(false);
        
        const image = imgRef.current;
        const displayCanvas = isFreehandDrawing ? freehandCanvasRef.current : canvasRef.current;
        if (!image || !displayCanvas) return;

        if (isFreehandDrawing) {
            if (onFreehandChange) {
                onFreehandChange(displayCanvas.toDataURL('image/png'));
            }
            return;
        }

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = image.naturalWidth;
        maskCanvas.height = image.naturalHeight;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!maskCtx) return;

        // Start with a black background for the mask
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        // Draw the scaled display canvas (with the user's strokes) onto the mask canvas
        maskCtx.drawImage(displayCanvas, 0, 0, maskCanvas.width, maskCanvas.height);

        // Now, process the pixels: convert the drawn (purple) parts to pure white for the final mask
        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // If the pixel has any alpha (meaning it was drawn on), make it pure white
          if (data[i + 3] > 0) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // A
          }
        }
        maskCtx.putImageData(imageData, 0, 0);

        onMaskChange(maskCanvas.toDataURL('image/png'));
    };

    const handleMouseUp = () => {
        setIsDraggingText(false);
        if (isDrawing) {
            stopDrawing();
        }
        setLastCoords(null);
    };

    useEffect(() => {
        const image = imgRef.current;
        if (isColorPicking && image) {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                // Ensure image is fully loaded before drawing
                if (image.complete) {
                    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                    previewCanvasRef.current = canvas;
                } else {
                    image.onload = () => {
                        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                        previewCanvasRef.current = canvas;
                    };
                }
            }
        } else {
            previewCanvasRef.current = null;
        }
    }, [isColorPicking, imageSrc, imgRef]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const image = imgRef.current;
        if (!image || (isDrawingEnabled && !isColorPicking)) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const displayX = e.clientX - rect.left;
        const displayY = e.clientY - rect.top;
        const naturalX = Math.round((displayX / e.currentTarget.width) * image.naturalWidth);
        const naturalY = Math.round((displayY / e.currentTarget.height) * image.naturalHeight);
        onImageClick(naturalX, naturalY, displayX, displayY);
    };
    
    const clearMask = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onMaskChange(null);
        }
    };
    
    const clearFreehand = () => {
        const canvas = freehandCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (onFreehandChange) onFreehandChange(null);
        }
    };
    
    const handleMouseLeave = () => {
        setCursorPos(prev => ({ ...prev, visible: false }));
        setPreviewColor(null);
    };


    useImperativeHandle(ref, () => ({ clearMask, clearFreehand }));
    
    const cursorStyle = isColorPicking ? 'crosshair' : isDrawingEnabled ? 'none' : 'auto';

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center"
          style={{ 
            aspectRatio: naturalSize ? `${naturalSize.w} / ${naturalSize.h}` : 'auto', 
            maxWidth: '100%', 
            maxHeight: '100%',
            width: naturalSize ? '100%' : 'auto',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
            <img 
               ref={imgRef} 
               src={imageSrc} 
               alt="User upload or Base" 
               className="block w-full h-full object-fill pointer-events-none" 
               onLoad={handleImageLoad}
               style={{ opacity: (layers && layers.length > 0) ? 0 : 1 }}
            />
            {layers && layers.length > 0 && layers.map((layer, index) => {
                const tr = layer.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 };
                const transformStr = `translate(${tr.x}px, ${tr.y}px) rotate(${tr.rotation}deg) scale(${tr.scaleX}, ${tr.scaleY}) skew(${tr.skewX}deg, ${tr.skewY}deg)`;
                return layer.visible && (
                    <img 
                        key={layer.id} 
                        src={URL.createObjectURL(layer.file)} 
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none" 
                        style={{ 
                            opacity: layer.opacity, 
                            mixBlendMode: layer.blendMode as any,
                            zIndex: index,
                            maskImage: layer.mask ? `url(${layer.mask})` : 'none',
                            WebkitMaskImage: layer.mask ? `url(${layer.mask})` : 'none',
                            maskSize: '100% 100%',
                            WebkitMaskSize: '100% 100%',
                            transform: transformStr
                        }} 
                    />
                )
            })}

            <canvas
                ref={freehandCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: cursorStyle }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
            />
            
            {textOverlay && naturalSize && containerRef.current && (
                <div 
                    className="absolute pointer-events-none select-none whitespace-pre-wrap text-center"
                    style={{
                        left: `${(textOverlay.x / naturalSize.w) * 100}%`,
                        top: `${(textOverlay.y / naturalSize.h) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: textOverlay.font,
                        fontSize: `${textOverlay.size * (containerRef.current.getBoundingClientRect().width / naturalSize.w)}px`,
                        color: textOverlay.color,
                        opacity: textOverlay.opacity,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        cursor: isDraggingText ? 'grabbing' : 'grab',
                        pointerEvents: 'auto'
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingText(true);
                    }}
                >
                    {textOverlay.text}
                </div>
            )}
            {isDrawingEnabled && cursorPos.visible && naturalSize && containerRef.current && (
                <div
                    className="absolute pointer-events-none border-2 border-white/70 backdrop-invert-[25%] rounded-full"
                    style={{
                        width: `${brushSize * scale}px`,
                        height: `${brushSize * scale}px`,
                        left: `${(cursorPos.x / naturalSize.w) * 100}%`,
                        top: `${(cursorPos.y / naturalSize.h) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: brushShape === 'round' ? '50%' : '0%',
                    }}
                />
            )}
            {isColorPicking && cursorPos.visible && previewColor && naturalSize && (
                <div
                    className="absolute pointer-events-none rounded-full border-4 border-white/90 shadow-lg flex items-center justify-center backdrop-invert-[10%]"
                    style={{
                        width: `64px`,
                        height: `64px`,
                        left: `${(cursorPos.x / naturalSize.w) * 100}%`,
                        top: `${(cursorPos.y / naturalSize.h) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div
                        className="w-full h-full rounded-full border-2 border-black/50"
                        style={{ backgroundColor: previewColor }}
                    />
                </div>
            )}
        </div>
        {children}
      </div>
    );
  }
);

export default EditorDisplay;