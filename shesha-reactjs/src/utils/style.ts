export const addPx = (value) => {
  return !value ? null : /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
};

export const hasNumber = (str: string | number) => typeof str === 'number' ? true : /\d/.test(str);

export const getTagStyle = (style: React.CSSProperties = {}, hasColor: boolean = false) => {
  const { backgroundColor, backgroundImage, borderColor, borderTopColor,
    borderLeftColor, borderRightColor, borderBottomColor, color, ...rest } = style;
  return hasColor ? { ...rest, margin: 0 } : style;
};
