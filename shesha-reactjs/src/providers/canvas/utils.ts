import { IDeviceTypes } from "./contexts";

export const getDeviceTypeByWidth = (width: number): IDeviceTypes => {
  return width > 724
    ? 'desktop'
    : width > 599
      ? 'tablet'
      : 'mobile';
};

export const getWidthByDeviceType = (deviceType: IDeviceTypes): string => {
  return deviceType === 'desktop'
    ? '100%'
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