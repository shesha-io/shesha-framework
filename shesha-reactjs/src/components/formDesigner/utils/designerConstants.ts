/**
 * @fileoverview Shared constants and style definitions for form designer components.
 *
 * This file centralizes all magic numbers, style objects, and component categorizations
 * used throughout the designer to ensure consistency and maintainability.
 *
 * @example
 * ```tsx
 * import { COMPONENTS_TO_SKIP, DESIGNER_DIMENSIONS, WRAPPER_FILL_STYLE } from './designerConstants';
 *
 * // Check if component should skip standard dimension processing
 * if (!COMPONENTS_TO_SKIP.includes(componentType)) {
 *   style = { ...style, ...DESIGNER_DIMENSIONS };
 * }
 * ```
 */

import { CSSProperties } from 'react';

/**
 * Components that have special rendering requirements and should skip
 * standard dimension processing in the designer.
 *
 * These components typically:
 * - Have their own internal sizing logic (checkbox, attachmentsEditor)
 * - Are container components that manage their own layout (datatableContext, container)
 *
 * @remarks
 * When a component is in this list, the designer will not apply the standard
 * wrapper pattern (100% width/height filling). Instead, the component's
 * original dimensions are preserved.
 */
export const COMPONENTS_TO_SKIP = ['attachmentsEditor', 'checkbox', 'datatableContext'] as const;

/**
 * Type representing component types that should skip standard dimension processing.
 */
export type SkipComponentType = typeof COMPONENTS_TO_SKIP[number];

/**
 * Default margin values for form items when not explicitly configured.
 *
 * These values match Ant Design's default form item spacing and ensure
 * consistent spacing across all form components.
 *
 * @property top - Top margin (5px)
 * @property bottom - Bottom margin (5px)
 * @property left - Left margin (3px)
 * @property right - Right margin (3px)
 */
export const DEFAULT_FORM_ITEM_MARGINS = {
  top: '5px',
  bottom: '5px',
  left: '3px',
  right: '3px',
} as const;

/**
 * Default vertical and horizontal margin values used in styling calculations.
 *
 * @property vertical - Combined top/bottom margin for input components
 * @property horizontal - Combined left/right margin for input components
 */
export const DEFAULT_MARGINS = {
  vertical: '5px',
  horizontal: '3px',
} as const;

/**
 * CSS dimensions for components to completely fill their wrapper container.
 * Used in designer mode where the wrapper controls the actual sizing.
 *
 * @remarks
 * Components receive these dimensions in designer mode so they fill their
 * wrapper element completely. The wrapper element owns the actual dimensions
 * configured by the user.
 */
export const DESIGNER_DIMENSIONS: CSSProperties = {
  width: '100%',
  height: '100%',
} as const;

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
export const WRAPPER_FILL_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
} as const;

/**
 * CSS style for the drag wrapper element in the designer.
 * Ensures the drag handle fills the available space.
 */
export const DRAG_WRAPPER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
} as const;

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
 * height: calculateDesignerHeight('100px', '5px', '5px');
 * // Returns: 'calc(100px + 5px + 5px + 8px)'
 * ```
 */
export const calculateDesignerHeight = (
  height: string | number | undefined,
  paddingTop: string,
  paddingBottom: string,
): string | number | undefined => {
  if (!height) return undefined;
  // Add 8px to account for border width in designer (4px top + 4px bottom)
  return `calc(${height} + ${paddingTop} + ${paddingBottom} + 8px)`;
};

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
 * width: calculateAdjustedDimension('100%', '3px', '3px');
 * // Returns: 'calc(100% - 3px - 3px)'
 * ```
 */
export const calculateAdjustedDimension = (
  value: string | number | undefined,
  padding1: string,
  padding2: string,
): string | number | undefined => {
  if (!value) return undefined;
  return `calc(${value} - ${padding1} - ${padding2})`;
};

/**
 * CSS padding property keys from stylingBox.
 * Used to extract only padding values from styleBox configuration.
 */
export const STYLING_BOX_PADDING_PROPERTIES = [
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const;

/**
 * CSS margin property keys from stylingBox.
 * Used to extract only margin values from styleBox configuration.
 */
export const STYLING_BOX_MARGIN_PROPERTIES = [
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
] as const;

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
 * const paddingOnly = extractPaddingFromStyleBox(styleBoxCss);
 * // Returns: { paddingTop: '5px' }
 * ```
 */
export const extractPaddingFromStyleBox = (styleBoxCss: CSSProperties | undefined): CSSProperties => {
  if (!styleBoxCss) return {};

  return {
    paddingTop: styleBoxCss.paddingTop,
    paddingRight: styleBoxCss.paddingRight,
    paddingBottom: styleBoxCss.paddingBottom,
    paddingLeft: styleBoxCss.paddingLeft,
  };
};

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
 * const marginsOnly = extractMarginsFromStyleBox(styleBoxCss);
 * // Returns: { marginTop: '10px', marginLeft: '8px' }
 * ```
 */
export const extractMarginsFromStyleBox = (
  styleBoxCss: CSSProperties | undefined,
): { marginTop?: number | string; marginRight?: number | string; marginBottom?: number | string; marginLeft?: number | string } => {
  if (!styleBoxCss) return {};

  return {
    marginTop: styleBoxCss.marginTop,
    marginRight: styleBoxCss.marginRight,
    marginBottom: styleBoxCss.marginBottom,
    marginLeft: styleBoxCss.marginLeft,
  };
};
