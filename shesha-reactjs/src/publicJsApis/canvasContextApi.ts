export type IDeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';

export interface ICanvasActions {
  setDesignerDevice(deviceType: IDeviceTypes): void;
  setCanvasWidth(width: number | string, deviceType: IDeviceTypes): void;
  setCanvasZoom(zoom: number): void;
}

export interface ICanvasContextApi {
  zoom?: number;
  designerWidth?: string;
  designerDevice?: IDeviceTypes;
  physicalDevice?: IDeviceTypes;
  activeDevice?: IDeviceTypes;
  api: ICanvasActions;
}

