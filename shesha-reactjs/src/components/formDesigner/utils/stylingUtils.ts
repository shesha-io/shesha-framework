import { CSSProperties } from 'react';
import { addPx } from '@/utils/style';
import { DEFAULT_MARGINS } from './designerConstants';
import { getCalculatedDimension } from '@/designer-components/_settings/utils/index';

/** Margin values extracted from various style sources */
export interface MarginValues {
  marginTop: number | string;
  marginBottom: number | string;
  marginLeft: number | string;
  marginRight: number | string;
}

interface DefaultMargins {
  vertical: string;
  horizontal: string;
}

// Cached constants to avoid repeated object/string creation
const EMPTY_STYLING_BOX = '{}';
const ZERO_MARGINS: MarginValues = {
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
};
const DEFAULT_MARGIN_VALUES = {
  top: DEFAULT_MARGINS.vertical,
  bottom: DEFAULT_MARGINS.vertical,
  left: DEFAULT_MARGINS.horizontal,
  right: DEFAULT_MARGINS.horizontal,
};

const getExpandedDimensions = (value?: string | number): string | undefined => {
  if (value === undefined || value === null || value === '') {
    // When no explicit dimension is provided, don't set a CSS value at all.
    // This avoids producing invalid CSS like `calc(undefined + ...)`.
    return undefined;
  }

  return `calc(${value} + (${DEFAULT_MARGIN_VALUES.top} + ${DEFAULT_MARGIN_VALUES.top}))`;
};
/* eslint-disable @stylistic/no-trailing-spaces */
/**
 * Styling utility functions for form designer components.
 *
 * This namespace provides functions for managing component styling in the designer,
 * including handling the wrapper pattern where margins are converted to padding
 * on wrapper elements to prevent margin collapse.
 *
 * @example
 * ```tsx
 * import { stylingUtils } from '@/components/formDesigner/utils/stylingUtils';
 *
 * const wrapperStyle = stylingUtils.createRootContainerStyle(dimensions, margins, isInput);
 * const paddingOnly = stylingUtils.createPaddingOnlyStylingBox(stylingBox);
 * ```
 */
