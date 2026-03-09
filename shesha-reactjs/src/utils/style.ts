import React from 'react';
import { isDefined } from "@/utils/nullables";
import { executeScriptSync } from '@/providers/form/utils';
import { IPropertySetting } from '..';

export interface DimensionValue {
  value: number;
  unit: 'px' | '%' | 'vw' | 'vh' | 'em' | 'rem' | 'auto' | 'none';
}

/**
 * Type guard to check if a value is a valid dimension input type
 * @param value - The value to check
 * @returns true if the value is string, number, null, or undefined
 */
const isValidDimensionResult = (value: unknown): value is string | number | null | undefined => {
  const valueType = typeof value;
  return valueType === 'string' || valueType === 'number' || value === null || value === undefined;
};

/**
 * Parse a dimension value into its numeric value and unit
 * @param value - The dimension value to parse (e.g., "50vw", "100%", 300, "auto", or JS code object)
 * @param context - Optional context object containing available constants (from useAvailableConstantsData)
 * @returns Parsed dimension object with value and unit, or null if invalid
 */
export const parseDimension = (value: string | number | null | undefined | IPropertySetting, context?: object): DimensionValue | null => {
  if (!isDefined(value)) return null;

  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }

  // Handle JavaScript code execution for dynamic values
  if (typeof value === 'object' && value?._mode === 'code' && value?._code) {
    try {
      const executedValue = executeScriptSync(value._code, context ?? {});

      // Validate that the executed result is a valid dimension type
      if (!isValidDimensionResult(executedValue)) {
        console.error(
          `Invalid dimension value returned from script execution. Expected string, number, null, or undefined but got ${typeof executedValue}:`,
          executedValue,
        );
        return null;
      }

      // Recursively parse the validated result
      return parseDimension(executedValue, context);
    } catch (error) {
      console.error('Error executing dimension code:', error);
      return null;
    }
  }
  // Handle IPropertySetting with _mode === 'value' - extract the underlying value
  if (typeof value === 'object' && value?._mode === 'value' && isDefined(value?._value)) {
    // Validate that _value is a valid dimension type before recursing
    if (!isValidDimensionResult(value._value)) {
      console.error(
        `Invalid dimension value in IPropertySetting._value. Expected string, number, null, or undefined but got ${typeof value._value}:`,
        value._value,
      );
      return null;
    }
    return parseDimension(value._value, context);
  }

  if (typeof value !== 'string') return null;

  if (value === 'auto' || value === 'none') {
    return { value: 0, unit: value };
  }

  // Match number with optional unit
  const match = /^(-?\d+(?:\.\d+)?)(px|%|vw|vh|em|rem)?$/.exec(value.trim());
  if (match && match[1] !== undefined) {
    const unit = match[2] || 'px';

    // Type guard: validate unit is one of the allowed values
    if (unit === 'px' || unit === '%' || unit === 'vw' || unit === 'vh' || unit === 'em' || unit === 'rem') {
      return {
        value: parseFloat(match[1]),
        unit,
      };
    }
  }

  return null;
};

/**
 * Add 'px' unit to bare numbers, preserve existing units
 * @param value - The value to add units to
 * @param context - Optional context object containing available constants (from useAvailableConstantsData)
 * @returns String with appropriate units, or undefined
 */
export const addPx = (value: number | string | null | undefined, context?: object): string | undefined => {
  const parsed = parseDimension(value, context);
  if (!parsed) return undefined;

  if (parsed.unit === 'auto' || parsed.unit === 'none') {
    return parsed.unit;
  }

  return `${parsed.value}${parsed.unit}`;
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
