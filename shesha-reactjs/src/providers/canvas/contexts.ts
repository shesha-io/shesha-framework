import { createNamedContext } from '@/utils/react';
import { defaultDesignerWidth } from './utils';

export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';
export type IViewType = 'configStudio' | 'page' | 'modal';

export interface ICanvasStateContext {
  zoom: number;
  autoZoom: boolean;
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
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONTEXT_INITIAL_STATE: ICanvasStateContext = {
  zoom: 80,
  autoZoom: false,
  designerDevice: 'desktop',
  designerWidth: defaultDesignerWidth,
};

export const CanvasStateContext = createNamedContext<ICanvasStateContext | undefined>(undefined, "CanvasConfigStateContext");

export const CanvasActionsContext = createNamedContext<ICanvasActionsContext | undefined>(undefined, "CanvasConfigActionsContext");

//#endregion
