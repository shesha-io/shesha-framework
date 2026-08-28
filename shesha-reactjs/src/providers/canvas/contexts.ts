import { createNamedContext } from '@/utils/react';
// From `./options` rather than `./utils`: `utils` pulls in the providers barrel, which leads back
// here, so importing it would leave these undefined while this module body runs.
import { DEFAULT_OPTIONS, defaultDesignerWidth } from './options';

export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';
export type IViewType = 'configStudio' | 'page' | 'modal';

export interface ICanvasStateContext {
  zoom: number;
  autoZoom: boolean;
  /** "Canvas" preset: the canvas width tracks the space available between the designer panels
   * instead of being pinned to a device/resolution preset. */
  autoWidth: boolean;
  designerWidth: string;
  designerDevice?: DeviceTypes;
  physicalDevice?: DeviceTypes;
  activeDevice?: DeviceTypes;
  configTreePanelSize: number;
  viewType?: IViewType;
}

export interface ICanvasWidthProps {
  width: number | string;
  deviceType: DeviceTypes;
}
export interface ICanvasActionsContext {
  setDesignerDevice: (deviceType: DeviceTypes) => void;
  setCanvasWidth: (width: number | string, deviceType: DeviceTypes) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasAutoZoom: (value?: boolean) => void;
  setCanvasAutoWidth: (value?: boolean) => void;
  /**
   * Reports the width currently available to the canvas. Ignored unless `autoWidth` is on.
   *
   * `paneWidth` is the unzoomed width of the pane, and is what picks the device - pass it whenever
   * `width` has been divided by the zoom factor. Omitting it falls back to reading the device off
   * `width`, which is only correct where the two are the same value.
   */
  setAvailableCanvasWidth: (width: string, paneWidth?: number) => void;
  setConfigTreePanelSize: (size: number) => void;
  setViewType: (viewType: IViewType) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONTEXT_INITIAL_STATE: ICanvasStateContext = {
  zoom: DEFAULT_OPTIONS.defaultZoom,
  autoZoom: false,
  autoWidth: true,
  designerDevice: 'desktop',
  designerWidth: defaultDesignerWidth,
  configTreePanelSize: typeof window !== 'undefined' ? (20 / 100) * window.innerWidth : 200,
  viewType: 'configStudio',
};

export const CanvasStateContext = createNamedContext<ICanvasStateContext | undefined>(undefined, "CanvasConfigStateContext");

export const CanvasActionsContext = createNamedContext<ICanvasActionsContext | undefined>(undefined, "CanvasConfigActionsContext");

//#endregion
