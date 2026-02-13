import { CSSProperties } from 'react';
import { addPx } from '@/utils/style';
import { DEFAULT_MARGINS } from './designerConstants';

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
    margins: StyleConfig,
    _isInput: boolean,
    isButton: boolean = false,
  ): CSSProperties {
    // Use margin values directly (preserves relative values like 50%)
    const marginTop = addPx(margins?.marginTop ?? 0);
    const marginBottom = addPx(margins?.marginBottom ?? 0);
    const marginLeft = addPx(margins?.marginLeft ?? 0);
    const marginRight = addPx(margins?.marginRight ?? 0);

    // Calculate wrapper dimensions to accommodate padding
    // Width is reduced because padding adds to the total size
    // When width is 'auto' for button, use 'max-content' for WYSIWYG behavior (wrapper shrinks to fit content)
    const rawWidth = (isButton && dimensions.width === 'auto') ? 'max-content' : dimensions.width;
    const width = rawWidth;

    // Height is expanded to include padding plus border width (8px = 4px top + 4px bottom)
    const height = dimensions.height;

    const minHeight = dimensions.minHeight;

    const maxHeight = dimensions.maxHeight;

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

/** @deprecated Use MarginValues instead */
export type StyleConfig = MarginValues & { paddingTop?: number | string; paddingBottom?: number | string; paddingLeft?: number | string; paddingRight?: number | string };
