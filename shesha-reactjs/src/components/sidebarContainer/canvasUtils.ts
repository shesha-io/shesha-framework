
export function widthRelativeToCanvas(width: string | number, canvasWidth: string = '100vw'): string {
  if (typeof width === 'number') {
    return `${width}px`;
  }

  const trimmed = String(width).trim();
  const vwMatch = trimmed.match(/^([\d.]+)\s*vw$/i);

  if (vwMatch) {
    const percentageOfCanvas = parseFloat(vwMatch[1]);
    if (!Number.isNaN(percentageOfCanvas)) {
      return `calc((${percentageOfCanvas} * ${canvasWidth}) / 100)`;
    }
  }

  return trimmed;
}

import { useCallback, useEffect, useRef } from 'react';

export interface IAutoZoomParams {
  currentZoom: number;
  designerWidth?: string;
  sizes?: number[];
}

export const DEFAULT_OPTIONS = {
  minZoom: 25,
  maxZoom: 200,
  defaultSizes: [25, 50, 25]
};

export function calculateAutoZoom(params: IAutoZoomParams): number {
  const { designerWidth = '1024px', sizes = [20, 60, 20] } = params;
  
  const availableWidthPercent = sizes[1];
  const availableWidth = (availableWidthPercent / 100) * (window.innerWidth - 55 - 16);
  
  let canvasWidth: number;
  if (designerWidth.includes('px')) {
    canvasWidth = parseFloat(designerWidth.replace('px', ''));
  } else if (designerWidth.includes('vw')) {
    const vwValue = parseFloat(designerWidth.replace('vw', ''));
    canvasWidth = (vwValue / 100) * window.innerWidth;
  } else {
    canvasWidth = parseFloat(designerWidth) || 1024;
  }
  
  const optimalZoom = (availableWidth / canvasWidth) * 100;
  
  return Math.max(25, Math.min(200, Math.round(optimalZoom)));
}

export const usePinchZoom = (
  onZoomChange: (zoom: number) => void,
  currentZoom: number,
  minZoom: number = 10,
  maxZoom: number = 200,
  isAutoWidth: boolean = false
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastDistance = useRef<number>(0);
  const initialZoom = useRef<number>(currentZoom);

  const getDistance = useCallback((touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isAutoWidth || e.touches.length !== 2) return;
    
    e.preventDefault();
    lastDistance.current = getDistance(e.touches);
    initialZoom.current = currentZoom;
  }, [getDistance, currentZoom, isAutoWidth]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isAutoWidth || e.touches.length !== 2) return;

    e.preventDefault();
    const currentDistance = getDistance(e.touches);
    
    if (lastDistance.current > 0) {
      const scale = currentDistance / lastDistance.current;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, initialZoom.current * scale));
      onZoomChange(Math.round(newZoom));
    }
  }, [getDistance, onZoomChange, minZoom, maxZoom, isAutoWidth]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (isAutoWidth || !e.ctrlKey) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
    onZoomChange(newZoom);
  }, [onZoomChange, currentZoom, minZoom, maxZoom, isAutoWidth]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistance.current = 0;
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return () => {};
    
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  return elementRef;
};