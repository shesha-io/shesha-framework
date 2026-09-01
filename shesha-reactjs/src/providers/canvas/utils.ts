import { deepMergeValues } from "@/utils/object";
import type { DeviceTypes } from "./contexts";
import { DEFAULT_OPTIONS, MAX_CANVAS_WIDTH_PERCENT, defaultDesignerWidth, dimensionRelativeToCanvas } from "./constants";
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { RefObject, useCallback, useEffect, useRef } from 'react';

// Re-exported for existing `@/providers/canvas/utils` consumers; they live in `constants` to
// break an import cycle.
export { DEFAULT_OPTIONS, MAX_CANVAS_WIDTH_PERCENT, defaultDesignerWidth, dimensionRelativeToCanvas };

export const getDeviceTypeByWidth = (width: number): DeviceTypes => {
  return width > 724
    ? 'desktop'
    : width > 599
      ? 'tablet'
      : 'mobile';
};

export const getWidthByDeviceType = (deviceType: DeviceTypes): string => {
  return deviceType === 'desktop'
    ? '1024px'
    : deviceType === 'tablet'
      ? '724px'
      : '599px';
};

export const getBiggerDevice = (a: DeviceTypes, b: DeviceTypes): DeviceTypes => {
  return a === 'desktop' || b === 'desktop'
    ? 'desktop'
    : a === 'tablet' || b === 'tablet'
      ? 'tablet'
      : 'mobile';
};

export const getSmallerDevice = (a: DeviceTypes, b: DeviceTypes): DeviceTypes => {
  return a === 'mobile' || b === 'mobile'
    ? 'mobile'
    : a === 'tablet' || b === 'tablet'
      ? 'tablet'
      : 'desktop';
};


/** Sentinel value for the responsive Canvas preset in the dropdown */
export const CANVAS_PRESET_SENTINEL = '__CANVAS_RESPONSIVE__' as const;

const PERCENT_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;

/** A percentage canvas width, read and bounded. */
export interface ICanvasWidthPercent {
  percent: number;
  /** True when the entered value was above the maximum and was overridden. */
  wasClamped: boolean;
}

/**
 * Reads a percentage width entered as a custom resolution, e.g. "80%", bounded to
 * (0, `MAX_CANVAS_WIDTH_PERCENT`]. Returns undefined for anything that is not a usable percentage -
 * a "1024px" preset, "abc%", "-10%", "0%" - which the caller ignores rather than guessing at.
 */
export const parseCanvasWidthPercent = (value: string): ICanvasWidthPercent | undefined => {
  const match = PERCENT_WIDTH_REGEX.exec(value);
  if (!match) return undefined;

  const percent = parseFloat(match[1] ?? '');
  if (!Number.isFinite(percent) || percent <= 0)
    return undefined;

  return percent > MAX_CANVAS_WIDTH_PERCENT
    ? { percent: MAX_CANVAS_WIDTH_PERCENT, wasClamped: true }
    : { percent, wasClamped: false };
};

/**
 * Pre-zoom layout width that renders exactly `availableWidth` wide once CSS `zoom` is applied, so
 * zooming out re-wraps components into more room instead of overflowing the pane. `widthPercent`
 * takes only a fraction of that space, and is bounded here as well as at the point of entry.
 */
export const getCanvasLayoutWidth = (availableWidth: number, zoom: number, widthPercent: number = MAX_CANVAS_WIDTH_PERCENT): string => {
  const zoomFactor = (zoom > 0 ? zoom : DEFAULT_OPTIONS.defaultZoom) / 100;
  const fraction = Number.isFinite(widthPercent) && widthPercent > 0
    ? Math.min(widthPercent, MAX_CANVAS_WIDTH_PERCENT) / 100
    : 1;
  // Floor so sub-pixel rounding cannot push the canvas past the available space.
  return `${Math.max(0, Math.floor((availableWidth * fraction) / zoomFactor))}px`;
};

/** On-screen width the canvas covers, which the device resolves from. Independent of zoom. */
export const getCanvasDeviceWidth = (availableWidth: number, widthPercent: number = MAX_CANVAS_WIDTH_PERCENT): string => {
  const fraction = Number.isFinite(widthPercent) && widthPercent > 0
    ? Math.min(widthPercent, MAX_CANVAS_WIDTH_PERCENT) / 100
    : 1;
  return `${Math.max(0, Math.floor(availableWidth * fraction))}px`;
};

/** Pre-zoom height that fills the pane exactly once CSS `zoom` is applied. */
export const getCanvasLayoutHeight = (availableHeight: number, zoom: number): string => {
  const zoomFactor = (zoom > 0 ? zoom : DEFAULT_OPTIONS.defaultZoom) / 100;
  return `${Math.max(0, Math.floor(availableHeight / zoomFactor))}px`;
};

export interface IAutoZoomParams {
  currentZoom: number;
  designerWidth?: string;
  containerWidth: number;
};

