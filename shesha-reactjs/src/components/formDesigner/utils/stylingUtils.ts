import React, { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { addPx, canAddToCalc, parseDimension } from '@/utils/style';

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

/**
 * Helper to safely create calc expressions for dimensions with margins
 * @param dimension - The base dimension value (e.g., "50vw", "100%", 300)
 * @param additions - Array of margin values to add (e.g., ["5px", "3px"])
 * @returns Formatted dimension string with calc() if needed, or original value
 */
const createCalcDimension = (
  dimension: string | number | undefined,
  ...additions: (string | undefined)[]
): string | number | undefined => {
  if (!canAddToCalc(dimension)) {
    return dimension; // Return as-is for 'auto', undefined, etc.
  }

  // Filter out zero margins
  const nonZeroAdditions = additions.filter((add) => {
    if (!add) return false;
    const parsed = parseDimension(add);
    return parsed && parsed.value !== 0;
  });

  // If no margins to add, return original dimension with proper unit
  if (nonZeroAdditions.length === 0) {
    return addPx(dimension);
  }

  // Create calc expression
  const dimensionStr = addPx(dimension);
  const additionsStr = nonZeroAdditions.join(' + ');
  return `calc(${dimensionStr} + ${additionsStr})`;
};

export const createRootContainerStyle = (
  dimensions: CSSProperties,
  stylingBox: StyleConfig,
  originalDimensions: CSSProperties,
  isInput: boolean,
): CSSProperties => {
  const baseStyle = {
    boxSizing: 'border-box' as const,
  };

  const margins = {
    marginTop: addPx(stylingBox?.marginTop || 0),
    marginBottom: addPx(stylingBox?.marginBottom || 0),
    marginLeft: addPx(stylingBox?.marginLeft || 0),
    marginRight: addPx(stylingBox?.marginRight || 0),
  };

  const {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = margins;

  return {
    ...baseStyle,
    ...originalDimensions,
    width: createCalcDimension(dimensions.width, marginLeft, marginRight),
    maxWidth: createCalcDimension(dimensions.maxWidth, marginLeft, marginRight),
    minWidth: createCalcDimension(dimensions.minWidth, marginLeft, marginRight),
    height: isInput
      ? 'max-content'
      : createCalcDimension(dimensions.height, marginTop, marginBottom),
    minHeight: isInput
      ? originalDimensions.minHeight
      : createCalcDimension(dimensions.minHeight, marginTop, marginBottom),
    maxHeight: isInput
      ? originalDimensions.maxHeight
      : createCalcDimension(dimensions.maxHeight, marginTop, marginBottom),
    flexBasis: dimensions.flexBasis,
  };
};

export const createFormItemStyle = (
  stylingBox: StyleConfig,
  formMode: string,
  dimensionsStyles: React.CSSProperties,
  typeInfo: ComponentTypeInfo,
): CSSProperties => {
  const { isDataTableContext, isInput } = typeInfo;
  const {
    marginLeft,
    marginRight,
    marginBottom,
    marginTop,
  } = stylingBox;

  return {
    ...(formMode !== 'designer' && {
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
    }),
    ...dimensionsStyles,
    flexBasis: 'auto',
    width: isDataTableContext
      ? '100%'
      : dimensionsStyles?.width || 'auto',
    height: isDataTableContext
      ? '100%'
      : isInput
        ? ''
        : dimensionsStyles?.height,
  };
};
