import { deepMergeValues } from "@/utils/object";
import type { DeviceTypes } from "./contexts";
import { DEFAULT_OPTIONS, MAX_CANVAS_WIDTH_PERCENT, defaultDesignerWidth } from "./constants";
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { RefObject, useCallback, useEffect, useRef } from 'react';

// Re-exported for the existing `@/providers/canvas/utils` consumers, ZoomableCanvas among them.
// The values themselves live in the leaf `constants` module because `contexts.ts` reads them while
// building its initial state, which happens before this module has finished evaluating.
export { DEFAULT_OPTIONS, MAX_CANVAS_WIDTH_PERCENT, defaultDesignerWidth };

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


/**
 * Converts viewport units (vw/vh) to be relative to a specific canvas dimension
 * @param dimension - The dimension value (e.g., "50vw", "100vh", "100px", 300)
 * @param canvasDimension - The canvas dimension to calculate relative to (e.g., '100vw', '1024px')
 * @param unit - The unit type to convert ('vw' or 'vh')
 * @returns The converted dimension string
 */
export const dimensionRelativeToCanvas = (
  dimension: string | number,
  canvasDimension: string,
  unit: 'vw' | 'vh',
): string => {
  if (typeof dimension === 'number') {
    return `${dimension}px`;
  }

  const trimmed = String(dimension).trim();
  const unitRegex = new RegExp(`^([\\d.]+)\\s*${unit}$`, 'i');
  const unitMatch = unitRegex.exec(trimmed);

  if (unitMatch && unitMatch[1] !== undefined) {
    const percentageOfCanvas = parseFloat(unitMatch[1]);
    if (!Number.isNaN(percentageOfCanvas)) {
      return `calc((${percentageOfCanvas} * ${canvasDimension}) / 100)`;
    }
  }

  return trimmed;
};

/** Sentinel value for the responsive Canvas preset in the dropdown */
export const CANVAS_PRESET_SENTINEL = '__CANVAS_RESPONSIVE__' as const;

const PERCENT_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;

/** A percentage canvas width that has been read and bounded. */
export interface ICanvasWidthPercent {
  /** The percentage to apply, never above `MAX_CANVAS_WIDTH_PERCENT`. */
  percent: number;
  /** True when the entered value was above the maximum and has been overridden. */
  wasClamped: boolean;
}

/**
 * Reads a percentage width entered as a custom resolution (e.g. "80%") and bounds it to
 * (0, `MAX_CANVAS_WIDTH_PERCENT`]. Anything above the maximum is overridden to it and reported via
 * `wasClamped`, so the caller can tell the user their value was not applied as they typed it.
 *
 * Returns `undefined` for anything that is not a usable percentage width: a device preset such as
 * "1024px", a malformed entry such as "abc%" or "-10%" (the pattern admits no sign, so a negative
 * never reaches the range check), and "0%" - well-formed, but not a width the canvas can take. The
 * caller ignores those rather than guessing: a typo should not quietly resize the canvas.
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
 * Width the canvas must be laid out at, in its own (pre-zoom) coordinate space, so that after the
 * CSS `zoom` is applied it renders exactly `availableWidth` wide - i.e. it fills the area between
 * the Builder Components and Properties panels with no horizontal scrollbar.
 *
 * Because `zoom` scales layout, dividing by the zoom factor means zooming out widens the layout
 * (components get more room and re-wrap) while each component keeps the rendered scale the user
 * picked, instead of the canvas overflowing its pane.
 *
 * `widthPercent` takes the canvas to a fraction of that space, for a percentage entered as a custom
 * resolution. It is bounded to `MAX_CANVAS_WIDTH_PERCENT` here as well as at the point of entry, so
 * a value arriving by any other route (persisted state, the context API) still cannot exceed the
 * pane.
 */
export const getCanvasLayoutWidth = (availableWidth: number, zoom: number, widthPercent: number = MAX_CANVAS_WIDTH_PERCENT): string => {
  const zoomFactor = (zoom > 0 ? zoom : DEFAULT_OPTIONS.defaultZoom) / 100;
  const fraction = Number.isFinite(widthPercent) && widthPercent > 0
    ? Math.min(widthPercent, MAX_CANVAS_WIDTH_PERCENT) / 100
    : 1;
  // Floor so sub-pixel rounding can never push the canvas past the available space
  return `${Math.max(0, Math.floor((availableWidth * fraction) / zoomFactor))}px`;
};

export interface IAutoZoomParams {
  currentZoom: number;
  designerWidth?: string;
  containerWidth: number;
};

/**
 * Constrains a zoom percentage to the range the canvas supports. Non-numeric input (e.g. a value
 * restored from storage that was never a number) falls back to the default zoom.
 */
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
    if (isZoomLocked || !e.ctrlKey) return;

    e.preventDefault();
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

