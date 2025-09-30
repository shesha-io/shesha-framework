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
