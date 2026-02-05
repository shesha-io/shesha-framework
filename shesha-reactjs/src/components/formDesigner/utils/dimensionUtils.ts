import { CSSProperties } from 'react';
import { ComponentTypeInfo, shouldSkipComponent } from './componentTypeUtils';
import { IStyleType } from '@/index';
import { DESIGNER_DIMENSIONS } from './designerConstants';

export interface DimensionConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

/**
 * Gets component dimensions based on component type.
 *
 * For components that should skip standard processing, returns 'auto'.
 * For other components, returns the calculated dimensions from styles.
 *
 * @param typeInfo - Component type classification from getComponentTypeInfo
 * @param dimensionsStyles - Calculated dimension styles from useFormComponentStyles
 * @returns CSSProperties with width, height, and other dimension values
 *
 * @example
 * ```tsx
 * const typeInfo = getComponentTypeInfo(toolboxComponent);
 * const componentDimensions = getComponentDimensions(typeInfo, dimensionsStyles);
 * // Returns: { width: '100%', height: 'auto', ... } or { width: 'auto', ... } for skipped components
 * ```
 */
export const getComponentDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: CSSProperties,
): CSSProperties => {
  const { shouldSkip } = typeInfo;

  const width = shouldSkip
    ? 'auto'
    : dimensionsStyles?.width || 'auto';

  const height = shouldSkip
    ? 'auto'
    : dimensionsStyles?.height || 'auto';

  const getDimensionValue = (dimensionType: keyof DimensionConfig): string | number => {
    if (shouldSkip) return 'auto';
    return dimensionsStyles?.[dimensionType];
  };

  const flexBasis = dimensionsStyles?.maxWidth || dimensionsStyles?.width;

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

/**
 * Returns 100% dimensions for components wrapped in the root container.
 * The wrapper handles actual sizing, so components fill 100% of the wrapper.
 *
 * @returns Dimensions object with width and height set to '100%'
 *
 * @example
 * ```tsx
 * const deviceDimensions = getDeviceDimensions();
 * // Returns: { width: '100%', height: '100%' }
 * ```
 */
export const getDeviceDimensions = (): IStyleType['dimensions'] => {
  return { ...DESIGNER_DIMENSIONS };
};

/**
 * Gets the flex-basis value from dimension styles.
 * Uses maxWidth if available, otherwise falls back to width.
 *
 * @param dimensionsStyles - The dimension styles object
 * @returns The flex-basis value (width or maxWidth)
 */
export const getDeviceFlexBasis = (
  dimensionsStyles: CSSProperties,
): string | number => {
  return dimensionsStyles?.width;
};

/**
 * Gets component dimensions based on current form mode.
 *
 * In designer mode:
 * - If component should skip: returns original dimensions
 * - Otherwise: returns 100% width/height to fill wrapper
 *
 * In live/edit mode: returns original dimensions
 *
 * @param typeInfo - Component type classification
 * @param dimensionsStyles - Original dimension styles
 * @param isDesignerMode - Whether currently in designer mode
 * @returns Appropriate dimensions for the current mode
 *
 * @example
 * ```tsx
 * const dimensions = getComponentDimensionsForMode(
 *   typeInfo,
 *   dimensionsStyles,
 *   shaForm.formMode === 'designer'
 * );
 * ```
 */
export const getComponentDimensionsForMode = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: CSSProperties,
  isDesignerMode: boolean,
): CSSProperties => {
  // In live mode, always use original dimensions
  if (!isDesignerMode) {
    return dimensionsStyles;
  }

  // In designer mode, skipped components keep original dimensions
  if (typeInfo.shouldSkip) {
    return dimensionsStyles;
  }

  // Standard components fill wrapper in designer mode
  return { ...DESIGNER_DIMENSIONS };
};

/**
 * Gets component dimensions by component type string.
 * Convenience overload for when you only have the component type string.
 *
 * @param componentType - The component type (e.g., 'textField', 'checkbox')
 * @param dimensionsStyles - Original dimension styles
 * @param isDesignerMode - Whether currently in designer mode
 * @returns Appropriate dimensions for the current mode
 */
export const getComponentDimensionsByType = (
  componentType: string | undefined,
  dimensionsStyles: CSSProperties,
  isDesignerMode: boolean,
): CSSProperties => {
  const shouldSkip = shouldSkipComponent(componentType);

  if (!isDesignerMode || shouldSkip) {
    return dimensionsStyles;
  }

  return { ...DESIGNER_DIMENSIONS };
};

/**
 * Merges base styles with designer mode overrides.
 *
 * In designer mode, applies 100% width and height to ensure components
 * fill their wrapper containers. In live mode, returns base styles unchanged.
 *
 * @param baseStyle - The base CSS styles
 * @param isDesignerMode - Whether currently in designer mode
 * @param shouldSkip - Whether to skip designer dimension overrides
 * @returns Merged styles with designer overrides if applicable
 *
 * @example
 * ```tsx
 * const finalStyle = mergeWithDesignerDimensions(
 *   { color: 'red', fontSize: '14px' },
 *   shaForm.formMode === 'designer',
 *   false
 * );
 * // In designer mode: { color: 'red', fontSize: '14px', width: '100%', height: '100%' }
 * // In live mode: { color: 'red', fontSize: '14px' }
 * ```
 */
export const mergeWithDesignerDimensions = (
  baseStyle: CSSProperties,
  isDesignerMode: boolean,
  shouldSkip: boolean = false,
): CSSProperties => {
  if (!isDesignerMode || shouldSkip) {
    return baseStyle;
  }

  return {
    ...baseStyle,
    ...DESIGNER_DIMENSIONS,
  };
};

/**
 * Hook-compatible version of mergeWithDesignerDimensions.
 * Returns a function that can be used in components.
 *
 * @param isDesignerMode - Whether currently in designer mode
 * @returns Function that merges styles with designer dimensions
 *
 * @example
 * ```tsx
 * const mergeDimensions = useDesignerDimensionsMerger(shaForm.formMode === 'designer');
 * const style = mergeDimensions(baseStyle, shouldSkipComponent(type));
 * ```
 */
export const getDesignerDimensionsMerger = (isDesignerMode: boolean) => {
  return (baseStyle: CSSProperties, shouldSkip: boolean = false): CSSProperties => {
    return mergeWithDesignerDimensions(baseStyle, isDesignerMode, shouldSkip);
  };
};
