import { IDeviceTypes, IViewType } from "./contexts";
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { MutableRefObject, useCallback, useEffect, useRef } from 'react';

export const getDeviceTypeByWidth = (width: number): IDeviceTypes => {
  return width > 724
    ? 'desktop'
    : width > 599
      ? 'tablet'
      : 'mobile';
};

export const getWidthByDeviceType = (deviceType: IDeviceTypes): string => {
  return deviceType === 'desktop'
    ? '1024px'
    : deviceType === 'tablet'
      ? '724px'
      : '599px';
};

export const getBiggerDevice = (a: IDeviceTypes, b: IDeviceTypes): IDeviceTypes => {
  return a === 'desktop' || b === 'desktop'
    ? 'desktop'
    : a === 'tablet' || b === 'tablet'
      ? 'tablet'
      : 'mobile';
};

export const getSmallerDevice = (a: IDeviceTypes, b: IDeviceTypes): IDeviceTypes => {
  return a === 'mobile' || b === 'mobile'
    ? 'mobile'
    : a === 'tablet' || b === 'tablet'
      ? 'tablet'
      : 'desktop';
};


export function widthRelativeToCanvas(width: string | number, canvasWidth: string = '100vw'): string {
  if (typeof width === 'number') {
    return `${width}px`;
  }

  const trimmed = String(width).trim();
  const vwRegex = /^([\d.]+)\s*vw$/i;
  const vwMatch = vwRegex.exec(trimmed);

  if (vwMatch && vwMatch[1] !== undefined) {
    const percentageOfCanvas = parseFloat(vwMatch[1]);
    if (!Number.isNaN(percentageOfCanvas)) {
      return `calc((${percentageOfCanvas} * ${canvasWidth}) / 100)`;
    }
  }

  return trimmed;
}

export const defaultDesignerWidth = `${(typeof window !== 'undefined' ? window.screen.availWidth : 1024)}px`;

export interface IAutoZoomParams {
  currentZoom: number;
  designerWidth?: string;
  sizes?: number[];
  isSidebarCollapsed?: boolean;
  configTreePanelSize?: number;
  viewType?: IViewType;
};

export const DEFAULT_OPTIONS = {
  minZoom: 25,
  maxZoom: 200,
  sizes: [25, 50, 25],
  configTreePanelWidth: (val: number = 20): number => typeof window !== 'undefined' ? (val / 100) * window.innerWidth : 200,
  gutter: 4,
  designerWidth: defaultDesignerWidth,
};

const SIDEBAR_WIDTH = {
  COLLAPSED: 60,
  EXPANDED: 250,
  MINIMAL: 32,
} as const;

const valueToPercent = (value: number): number => value / 100;

export function calculateAutoZoom(params: IAutoZoomParams): number {
  const {
    designerWidth = DEFAULT_OPTIONS.designerWidth,
    sizes = DEFAULT_OPTIONS.sizes,
    configTreePanelSize = DEFAULT_OPTIONS.configTreePanelWidth(),
    viewType = 'configStudio',
    isSidebarCollapsed = false,
  } = params;
  const availableWidthPercent = sizes[1];

  if (typeof window === 'undefined') {
    return 100;
  }

  const guttersAndScrollersSize = 14;
  const windowWidth = window.screen.availWidth;

  // Determine the offset based on view type
  let offset: number;
  if (viewType === 'configStudio') {
    // Use configTreePanelSize for config studio
    offset = configTreePanelSize;
  } else if (viewType === 'page') {
    // Use sidebar width for regular pages
    // When collapsed: 32px, when expanded: 250px
    offset = isSidebarCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED;
  } else {
    offset = SIDEBAR_WIDTH.MINIMAL;
  }

  const viewportWidth = Math.max(0, windowWidth - offset - guttersAndScrollersSize);
  const availableWidth = valueToPercent(availableWidthPercent) * viewportWidth;

  let canvasWidth: number;
  if (designerWidth.includes('px')) {
    canvasWidth = parseFloat(designerWidth.replace('px', ''));
  } else if (designerWidth.includes('vw')) {
    const vwValue = parseFloat(designerWidth.replace('vw', ''));
    canvasWidth = (vwValue / 100) * windowWidth;
  } else {
    canvasWidth = parseFloat(designerWidth);
  }

  const optimalZoom = (availableWidth / canvasWidth) * 100;
  return Math.max(DEFAULT_OPTIONS.minZoom, Math.min(DEFAULT_OPTIONS.maxZoom, Math.round(optimalZoom)));
}

export const usePinchZoom = (
  onZoomChange: (zoom: number) => void,
  currentZoom: number,
  minZoom: number = DEFAULT_OPTIONS.minZoom,
  maxZoom: number = DEFAULT_OPTIONS.maxZoom,
  isAutoWidth: boolean = false,
): MutableRefObject<HTMLDivElement> => {
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
    const element = elementRef?.current;
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
    label: 'Desktop 1920', value: '1920px', icon: DesktopOutlined,
  },
  {
    label: 'Default', value: defaultDesignerWidth, icon: DesktopOutlined,
  },
];
