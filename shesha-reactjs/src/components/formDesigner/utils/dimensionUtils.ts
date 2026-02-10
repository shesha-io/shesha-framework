import { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { IStyleType } from '@/index';
import { DESIGNER_DIMENSIONS } from './designerConstants';

export interface DimensionConfig {
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  minWidth?: string | number;
  maxHeight?: string | number;
  minHeight?: string | number;
  flexBasis?: string | number;
}

/* eslint-disable @stylistic/no-trailing-spaces */
/**
 * Dimension utility functions for form designer components.
 *
 * This namespace provides functions for calculating and managing component dimensions
 * in both designer and live modes, including handling the wrapper pattern where
 * components fill 100% of their container in designer mode.
 *
 * @example
 * ```tsx
 * import { dimensionUtils } from '@/components/formDesigner/utils/dimensionUtils';
 *
 * const dims = dimensionUtils.getComponentDimensions(typeInfo, dimensionsStyles, jsStyle);
 * const merged = dimensionUtils.mergeWithDesignerDimensions(baseStyle, isDesignerMode, false);
 * ```
 */
export const dimensionUtils = {
  /**
   * Gets component dimensions based on component type.
   *
   * For components that preserve their dimensions, returns 'auto'.
   * For other components, returns the calculated dimensions from styles.
   */
  getComponentDimensions(
    typeInfo: ComponentTypeInfo,
    dimensionsStyles: CSSProperties,
    jsStyle: CSSProperties,
  ): CSSProperties {
    const { preserveDimensionsInDesigner } = typeInfo;

    const width = preserveDimensionsInDesigner
      ? 'auto'
      : jsStyle?.width ?? dimensionsStyles?.width ?? 'auto';

    const height = preserveDimensionsInDesigner
      ? 'auto'
      : jsStyle?.height ?? dimensionsStyles?.height ?? 'auto';

    const getDimensionValue = (dimensionType: keyof DimensionConfig): string | number | undefined => {
      if (preserveDimensionsInDesigner) return undefined;
      return jsStyle?.[dimensionType] ?? dimensionsStyles?.[dimensionType];
    };

    const flexBasis = preserveDimensionsInDesigner
      ? undefined
      : (jsStyle?.maxWidth ?? dimensionsStyles?.maxWidth ?? dimensionsStyles?.width);

    return {
      width,
      height,
      maxWidth: getDimensionValue('maxWidth'),
      minWidth: getDimensionValue('minWidth'),
      maxHeight: getDimensionValue('maxHeight'),
      minHeight: getDimensionValue('minHeight'),
      flexBasis,
    };
  },

  /**
   * Returns 100% dimensions for components wrapped in the root container.
   * The wrapper handles actual sizing, so components fill 100% of the wrapper.
   */
  getDeviceDimensions(): IStyleType['dimensions'] {
    return { ...DESIGNER_DIMENSIONS };
  },

  /**
   * Gets the flex-basis value from dimension styles.
   * Uses maxWidth if available, otherwise falls back to width.
   */
  getDeviceFlexBasis(dimensionsStyles: CSSProperties): string | number | undefined {
    return dimensionsStyles?.maxWidth || dimensionsStyles?.width;
  },

  /**
   * Gets component dimensions based on current form mode.
   *
   * In designer mode:
   * - If component preserves dimensions: returns original dimensions
   * - Otherwise: returns 100% width/height to fill wrapper
   *
   * In live/edit mode: returns original dimensions
   */
  getComponentDimensionsForMode(
    typeInfo: ComponentTypeInfo,
    dimensionsStyles: CSSProperties,
    isDesignerMode: boolean,
  ): CSSProperties {
    // In live mode, always use original dimensions
    if (!isDesignerMode) {
      return dimensionsStyles;
    }

    // In designer mode, components preserving dimensions keep original dimensions
    if (typeInfo.preserveDimensionsInDesigner) {
      return dimensionsStyles;
    }

    // Standard components fill wrapper in designer mode
    return { ...DESIGNER_DIMENSIONS };
  },

  /**
   * Merges base styles with designer mode overrides.
   *
   * In designer mode, applies 100% width and height to ensure components
   * fill their wrapper containers. In live mode, returns base styles unchanged.
   */
  mergeWithDesignerDimensions(
    baseStyle: CSSProperties,
    isDesignerMode: boolean,
    preserveDimensions: boolean = false,
  ): CSSProperties {
    if (!isDesignerMode || preserveDimensions) {
      return baseStyle;
    }

    return {
      ...baseStyle,
      ...DESIGNER_DIMENSIONS,
    };
  },

  /**
   * Hook-compatible version of mergeWithDesignerDimensions.
   * Returns a function that can be used in components.
   */
  getDesignerDimensionsMerger(isDesignerMode: boolean) {
    return (baseStyle: CSSProperties, preserveDimensions: boolean = false): CSSProperties => {
      return dimensionUtils.mergeWithDesignerDimensions(baseStyle, isDesignerMode, preserveDimensions);
    };
  },
};

// Re-export individual functions for backward compatibility and tree-shaking
export const {
  getComponentDimensions,
  getDeviceDimensions,
  getDeviceFlexBasis,
  getComponentDimensionsForMode,
  mergeWithDesignerDimensions,
  getDesignerDimensionsMerger,
} = dimensionUtils;
