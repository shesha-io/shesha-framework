import { CSSProperties } from 'react';
import { DEFAULT_MARGINS } from './designerConstants';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { addPx, DIMENSION_VALUES } from '@/utils/style';
import { getCalculatedDimension } from '@/designer-components/_settings/utils/dimensions/utils';
import { IStyleValue, IWrapperStyle, StyleBoxValue } from '@/interfaces';
import { IDimensionsValue } from '@/designer-components/_settings/utils';

export const DEFAULT_DESIGNER_PADDING: IStyleValue = { stylingBoxJson: { _type: 'styleBox', paddingLeft: 5, paddingRight: 3, paddingTop: 5, paddingBottom: 3 } };

/** Check if the value is not an exact dimension value (contains calc or % or auto/stretch/fit-content etc) */
export const isExactDimensionValue = (value: string | number | undefined): boolean =>
  isDefined(value) && !(typeof value === 'string' && (value.includes('calc') || value.includes('px') || value.includes('%') || DIMENSION_VALUES.includes(value)));

/** Check if the value is a percentage */
export const isPercentDimensionValue = (value: string | number | undefined): boolean =>
  typeof value === 'string' && value.includes('%');

const getFullSizeComponentDimensionsValue = (value: string | number | undefined): string | number | undefined =>
  isPercentDimensionValue(value)
    ? 'stretch'// use `stretch` because wrapper will use configured percentage
    : value;

/**
 * Gets full size component dimensions
 *
 * Calculates three states:
 * 1. If the dimensions are percentage, return `100%` because wrapper will use configured percentage
 * 2. If the dimensions are exact, return them as they are
 * 3. If the dimensions are calc, auto/stretch/fit-content etc, return them as they are
 *
 * @param dimensions dimensions of the component
 * @returns dimensions of the wrapper for component
 */
export const getFullSizeComponentDimensions = (dimensions: IDimensionsValue | undefined): IDimensionsValue => ({
  height: getFullSizeComponentDimensionsValue(dimensions?.height),
  minHeight: getFullSizeComponentDimensionsValue(dimensions?.minHeight),
  maxHeight: getFullSizeComponentDimensionsValue(dimensions?.maxHeight),
  width: getFullSizeComponentDimensionsValue(dimensions?.width),
  minWidth: getFullSizeComponentDimensionsValue(dimensions?.minWidth),
  maxWidth: getFullSizeComponentDimensionsValue(dimensions?.maxWidth),
});

const getFullSizeWrapperDimensionsValue = (value: string | number | undefined): string | number | undefined =>
  isPercentDimensionValue(value) || !isExactDimensionValue(value)
    ? value // use dimesions for wrapper, component will use 100% or non-exact value (auto/stretch/fit-content etc)
    : 'fit-content'; // fit to the content because the component will configured exactly

/**
 * Gets full size component wrapper dimensions
 *
 * Calculates three states:
 * 1. If the dimensions are percentage, return them as they are
 * 2. If the dimensions are exact, return `fit-content` because the component will configured exactly
 * 3. If the dimensions are calc, auto/stretch/fit-content etc, return them as they are
 *
 * @param dimensions dimensions of the component
 * @returns dimensions of the wrapper for component
 */
export const getFullSizeWrapperDimensions = (dimensions: IDimensionsValue | undefined): IDimensionsValue => ({
  height: getFullSizeWrapperDimensionsValue(dimensions?.height),
  minHeight: getFullSizeWrapperDimensionsValue(dimensions?.minHeight),
  maxHeight: getFullSizeWrapperDimensionsValue(dimensions?.maxHeight),
  width: getFullSizeWrapperDimensionsValue(dimensions?.width),
  minWidth: getFullSizeWrapperDimensionsValue(dimensions?.minWidth),
  maxWidth: getFullSizeWrapperDimensionsValue(dimensions?.maxWidth),
});

export const getFullSizeWrapperStyle = (model: IStyleValue): IStyleValue => ({
  dimensions: getFullSizeWrapperDimensions(model.dimensions),
  // stylingBoxJson: getMarginStyle(model.stylingBoxJson),
});

/** Calculates the padding value for the designer, taking into account the margin of the component.
 * if the component's margin value is greater than the padding value for the designer, then padding is not applied.
 * This allows to keep the margins the same as in the "live" forms.
 * If the component's margin is less than the designer's padding,
 * then the padding - margin difference is applied so that the component always has a minimum padding in designer mode. */
export const getDesignerPadding = (value: string | number | undefined, designerValue: string | number | undefined): string | number | undefined => {
  const stringValue = isDefined(value) ? String(value) : undefined;
  const designerStringValue = isDefined(designerValue) ? String(designerValue) : undefined;
  if (isNullOrWhiteSpace(stringValue) || isNullOrWhiteSpace(designerStringValue)) return designerValue;
  const margin = parseFloat(stringValue);
  const designerPadding = parseFloat(designerStringValue);

  return margin > designerPadding ? undefined : designerPadding - margin;
};

