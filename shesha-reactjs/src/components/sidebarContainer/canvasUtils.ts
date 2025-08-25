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

/**
 * Utility to normalize numeric widths to px strings while passing through CSS strings untouched.
 */
export function toCssWidth(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : String(value).trim();
}

import { ISidebarProps } from './models';

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
  options?: IAutoZoomOptions;
}

const DEFAULT_OPTIONS: Required<IAutoZoomOptions> = {
  // Calibrated zoom levels based on user feedback
  bothPanelsOpenZoom: 60,   // Both panels open - 60% zoom is perfect
  onePanelOpenZoom: 75,     // One panel open - 75% zoom is perfect  
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
    options = {}
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

/**
 * Gets debug information about the auto-zoom calculation
 */
export function getAutoZoomDebugInfo(params: IAutoZoomParams): any {
  const {
    isOpenLeft,
    isOpenRight,
    leftSidebarProps,
    rightSidebarProps,
    allowFullCollapse,
    currentZoom,
    options = {}
  } = params;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const leftOpen = leftSidebarProps && (leftSidebarProps.open || isOpenLeft);
  const rightOpen = rightSidebarProps && (rightSidebarProps.open || isOpenRight);
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  let panelState = 'none';
  if (leftOpen && rightOpen) {
    panelState = 'both';
  } else if (leftOpen || rightOpen) {
    panelState = 'one';
  }

  const optimalZoom = calculateAutoZoom(params);

  let debugInfo: any = {
    mode: opts.useCalibration ? 'calibration' : 'dynamic',
    panelState,
    screenWidth,
    screenHeight,
    optimalZoom,
    panelStates: {
      leftOpen,
      rightOpen,
      leftPanelExists: !!leftSidebarProps,
      rightPanelExists: !!rightSidebarProps,
      allowFullCollapse
    },
    options: opts
  };

  if (opts.useCalibration) {
    const referenceWidth = 1920;
    const scaleFactor = screenWidth / referenceWidth;
    let baseZoom: number;
    
    if (leftOpen && rightOpen) {
      baseZoom = opts.bothPanelsOpenZoom;
    } else if (leftOpen || rightOpen) {
      baseZoom = opts.onePanelOpenZoom;
    } else {
      baseZoom = opts.noPanelsOpenZoom;
    }

    debugInfo.calibration = {
      baseZoom,
      referenceWidth,
      scaleFactor,
      adjustedZoom: baseZoom * Math.sqrt(scaleFactor)
    };
  } else {
    // Dynamic calculation debug info
    let availableWidth = screenWidth;
    const leftSidebarWidth = 550;
    
    if (!allowFullCollapse) {
      if (leftSidebarProps) {
        const leftPanelSize = leftOpen ? leftSidebarWidth : 35;
        availableWidth -= leftPanelSize;
      }
      if (rightSidebarProps) {
        const rightPanelSize = rightOpen ? leftSidebarWidth : 35;
        availableWidth -= rightPanelSize;
      }
    }
    
    availableWidth -= opts.paddingOffset;
    const availableHeight = screenHeight - opts.toolbarHeight;
    
    const mainAreaElement = document.querySelector('.sidebar-container-main-area-body');
    let contentWidth = 800;
    let contentHeight = 600;
    
    if (mainAreaElement) {
      const rect = mainAreaElement.getBoundingClientRect();
      contentWidth = Math.max(rect.width / (currentZoom / 100), 800);
      contentHeight = Math.max(rect.height / (currentZoom / 100), 600);
    }
    
    const widthZoomRatio = (availableWidth / contentWidth) * 100;
    const heightZoomRatio = (availableHeight / contentHeight) * 100;

    debugInfo.dynamic = {
      availableWidth,
      availableHeight,
      contentWidth,
      contentHeight,
      widthZoomRatio,
      heightZoomRatio
    };
  }

  return debugInfo;
}