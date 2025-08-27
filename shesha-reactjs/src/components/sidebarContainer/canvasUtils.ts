/**
 * Converts a width value to be relative to a given canvas width.
 *
 * If the incoming width is expressed in `vw`, it will be treated as a percentage of the provided
 * `canvasWidth` (which itself can be any valid CSS length, e.g. `100vw`, `calc(80vw - 100px)`, etc.).
 * The result is returned as a CSS calc expression that resolves to a `vw`-based unit.
 *
 * Examples:
 * - widthRelativeToCanvas('60vw', 'calc(80vw - 55px)') => 'calc((60 * calc(80vw - 55px)) / 100)'
 * - widthRelativeToCanvas('500px', '100vw') => '500px' (unchanged)
 * - widthRelativeToCanvas('75%', '100vw') => '75%' (unchanged)
 */
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
import { ISidebarProps } from './models';
import { IDeviceTypes } from '@/providers/canvas/contexts';

export interface IAutoZoomOptions {
  // Calibration zoom levels for different panel states
  bothPanelsOpenZoom?: number;
  onePanelOpenZoom?: number;
  noPanelsOpenZoom?: number;
  // Dynamic calculation options
  useCalibration?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoomIncrement?: number;
  marginFactor?: number;
  toolbarHeight?: number;
  paddingOffset?: number;
}

export interface IAutoZoomParams {
  isOpenLeft: boolean;
  isOpenRight: boolean;
  leftSidebarProps?: ISidebarProps;
  rightSidebarProps?: ISidebarProps;
  allowFullCollapse?: boolean;
  currentZoom: number;
  designerWidth?: string;
  options?: IAutoZoomOptions;
}

export const DEFAULT_OPTIONS: Required<IAutoZoomOptions> = {
  // Calibrated zoom levels based on user feedback
  bothPanelsOpenZoom: 65,   // Both panels open - 60% zoom is perfect
  onePanelOpenZoom: 74,     // One panel open - 75% zoom is perfect  
  noPanelsOpenZoom: 95,     // No panels open - 95% zoom is perfect
  useCalibration: true,     // Use calibrated values by default
  minZoom: 25,
  maxZoom: 200,
  zoomIncrement: 5,
  marginFactor: 0.95,
  toolbarHeight: 140,
  paddingOffset: 48,
};

/**
 * Calculates the optimal zoom level for a canvas based on available screen space
 * and sidebar panel configurations.
 * 
 * @param params - Parameters for zoom calculation
 * @returns The optimal zoom percentage (25-200)
 */
export function calculateAutoZoom(params: IAutoZoomParams): number {
  const {
    isOpenLeft,
    isOpenRight,
    leftSidebarProps,
    rightSidebarProps,
    allowFullCollapse,
    currentZoom,
    options = {},
    designerWidth
  } = params;

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // If using calibration mode, use the predefined optimal zoom levels
  if (opts.useCalibration) {
    const leftOpen = leftSidebarProps && (leftSidebarProps.open || isOpenLeft);
    const rightOpen = rightSidebarProps && (rightSidebarProps.open || isOpenRight);
    
    let baseZoom: number;
    
    if (leftOpen && rightOpen) {
      // Both panels open
      baseZoom = opts.bothPanelsOpenZoom;
    } else if (leftOpen || rightOpen) {
      // One panel open
      baseZoom = opts.onePanelOpenZoom;
    } else {
      // No panels open (or collapsed)
      baseZoom = opts.noPanelsOpenZoom;
    }
    
    // Apply dynamic scaling based on screen size
    const referenceWidth = 1920; // Assume calibration was done on a 1920px wide screen
    const currentWidth = window.innerWidth;
    const scaleFactor = currentWidth / referenceWidth;
    
    let adjustedZoom = baseZoom * Math.sqrt(scaleFactor); // Square root for more gradual scaling
    
    // Clamp zoom between bounds
    adjustedZoom = Math.max(opts.minZoom, Math.min(opts.maxZoom, adjustedZoom));
    
    // Round to nearest increment for cleaner values
    adjustedZoom = Math.round(adjustedZoom / opts.zoomIncrement) * opts.zoomIncrement;
    
    return adjustedZoom;
  }
  
  // Fallback to dynamic calculation if calibration is disabled
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Calculate available width based on actual panel sizes
  let availableWidth = screenWidth;
  const leftSidebarWidth = 550; // from styles
  
  if (!allowFullCollapse) {
    // Account for left panel
    if (leftSidebarProps) {
      const leftPanelSize = (leftSidebarProps.open || isOpenLeft) ? leftSidebarWidth : 35;
      availableWidth -= leftPanelSize;
    }
    
    // Account for right panel  
    if (rightSidebarProps) {
      const rightPanelSize = (rightSidebarProps.open || isOpenRight) ? leftSidebarWidth : 35;
      availableWidth -= rightPanelSize;
    }
  }
  
  // Account for padding, borders, and gutters
  availableWidth -= opts.paddingOffset;
  
  // Calculate available height (account for toolbar, headers, etc.)
  const availableHeight = screenHeight - opts.toolbarHeight;
  
  // Try to get actual content dimensions from the main area
  const mainAreaElement = document.querySelector('.sidebar-container-main-area-body');
  let contentWidth = 800; // fallback
  let contentHeight = 600; // fallback
  
  if (mainAreaElement) {
    const rect = mainAreaElement.getBoundingClientRect();
    // Get the natural content size (without zoom)
    contentWidth = Math.max(rect.width / (currentZoom / 100), 800);
    contentHeight = Math.max(rect.height / (currentZoom / 100), 600);
  }
  
  // Calculate zoom ratios for both width and height
  const widthZoomRatio = (availableWidth / contentWidth) * 100;
  const heightZoomRatio = (availableHeight / contentHeight) * 100;
  
  // Use the smaller ratio to ensure content fits in both dimensions
  let optimalZoom = Math.min(widthZoomRatio, heightZoomRatio) * opts.marginFactor;
  
  // Clamp zoom between bounds
  optimalZoom = Math.max(opts.minZoom, Math.min(opts.maxZoom, optimalZoom));
  
  // Round to nearest increment for cleaner values
  optimalZoom = Math.round(optimalZoom / opts.zoomIncrement) * opts.zoomIncrement;
  
  return optimalZoom;
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
    if (!element) return;
    
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  return elementRef;
};