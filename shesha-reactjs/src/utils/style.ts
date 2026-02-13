import React from 'react';
import { isDefined } from "@/utils/nullables";

export interface DimensionValue {
  value: number;
  unit: 'px' | '%' | 'vw' | 'vh' | 'em' | 'rem' | 'auto' | 'none';
}

/**
 * Parse a dimension value into its numeric value and unit
 * @param value - The dimension value to parse (e.g., "50vw", "100%", 300, "auto")
 * @returns Parsed dimension object with value and unit, or null if invalid
 */
export const parseDimension = (value: string | number | null | undefined): DimensionValue | null => {
  if (!isDefined(value)) return null;

  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }

  if (value === 'auto' || value === 'none') {
    return { value: 0, unit: value as 'auto' | 'none' };
  }

  // Match number with optional unit
  const match = /^(-?\d+(?:\.\d+)?)(px|%|vw|vh|em|rem)?$/.exec(value.trim());
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: (match[2] || 'px') as DimensionValue['unit'],
    };
  }

  return null;
};

/**
 * Add 'px' unit to bare numbers, preserve existing units
 * @param value - The value to add units to
 * @returns String with appropriate units, or undefined
 */
export const addPx = (value: number | string | null | undefined): string | undefined => {
  const parsed = parseDimension(value);
  if (!parsed) return undefined;

  if (parsed.unit === 'auto' || parsed.unit === 'none') {
    return parsed.unit;
  }

  return `${parsed.value}${parsed.unit}`;
};

/**
 * Check if a dimension value can be used in calc() expressions with additions
 * @param dimensionValue - The dimension value to check
 * @returns true if the value can be used in calc() with additions
 */
export const canAddToCalc = (dimensionValue: string | number | undefined): boolean => {
  if (!dimensionValue) return false;

  const parsed = parseDimension(dimensionValue);
  if (!parsed) {
    // Allow calc(...) and var(...) tokens
    if (typeof dimensionValue === 'string') {
      const v = dimensionValue.trim();
      if (v.startsWith('calc(') || v.startsWith('var(')) return true;
    }
    return false;
  }

  // Auto and none cannot be used in calc with additions
  if (parsed.unit === 'auto' || parsed.unit === 'none') {
    return false;
  }

  return true;
};

/**
 * Returns style overrides for ghost buttons.
 * Ghost buttons display only foreground color (text/icon) with no background, border, or shadow.
 * These overrides ensure ghost buttons maintain their transparent appearance.
 *
 * @returns Style object with transparent background, no border, and no shadow
 * @example
 * const ghostStyles = getGhostStyleOverrides();
 * // Returns: { background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }
 */
export const getGhostStyleOverrides = (): React.CSSProperties => {
  return {
    background: 'transparent',
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
  };
};

export const hasNumber = (str: string | number): boolean => typeof str === 'number' ? true : /\d/.test(str);

export const getTagStyle = (style: React.CSSProperties = {}, hasColor: boolean = false): React.CSSProperties => {
  const { backgroundColor, backgroundImage, borderColor, borderTopColor,
    borderLeftColor, borderRightColor, borderBottomColor, color, ...rest } = style;
  return hasColor ? { ...rest, margin: 0 } : style;
};

/**
 * Caps percentage width values at a maximum percentage to prevent layout issues.
 * @param value - The width value to cap (can be a number, string, null, or undefined)
 * @param maxPercentage - The maximum percentage value (default: 98)
 * @returns The capped value or the original value if not a percentage string
 */
export const capPercentageWidth = (value: number | string | null | undefined, maxPercentage: number = 98): number | string | null | undefined => {
  if (!value) return value;

  // Check if it's a percentage string (e.g., "99%", "100%")
  if (typeof value === 'string' && value.endsWith('%')) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > maxPercentage) {
      return `${maxPercentage}%`;
    }
  }

  return value;
};
