/**
 * @fileoverview Shared constants and style definitions for form designer components.
 *
 * This file centralizes all magic numbers, style objects, and component categorizations
 * used throughout the designer to ensure consistency and maintainability.
 *
 * @example
 * ```tsx
 * import { designerConstants } from './designerConstants';
 *
 * // Use constants
 * const dims = designerConstants.DESIGNER_DIMENSIONS;
 * const margins = designerConstants.DEFAULT_FORM_ITEM_MARGINS;
 *
 * // Use utility functions
 * const height = designerConstants.calculateDesignerHeight('100px', '5px', '5px');
 * ```
 */

import { CSSProperties } from 'react';

/**
 * Designer constants namespace.
 *
 * Contains all constants and utility functions for the form designer,
 * organized in a single namespace for easy access and discoverability.
 */
export const designerConstants = {
  /**
   * Default margin values for form items when not explicitly configured.
   *
   * These values match Ant Design's default form item spacing and ensure
   * consistent spacing across all form components.
   */
  DEFAULT_FORM_ITEM_MARGINS: {
    top: '5px',
    bottom: '5px',
    left: '3px',
    right: '3px',
  } as const,

  /**
   * Default vertical and horizontal margin values used in styling calculations.
   *
   * @property vertical - Combined top/bottom margin for input components
   * @property horizontal - Combined left/right margin for input components
   */
  DEFAULT_MARGINS: {
    vertical: '5px',
    horizontal: '3px',
  } as const,

  /**
   * CSS dimensions for components to completely fill their wrapper container.
   * Used in designer mode where the wrapper controls the actual sizing.
   *
   * @remarks
   * Components receive these dimensions in designer mode so they fill their
   * wrapper element completely. The wrapper element owns the actual dimensions
   * configured by the user.
   */
  DESIGNER_DIMENSIONS: {
    width: '100%',
    height: '100%',
  } as CSSProperties,

  /**
   * CSS style for inner containers to completely fill their wrapper.
   *
   * Applied to container elements between the wrapper and the actual component
   * to ensure proper sizing propagation through the DOM hierarchy.
   *
   * @remarks
   * Uses `boxSizing: 'border-box'` to ensure padding and borders are included
   * in the element's total dimensions.
   */
  WRAPPER_FILL_STYLE: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  } as CSSProperties,

  /**
   * CSS padding property keys from stylingBox.
   * Used to extract only padding values from styleBox configuration.
   */
  STYLING_BOX_PADDING_PROPERTIES: [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ] as const,

  /**
   * CSS margin property keys from stylingBox.
   * Used to extract only margin values from styleBox configuration.
   */
  STYLING_BOX_MARGIN_PROPERTIES: [
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
  ] as const,

  /**
   * Calculates the adjusted height for designer mode wrapper elements.
   * Adds extra pixels to account for border width in the designer UI.
   *
   * @param height - The base height value
   * @param paddingTop - Top padding being applied to wrapper
   * @param paddingBottom - Bottom padding being applied to wrapper
   * @returns Calculation string for CSS height property
   *
   * @example
   * ```tsx
   * height: designerConstants.calculateDesignerHeight('100px', '5px', '5px');
   * // Returns: 'calc(100px + 5px + 5px + 8px)'
   * ```
   */
  calculateDesignerHeight(
    height: string | number | undefined,
    paddingTop: string,
    paddingBottom: string,
  ): string | number | undefined {
    if (!height) return undefined;
    // Add 8px to account for border width in designer (4px top + 4px bottom)
    return `calc(${height} + ${paddingTop} + ${paddingBottom} + 8px)`;
  },

  /**
   * Calculates adjusted dimension value with padding compensation.
   * Used when converting margin values to padding on wrapper elements.
   *
   * @param value - The base dimension value (width or height)
   * @param padding1 - First padding value (left for width, top for height)
   * @param padding2 - Second padding value (right for width, bottom for height)
   * @returns Calculation string for CSS dimension property
   *
   * @example
   * ```tsx
   * width: designerConstants.calculateAdjustedDimension('100%', '3px', '3px');
   * // Returns: 'calc(100% - 3px - 3px)'
   * ```
   */
  calculateAdjustedDimension(
    value: string | number | undefined,
    padding1: string,
    padding2: string,
  ): string | number | undefined {
    if (!value) return undefined;
    return `calc(${value} + ${padding1} + ${padding2})`;
  },

  /**
   * Extracts only padding-related styles from a styleBox CSS object.
   *
   * In designer mode, the component should only receive padding from styleBox,
   * while margins are handled by the wrapper as padding.
   *
   * @param styleBoxCss - The styleBox CSS properties (may include margins and padding)
   * @returns CSSProperties with only padding values
   *
   * @example
   * ```tsx
   * const styleBoxCss = { marginTop: '10px', paddingTop: '5px', marginLeft: '8px' };
   * const paddingOnly = designerConstants.extractPaddingFromStyleBox(styleBoxCss);
   * // Returns: { paddingTop: '5px' }
   * ```
   */
  extractPaddingFromStyleBox(styleBoxCss: CSSProperties | undefined): CSSProperties {
    if (!styleBoxCss) return {};

    return {
      paddingTop: styleBoxCss.paddingTop,
      paddingRight: styleBoxCss.paddingRight,
      paddingBottom: styleBoxCss.paddingBottom,
      paddingLeft: styleBoxCss.paddingLeft,
    };
  },

  /**
   * Extracts only margin-related styles from a styleBox CSS object.
   *
   * Used by the wrapper to apply margins as padding in designer mode.
   *
   * @param styleBoxCss - The styleBox CSS properties (may include margins and padding)
   * @returns Object with margin values
   *
   * @example
   * ```tsx
   * const styleBoxCss = { marginTop: '10px', paddingTop: '5px', marginLeft: '8px' };
   * const marginsOnly = designerConstants.extractMarginsFromStyleBox(styleBoxCss);
   * // Returns: { marginTop: '10px', marginLeft: '8px' }
   * ```
   */
  extractMarginsFromStyleBox(
    styleBoxCss: CSSProperties | undefined,
  ): { marginTop?: number | string; marginRight?: number | string; marginBottom?: number | string; marginLeft?: number | string } {
    if (!styleBoxCss) return {};

    return {
      marginTop: styleBoxCss.marginTop,
      marginRight: styleBoxCss.marginRight,
      marginBottom: styleBoxCss.marginBottom,
      marginLeft: styleBoxCss.marginLeft,
    };
  },
};

// Re-export individual items for backward compatibility and tree-shaking
export const {
  DEFAULT_FORM_ITEM_MARGINS,
  DEFAULT_MARGINS,
  DESIGNER_DIMENSIONS,
  WRAPPER_FILL_STYLE,
  STYLING_BOX_PADDING_PROPERTIES,
  STYLING_BOX_MARGIN_PROPERTIES,
  calculateDesignerHeight,
  calculateAdjustedDimension,
  extractPaddingFromStyleBox,
  extractMarginsFromStyleBox,
} = designerConstants;
