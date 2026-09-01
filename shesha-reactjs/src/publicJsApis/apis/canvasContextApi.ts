export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';

export interface ICanvasActions {
  setDesignerDevice(deviceType: DeviceTypes): void;
  setCanvasWidth(width: number | string, deviceType: DeviceTypes): void;
  setCanvasZoom(zoom: number): void;
  setCanvasAutoZoom(value?: boolean): void;
  setCanvasAutoWidth(value?: boolean): void;
  setCanvasWidthPercent(percent: number): void;
  setManualZoom(zoom: number): void;
}

export interface ICanvasContextApi {
  zoom?: number;
  /** "Canvas" preset: width tracks the available space instead of a device preset. */
  autoWidth?: boolean;
  /** Share of the available space taken while `autoWidth` is on. 100 is the maximum. */
  widthPercent?: number;
  designerWidth?: string;
  designerDevice?: DeviceTypes;
  physicalDevice?: DeviceTypes;
  activeDevice?: DeviceTypes;
  api: ICanvasActions;
}