export const stylingUtils = {
  /**
   * Gets default margins based on component type.
   * Input components have default margins, others don't.
   */
  getDefaultMargins(isInput: boolean): DefaultMargins {
    return {
      vertical: isInput ? DEFAULT_MARGINS.vertical : '0px',
      horizontal: '0px',
    };
  },
  

  /**
   * Creates the root container style for wrapping components in designer mode.
   *
   * The wrapper applies margins directly and the inner component fills the available space.
   * When width is 100% with margins, the wrapper handles it without overflowing.
   */
  createRootContainerStyle(
    dimensions: CSSProperties,
    margins: MarginValues,
    validationHeight?: number,
  ): CSSProperties {
    // Use margin values directly (preserves relative values like 50%)
    const marginTop = addPx(margins?.marginTop ?? 0);
    const marginBottom = addPx(margins?.marginBottom ?? 0);
    const marginLeft = addPx(margins?.marginLeft ?? 0);
    const marginRight = addPx(margins?.marginRight ?? 0);

    // When width is 100% and there are margins, use getCalculatedDimension to prevent overflow
    const width = getCalculatedDimension(dimensions.width, margins?.marginLeft, margins?.marginRight);

    // Height is expanded to include padding to allow gap for component selecting e.g in button
    const expandedHeight = getExpandedDimensions(dimensions.height);
    const height = expandedHeight 
      ? `calc(${expandedHeight} + ${addPx(validationHeight ?? 0)})`
      : validationHeight ? addPx(validationHeight) : undefined;

    const minHeight = getExpandedDimensions(dimensions.minHeight);

    const maxHeight = getExpandedDimensions(dimensions.maxHeight);

    const minWidth = dimensions.minWidth;

    const maxWidth = dimensions.maxWidth; 

    return {
      boxSizing: 'border-box' as const,
      // Dimensions from component configuration
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      flexBasis: dimensions.flexBasis,
      // Apply margins directly (not as padding) to preserve relative values
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
    };
  },

  /**
   * Creates a stylingBox configuration with margins removed (set to 0).
   *
   * Used in designer mode to prevent double-application of margins
   * since the wrapper already handles margins as padding. The inner
   * component should have no margins since they're applied to the wrapper.
   */
  removeMarginsFromStylingBox(stylingBox: string | undefined): string {
    if (!stylingBox) return EMPTY_STYLING_BOX;

    try {
      const parsed = JSON.parse(stylingBox);
      return JSON.stringify({
        ...parsed,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      });
    } catch {
      return EMPTY_STYLING_BOX;
    }
  },

  /**
   * Creates margin values object from stylingBox CSS values.
   *
   * @param stylingBoxAsCSS - The parsed stylingBox CSS properties
   * @param isInDesigner - Whether currently in designer mode (returns 0 for margins)
   * @param defaultMargins - Default margin values to use if not specified
   * @returns Margin values
   */
  createMarginsFromStylingBox(
    stylingBoxAsCSS: MarginValues | undefined,
    isInDesigner: boolean,
    defaultMargins = DEFAULT_MARGIN_VALUES,
  ): MarginValues {
    if (isInDesigner) {
      return ZERO_MARGINS;
    }

    return {
      marginTop: stylingBoxAsCSS?.marginTop ?? defaultMargins.top,
      marginBottom: stylingBoxAsCSS?.marginBottom ?? defaultMargins.bottom,
      marginLeft: stylingBoxAsCSS?.marginLeft ?? defaultMargins.left,
      marginRight: stylingBoxAsCSS?.marginRight ?? defaultMargins.right,
    };
  },

  /**
   * Creates a stylingBox string with only padding properties (no margins).
   *
   * Used in designer mode to create a stylingBox configuration that only
   * applies padding to the component, while margins are handled by the wrapper.
   */
  createPaddingOnlyStylingBox(stylingBox: string | undefined): string {
    if (!stylingBox) return EMPTY_STYLING_BOX;

    try {
      const parsed = JSON.parse(stylingBox);
      return JSON.stringify({
        paddingTop: parsed.paddingTop,
        paddingRight: parsed.paddingRight,
        paddingBottom: parsed.paddingBottom,
        paddingLeft: parsed.paddingLeft,
      });
    } catch {
      return EMPTY_STYLING_BOX;
    }
  },

  /**
   * Extracts margin values from jsStyle and stylingBox CSS properties.
   * jsStyle margins take precedence over stylingBox margins.
   * Falls back to 0 if no margins are specified.
   */
  extractMargins(
    jsStyle: CSSProperties | undefined,
    stylingBoxAsCSS: CSSProperties | undefined,
  ): MarginValues {
    return {
      marginTop: jsStyle?.marginTop ?? jsStyle?.margin ?? stylingBoxAsCSS?.marginTop ?? 0,
      marginBottom: jsStyle?.marginBottom ?? jsStyle?.margin ?? stylingBoxAsCSS?.marginBottom ?? 0,
      marginLeft: jsStyle?.marginLeft ?? jsStyle?.margin ?? stylingBoxAsCSS?.marginLeft ?? 0,
      marginRight: jsStyle?.marginRight ?? jsStyle?.margin ?? stylingBoxAsCSS?.marginRight ?? 0,
    };
  },

  /**
   * Strips margin properties from a style object.
   * Returns a new object without marginTop, marginBottom, marginLeft, marginRight, and margin.
   */
  stripMargins<T extends CSSProperties>(style: T | undefined): Omit<T, 'margin' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'> {
    if (!style) return {} as Omit<T, 'margin' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'>;
    
    const { margin, marginTop, marginBottom, marginLeft, marginRight, ...rest } = style;
    return rest as Omit<T, 'margin' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'>;
  },
};
/* eslint-enable @stylistic/no-trailing-spaces */

// Re-export individual functions for backward compatibility and tree-shaking
export const {
  getDefaultMargins,
  createRootContainerStyle,
  removeMarginsFromStylingBox,
  createMarginsFromStylingBox,
  createPaddingOnlyStylingBox,
  extractMargins,
  stripMargins,
} = stylingUtils;
