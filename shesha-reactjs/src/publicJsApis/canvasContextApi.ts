export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';

export interface ICanvasActions {
  setDesignerDevice(deviceType: DeviceTypes): void;
  setCanvasWidth(width: number | string, deviceType: DeviceTypes): void;
  setCanvasZoom(zoom: number): void;
}

export interface ICanvasContextApi {
  zoom?: number;
  designerWidth?: string;
  designerDevice?: DeviceTypes;
  physicalDevice?: DeviceTypes;
  activeDevice?: DeviceTypes;
  api: ICanvasActions;
}

