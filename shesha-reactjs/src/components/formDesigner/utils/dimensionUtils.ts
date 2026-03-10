import { CSSProperties } from 'react';
import { IStyleType, IToolboxComponent } from '@/index';
import { DESIGNER_DIMENSIONS } from './designerConstants';

/**
 * Dimension keys that can be selectively preserved in designer mode.
 * Matches the array values allowed in preserveDimensionsInDesigner.
 */
export type PreservableDimension = 'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight';

export const ALL_DIMENSIONS_COUNT = 6;
/**
 * Normalized form of preserveDimensionsInDesigner for easier consumption.
 * Always returns a Set of dimension names that should be preserved.
 */
const normalizePreserveDimensions = (
  preserve: IToolboxComponent['preserveDimensionsInDesigner'],
): Set<PreservableDimension> => {
  if (preserve === true) {
    return new Set(['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight']);
  }
  if (Array.isArray(preserve)) {
    return new Set(preserve);
  }
  return new Set(); // false or undefined - don't preserve any
};

/**
 * Checks if a specific dimension should be preserved based on the preserveDimensionsInDesigner setting.
 */
const shouldPreserveDimension = (
  dimension: PreservableDimension,
  preserve: IToolboxComponent['preserveDimensionsInDesigner'],
): boolean => {
  const preservedSet = normalizePreserveDimensions(preserve);
  return preservedSet.has(dimension);
};


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
   * Normalizes preserveDimensionsInDesigner to a Set of preserved dimensions.
   * @param preserve - The preserve setting (boolean, array, or undefined)
   * @returns Set of dimension names that should be preserved
   */
  normalizePreserveDimensions,

  /**
   * Checks if a specific dimension should be preserved.
   * @param dimension - The dimension to check
   * @param preserve - The preserve setting
   * @returns true if the dimension should be preserved
   */
  shouldPreserveDimension,

  /**
   * Gets component dimensions based on component type.
   *
   * For components that preserve their dimensions, returns original dimensions from the model.
   * For other components, returns the calculated dimensions from styles.
   * Supports partial dimension preservation via preserveDimensionsInDesigner array.
   */
  getComponentDimensions(
    preserveDimensionsInDesigner: IToolboxComponent['preserveDimensionsInDesigner'],
    dimensionsStyles: CSSProperties,
    jsStyle: CSSProperties,
  ): CSSProperties {
    const preservedSet = normalizePreserveDimensions(preserveDimensionsInDesigner);
    const isPreserved = (dimensionType: PreservableDimension): boolean => preservedSet.has(dimensionType);

    // Helper to get dimension value with partial preservation support
    const getDimensionValue = (dimensionType: PreservableDimension): string | number | undefined => {
      if (isPreserved(dimensionType)) {
        // Return original dimension value when preserving this specific dimension
        return dimensionsStyles?.[dimensionType];
      }
      // Not preserved - use jsStyle or fall back to dimensionsStyles
      return jsStyle?.[dimensionType] ?? dimensionsStyles?.[dimensionType];
    };

    const preserveWidth = isPreserved('width');
    const preserveMaxWidth = isPreserved('maxWidth');
    const flexBasis = preserveDimensionsInDesigner && (preserveWidth || preserveMaxWidth)
      ? undefined
      : (jsStyle?.maxWidth ?? dimensionsStyles?.maxWidth ?? dimensionsStyles?.width);

    return {
      width: getDimensionValue('width'),
      height: getDimensionValue('height'),
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
    return DESIGNER_DIMENSIONS;
  },

  /**
   * Gets the flex-basis value from dimension styles.
   * Uses maxWidth if available, otherwise falls back to width.
   */
  getDeviceFlexBasis(dimensionsStyles: CSSProperties): string | number | undefined {
    return dimensionsStyles?.maxWidth ?? dimensionsStyles?.width;
  },

  /**
   * Gets component dimensions based on current form mode.
   *
   * In designer mode:
   * - If component preserves all dimensions (true): returns original dimensions
   * - If component preserves some dimensions (array): returns merged dimensions
   * - Otherwise: returns 100% width/height to fill wrapper
   *
   * In live/edit mode: returns original dimensions
   */
  getComponentDimensionsForMode(
    preserveDimensionsInDesigner: IToolboxComponent['preserveDimensionsInDesigner'],
    dimensionsStyles: CSSProperties,
    isDesignerMode: boolean,
  ): CSSProperties {
    // In live mode, always use original dimensions
    if (!isDesignerMode) {
      return dimensionsStyles;
    }

    // In designer mode, check what dimensions to preserve
    const preservedSet = normalizePreserveDimensions(preserveDimensionsInDesigner);

    // No dimensions preserved - fill wrapper completely
    if (preservedSet.size === 0) {
      return DESIGNER_DIMENSIONS;
    }

    // All dimensions preserved - return original
    if (preservedSet.size === ALL_DIMENSIONS_COUNT) { // All 6 dimension properties
      return dimensionsStyles;
    }

    // Partial preservation - merge preserved dimensions with 100% defaults
    return {
      width: preservedSet.has('width') ? dimensionsStyles?.width : DESIGNER_DIMENSIONS.width,
      height: preservedSet.has('height') ? dimensionsStyles?.height : DESIGNER_DIMENSIONS.height,
      minWidth: preservedSet.has('minWidth') ? dimensionsStyles?.minWidth : undefined,
      maxWidth: preservedSet.has('maxWidth') ? dimensionsStyles?.maxWidth : undefined,
      minHeight: preservedSet.has('minHeight') ? dimensionsStyles?.minHeight : undefined,
      maxHeight: preservedSet.has('maxHeight') ? dimensionsStyles?.maxHeight : undefined,
    };
  },

  /**
   * Merges base styles with designer mode overrides.
   *
   * In designer mode:
   * - Margins are always stripped (applied to wrapper only)
   * - If preserveDimensions is false/undefined, applies 100% width/height to fill wrapper
   * - If preserveDimensions is true, preserves all dimensions
   * - If preserveDimensions is an array, preserves only specified dimensions
   *
   * In live mode, returns base styles unchanged.
   */
  mergeWithDesignerDimensions(
    baseStyle: CSSProperties,
    isDesignerMode: boolean,
    preserveDimensions: IToolboxComponent['preserveDimensionsInDesigner'] = false,
  ): CSSProperties {
    if (!isDesignerMode) {
      return baseStyle;
    }

    // In designer mode, always strip margins (they go to wrapper only)
    const marginsStripped = {
      ...baseStyle,
      margin: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    };

    const preservedSet = normalizePreserveDimensions(preserveDimensions);

    // No dimensions preserved - fill wrapper completely
    if (preservedSet.size === 0) {
      return {
        ...marginsStripped,
        ...DESIGNER_DIMENSIONS,
      };
    }

    // All dimensions preserved - return margins stripped only
    if (preservedSet.size === ALL_DIMENSIONS_COUNT) {
      return marginsStripped;
    }

    // Partial preservation - merge preserved dimensions with 100% defaults
    return {
      ...marginsStripped,
      width: preservedSet.has('width') ? baseStyle?.width : DESIGNER_DIMENSIONS.width,
      height: preservedSet.has('height') ? baseStyle?.height : DESIGNER_DIMENSIONS.height,
      minWidth: preservedSet.has('minWidth') ? baseStyle?.minWidth : undefined,
      maxWidth: preservedSet.has('maxWidth') ? baseStyle?.maxWidth : undefined,
      minHeight: preservedSet.has('minHeight') ? baseStyle?.minHeight : undefined,
      maxHeight: preservedSet.has('maxHeight') ? baseStyle?.maxHeight : undefined,
    };
  },

  /**
   * Hook-compatible version of mergeWithDesignerDimensions.
   * Returns a function that can be used in components.
   */
  getDesignerDimensionsMerger(isDesignerMode: boolean) {
    return (baseStyle: CSSProperties, preserveDimensions: IToolboxComponent['preserveDimensionsInDesigner'] = false): CSSProperties => {
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
