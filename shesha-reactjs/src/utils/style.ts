import { isDefined } from "@/utils/nullables";

export const addPx = (value: number | string | null | undefined): string | undefined => {
  return !isDefined(value)
    ? undefined
    : typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))
      ? `${value}px`
      : value;
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
