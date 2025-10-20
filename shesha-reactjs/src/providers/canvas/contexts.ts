import { createNamedContext } from '@/utils/react';
import { defaultDesignerWidth } from './utils';

export type IDeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';
export type IViewType = 'configStudio' | 'page' | 'modal';

export interface ICanvasStateContext {
  zoom?: number;
  autoZoom?: boolean;
  designerWidth?: string;
  designerDevice?: IDeviceTypes;
  physicalDevice?: IDeviceTypes;
  activeDevice?: IDeviceTypes;
  configTreePanelSize?: number;
  viewType?: IViewType;
}

export interface ICanvasWidthProps {
  width: number | string;
  deviceType: string;
}
export interface ICanvasActionsContext {
  setDesignerDevice: (deviceType: IDeviceTypes) => void;
  setCanvasWidth: (width: number | string, deviceType: IDeviceTypes) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasAutoZoom: () => void;
  setConfigTreePanelSize: (size: number) => void;
  setViewType: (viewType: IViewType) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONTEXT_INITIAL_STATE: ICanvasStateContext = {
  zoom: 100,
  autoZoom: true,
  designerDevice: 'desktop',
  designerWidth: defaultDesignerWidth,
  configTreePanelSize: typeof window !== 'undefined' ? (20 / 100) * window.innerWidth : 200,
  viewType: 'configStudio',
};

export const CanvasStateContext = createNamedContext<ICanvasStateContext>(CANVAS_CONTEXT_INITIAL_STATE, "CanvasConfigStateContext");

export const CanvasActionsContext = createNamedContext<ICanvasActionsContext>(undefined, "CanvasConfigActionsContext");

//#endregion
