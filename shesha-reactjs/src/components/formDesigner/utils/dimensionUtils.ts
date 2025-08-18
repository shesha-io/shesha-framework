import { ComponentTypeInfo } from './componentTypeUtils';

export interface DimensionConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

export interface ComponentDimensions {
  width: string;
  height: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

export const getComponentDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: any,
  desktopConfig: any
): ComponentDimensions => {
  const { isDataTableContext, isFileComponent, isPasswordCombo, isInput } = typeInfo;

  const width = isDataTableContext 
    ? '100%' 
    : isFileComponent 
      ? desktopConfig?.container?.dimensions?.width 
      : dimensionsStyles?.width || 'auto';

  const height = isPasswordCombo 
    ? 'auto' 
    : isDataTableContext 
      ? '100%' 
      : isFileComponent 
        ? desktopConfig?.container?.dimensions?.height 
        : isInput 
          ? 'auto' 
          : dimensionsStyles?.height;

  const getDimensionValue = (dimensionType: keyof DimensionConfig) => {
    if (isDataTableContext) return '100%';
    if (isFileComponent) return desktopConfig?.container?.dimensions?.[dimensionType];
    return dimensionsStyles?.[dimensionType];
  };

  const flexBasis = isFileComponent 
    ? desktopConfig?.container?.dimensions?.width 
    : dimensionsStyles?.maxWidth || dimensionsStyles?.width;

  return {
    width,
    height,
    maxWidth: getDimensionValue('maxWidth'),
    minWidth: getDimensionValue('minWidth'),
    maxHeight: getDimensionValue('maxHeight'),
    minHeight: getDimensionValue('minHeight'),
    flexBasis,
  };
};

export const getDeviceDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: any
) => {
  const { isFileComponent, isPasswordCombo, isInput } = typeInfo;
  
  if (isFileComponent) return undefined;
  
  return {
    width: '100%',
    height: isPasswordCombo || isInput ? dimensionsStyles?.height : '100%'
  };
};

export const getDeviceFlexBasis = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: any,
  desktopConfig: any
) => {
  const { isFileComponent } = typeInfo;
  
  if (isFileComponent) return desktopConfig?.container?.dimensions?.width;
  return dimensionsStyles?.width;
};