/** Non-numeric input - e.g. a storage value that was never a number - falls back to the default. */
export const clampZoom = (zoom: number): number =>
  Number.isFinite(zoom)
    ? Math.max(DEFAULT_OPTIONS.minZoom, Math.min(DEFAULT_OPTIONS.maxZoom, zoom))
    : DEFAULT_OPTIONS.defaultZoom;

export function calculateAutoZoom(params: IAutoZoomParams): number {
  if (typeof window === 'undefined')
    return 100;

  const {
    designerWidth = DEFAULT_OPTIONS.designerWidth,
    containerWidth,
  } = params;

  const windowWidth = window.innerWidth;

  let canvasWidth: number;
  if (designerWidth.includes('px')) {
    canvasWidth = parseFloat(designerWidth.replace('px', ''));
  } else if (designerWidth.includes('vw')) {
    const vwValue = parseFloat(designerWidth.replace('vw', ''));
    canvasWidth = (vwValue / 100) * windowWidth;
  } else {
    canvasWidth = parseFloat(designerWidth);
  }

  const optimalZoom = (containerWidth / canvasWidth) * 100;
  return Math.max(DEFAULT_OPTIONS.minZoom, Math.min(DEFAULT_OPTIONS.maxZoom, Math.floor(optimalZoom)));
}

export const usePinchZoom = (
  onZoomChange: (zoom: number) => void,
  currentZoom: number,
  minZoom: number = DEFAULT_OPTIONS.minZoom,
  maxZoom: number = DEFAULT_OPTIONS.maxZoom,
  /** Suppresses manual pinch/ctrl+wheel zoom while the zoom level is driven automatically. */
  isZoomLocked: boolean = false,
): RefObject<HTMLDivElement | null> => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastDistance = useRef<number>(0);
  const initialZoom = useRef<number>(currentZoom);

  const getDistance = useCallback((touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    if (!touch1 || !touch2) return 0;
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2),
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isZoomLocked || e.touches.length !== 2) return;

    e.preventDefault();
    lastDistance.current = getDistance(e.touches);
    initialZoom.current = currentZoom;
  }, [getDistance, currentZoom, isZoomLocked]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isZoomLocked || e.touches.length !== 2) return;

    e.preventDefault();
    const currentDistance = getDistance(e.touches);

    if (lastDistance.current > 0) {
      const scale = currentDistance / lastDistance.current;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, initialZoom.current * scale));
      onZoomChange(Math.round(newZoom));
    }
  }, [getDistance, onZoomChange, minZoom, maxZoom, isZoomLocked]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey) return;

    // Swallowed before the lock check: leaving it to the browser page-zooms the whole designer.
    e.preventDefault();
    if (isZoomLocked) return;
    const delta = e.deltaY > 0 ? -DEFAULT_OPTIONS.zoomStep : DEFAULT_OPTIONS.zoomStep;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
    onZoomChange(newZoom);
  }, [onZoomChange, currentZoom, minZoom, maxZoom, isZoomLocked]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistance.current = 0;
    }
  }, []);


  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    // Wheel zoom (ctrl + wheel)
    element.addEventListener('wheel', handleWheel, { passive: false });

    // Touch pinch zoom
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  return elementRef;
};

export const screenSizeOptions = [
  {
    label: 'Canvas', value: CANVAS_PRESET_SENTINEL, icon: DesktopOutlined,
  },
  {
    label: 'iPhone SE', value: '375px', icon: MobileOutlined,
  },
  {
    label: 'iPhone XR/12/13/14', value: '414px', icon: MobileOutlined,
  },
  {
    label: 'Pixel 5', value: '393px', icon: MobileOutlined,
  },
  {
    label: 'Samsung Galaxy S8+', value: '360px', icon: MobileOutlined,
  },
  {
    label: 'iPad Mini', value: '768px', icon: TabletOutlined,
  },
  {
    label: 'iPad Air/Pro', value: '820px', icon: TabletOutlined,
  },
  {
    label: 'Surface Duo', value: '540px', icon: TabletOutlined,
  },
  {
    label: 'Surface Pro 7', value: '912px', icon: DesktopOutlined,
  },
  {
    label: 'Desktop 1024', value: '1024px', icon: DesktopOutlined,
  },
  {
    label: 'Desktop 1440', value: '1440px', icon: DesktopOutlined,
  },
  {
    label: 'Full HD 1920x1080', value: '1920px', icon: DesktopOutlined,
  },
];

export const getDeviceStyle = (data: Record<string, object | undefined> | undefined, device: DeviceTypes | undefined, defaultDevice: DeviceTypes = 'desktop'): object | undefined => {
  if (!data) return {};
  if (!device) return data[defaultDevice] ?? {};
  return deepMergeValues(data[defaultDevice] ?? {}, data[device] ?? {});
};

