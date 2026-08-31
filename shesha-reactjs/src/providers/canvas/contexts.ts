import { createNamedContext } from '@/utils/react';
import { DEFAULT_OPTIONS, defaultDesignerWidth } from './constants';
import { MAX_CANVAS_WIDTH_PERCENT } from './constants';

export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';
export type IViewType = 'configStudio' | 'page' | 'modal';

export interface ICanvasStateContext {
  zoom: number;
  autoZoom: boolean;
  /** "Canvas" preset: width tracks the available space instead of a device preset. */
  autoWidth: boolean;
  /** Share of the available space taken while `autoWidth` is on. 100 is the maximum. */
  widthPercent: number;
  designerWidth: string;
  designerDevice?: DeviceTypes;
  physicalDevice?: DeviceTypes;
  activeDevice?: DeviceTypes;
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
  /** Above 100 is bounded to 100. */
  setCanvasWidthPercent: (percent: number) => void;
  /** Ignored unless `autoWidth` is on. */
  setAvailableCanvasWidth: (width: string) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONTEXT_INITIAL_STATE: ICanvasStateContext = {
  zoom: DEFAULT_OPTIONS.defaultZoom,
  autoZoom: false,
  autoWidth: true,
  widthPercent: MAX_CANVAS_WIDTH_PERCENT,
  designerDevice: 'desktop',
  designerWidth: defaultDesignerWidth,
};

export const CanvasStateContext = createNamedContext<ICanvasStateContext | undefined>(undefined, "CanvasConfigStateContext");

export const CanvasActionsContext = createNamedContext<ICanvasActionsContext | undefined>(undefined, "CanvasConfigActionsContext");

//#endregion
