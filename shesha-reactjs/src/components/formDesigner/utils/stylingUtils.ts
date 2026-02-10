import { CSSProperties } from 'react';
import { addPx, hasNumber } from '@/utils/style';
import { DEFAULT_MARGINS, calculateDesignerHeight, calculateAdjustedDimension } from './designerConstants';

export interface StyleConfig {
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
}

interface DefaultMargins {
  vertical: string;
  horizontal: string;
}

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
      horizontal: isInput ? DEFAULT_MARGINS.horizontal : '0px',
    };
  },

  /**
   * Creates the root container style for wrapping components in designer mode.
   *
   * The wrapper pattern works by:
   * 1. Converting component margins to wrapper padding (prevents margin collapse)
   * 2. Expanding wrapper dimensions to accommodate the padding
   * 3. Setting component dimensions to 100% to fill the wrapper
   */
  createRootContainerStyle(
    dimensions: CSSProperties,
    margins: StyleConfig,
    isInput: boolean,
    isButton: boolean = false,
  ): CSSProperties {
    const defaultMargins = stylingUtils.getDefaultMargins(isInput);

    // Convert margins to padding on the wrapper
    // This prevents margin collapse issues in the designer
    const paddingTop = addPx(margins?.marginTop || defaultMargins.vertical);
    const paddingBottom = addPx(margins?.marginBottom || defaultMargins.vertical);
    const paddingLeft = addPx(margins?.marginLeft || defaultMargins.horizontal);
    const paddingRight = addPx(margins?.marginRight || defaultMargins.horizontal);

    // Calculate wrapper dimensions to accommodate padding
    // Width is reduced because padding adds to the total size
    // When width is 'auto' for button, use 'max-content' for WYSIWYG behavior (wrapper shrinks to fit content)
    const rawWidth = (isButton && dimensions.width === 'auto') ? 'max-content' : dimensions.width;
    const width = rawWidth && hasNumber(rawWidth)
      ? calculateAdjustedDimension(rawWidth, paddingLeft, paddingRight)
      : rawWidth;

    // Height is expanded to include padding plus border width (8px = 4px top + 4px bottom)
    const height = dimensions.height && hasNumber(dimensions.height)
      ? calculateDesignerHeight(dimensions.height, paddingTop, paddingBottom)
      : dimensions.height;

    const minHeight = dimensions.minHeight && hasNumber(dimensions.minHeight)
      ? `calc(${dimensions.minHeight} + ${paddingTop} + ${paddingBottom})`
      : dimensions.minHeight;

    const maxHeight = dimensions.maxHeight && hasNumber(dimensions.maxHeight)
      ? `calc(${dimensions.maxHeight} + ${paddingTop} + ${paddingBottom})`
      : dimensions.maxHeight;

    const minWidth = dimensions.minWidth && hasNumber(dimensions.minWidth)
      ? `calc(${dimensions.minWidth} + ${paddingLeft} + ${paddingRight})`
      : dimensions.minWidth;

    const maxWidth = dimensions.maxWidth && hasNumber(dimensions.maxWidth)
      ? `calc(${dimensions.maxWidth} + ${paddingLeft} + ${paddingRight})`
      : dimensions.maxWidth;

    return {
      boxSizing: 'border-box' as const,
      // Expanded dimensions to accommodate padding
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      flexBasis: dimensions.flexBasis,
      // Apply margins as padding
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
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
    if (!stylingBox) return JSON.stringify({});

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
      return JSON.stringify({});
    }
  },

  /**
   * Creates margin values object from stylingBox CSS values.
   *
   * @param stylingBoxAsCSS - The parsed stylingBox CSS properties
   * @param isInDesigner - Whether currently in designer mode (returns 0 for margins)
   * @param defaultMargins - Default margin values to use if not specified
   * @returns StyleConfig with margin values
   */
  createMarginsFromStylingBox(
    stylingBoxAsCSS: StyleConfig | undefined,
    isInDesigner: boolean,
    defaultMargins = { top: '5px', bottom: '5px', left: '3px', right: '3px' },
  ): StyleConfig {
    if (isInDesigner) {
      return {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      };
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
    if (!stylingBox) return JSON.stringify({});

    try {
      const parsed = JSON.parse(stylingBox);
      return JSON.stringify({
        paddingTop: parsed.paddingTop,
        paddingRight: parsed.paddingRight,
        paddingBottom: parsed.paddingBottom,
        paddingLeft: parsed.paddingLeft,
      });
    } catch {
      return stylingBox;
    }
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
} = stylingUtils;