export const getFullSizeWrapperDesignerStyle = (model: IStyleValue): IWrapperStyle => ({
  style: getFullSizeWrapperStyle(model),
  designerStyle: {
    ...DEFAULT_DESIGNER_PADDING,
    // use default designer margin if component margin is not set or component margin is less than designer margin
    stylingBoxJson: {
      _type: 'styleBox',
      paddingBottom: getDesignerPadding(model.stylingBoxJson?.marginBottom, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingBottom),
      paddingLeft: getDesignerPadding(model.stylingBoxJson?.marginLeft, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingLeft),
      paddingRight: getDesignerPadding(model.stylingBoxJson?.marginRight, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingRight),
      paddingTop: getDesignerPadding(model.stylingBoxJson?.marginTop, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingTop),
    },
  },
});

export const getMarginStyle = (model: StyleBoxValue | undefined): StyleBoxValue => ({
  _type: 'styleBox',
  marginBottom: model?.marginBottom,
  marginLeft: model?.marginLeft,
  marginRight: model?.marginRight,
  marginTop: model?.marginTop,
});

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

type PaddingValues = {
  paddingTop?: string | number | undefined;
  paddingBottom?: string | number | undefined;
  paddingLeft?: string | number | undefined;
  paddingRight?: string | number | undefined;
};

// Cached constants to avoid repeated object/string creation
const EMPTY_STYLING_BOX = '{}';
const ZERO_MARGINS: Readonly<MarginValues> = Object.freeze({
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
});

const DEFAULT_MARGIN_VALUES = {
  top: DEFAULT_MARGINS.vertical,
  bottom: DEFAULT_MARGINS.vertical,
  left: DEFAULT_MARGINS.horizontal,
  right: DEFAULT_MARGINS.horizontal,
};

export const DEFAULT_ROOT_CONTAINER_STYLE: CSSProperties = { boxSizing: 'border-box' };

// ToDo: AS - remove all unused commented code afer review and migration to the new styles

/* const getExpandedDimensions = (value: string | number, marginTop: string | number, marginBottom: string | number): string | undefined => {
  if (!isDefined(value) || value === '') {
    // When no explicit dimension is provided, don't set a CSS value at all.
    // This avoids producing invalid CSS like `calc(undefined + ...)`.
    return undefined;
  }

  return `calc(${addPx(value)} + (${addPx(marginTop)} + ${addPx(marginBottom)}))`;
};*/

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
   *
   * @param dimensions - The component dimensions
   * @param margins - The margin values to apply
   * @returns CSSProperties for the root container
   */
  createRootContainerStyle(
    dimensions: CSSProperties,
    margins: MarginValues,
  ): CSSProperties {
    const marginTop = addPx(margins.marginTop);
    const marginBottom = addPx(margins.marginBottom);
    const marginLeft = addPx(margins.marginLeft);
    const marginRight = addPx(margins.marginRight);

    // Subtract actual margins from dimensions so 100%-width containers don't overflow.
    // getCalculatedDimension produces calc(value - left - right) for percentage/pixel values.
    const width = dimensions.width === 'auto'
      ? 'auto'
      : dimensions.width
        ? getCalculatedDimension(dimensions.width, margins.marginLeft, margins.marginRight)
        : undefined;

    const height = dimensions.height === 'auto'
      ? 'auto'
      : dimensions.height
        ? getCalculatedDimension(dimensions.height, margins.marginTop, margins.marginBottom)
        : undefined;

    const minWidth = !dimensions.minWidth || dimensions.minWidth === 'auto'
      ? dimensions.minWidth
      : getCalculatedDimension(dimensions.minWidth, margins.marginLeft, margins.marginRight);

    const maxWidth = !dimensions.maxWidth || dimensions.maxWidth === 'auto'
      ? dimensions.maxWidth
      : getCalculatedDimension(dimensions.maxWidth, margins.marginLeft, margins.marginRight);

    const minHeight = !dimensions.minHeight || dimensions.minHeight === 'auto'
      ? dimensions.minHeight
      : getCalculatedDimension(dimensions.minHeight, margins.marginTop, margins.marginBottom);

    const maxHeight = !dimensions.maxHeight || dimensions.maxHeight === 'auto'
      ? dimensions.maxHeight
      : getCalculatedDimension(dimensions.maxHeight, margins.marginTop, margins.marginBottom);

    return {
      boxSizing: 'border-box' as const,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
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
    if (isNullOrWhiteSpace(stylingBox)) return EMPTY_STYLING_BOX;

    try {
      const parsed = JSON.parse(stylingBox) as CSSProperties;
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
      // Return a fresh copy to prevent accidental mutation
      return { ...ZERO_MARGINS };
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
    if (isNullOrWhiteSpace(stylingBox)) return EMPTY_STYLING_BOX;

    try {
      const parsed = JSON.parse(stylingBox) as PaddingValues;
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


// Re-export individual functions for backward compatibility and tree-shaking
export const {
  getDefaultMargins,
  createRootContainerStyle,
  removeMarginsFromStylingBox,
  createMarginsFromStylingBox,
  createPaddingOnlyStylingBox,
  stripMargins,
  extractMargins,
} = stylingUtils;
