import { IShadowValue } from "./interfaces";

export const getShadowStyle = (input?: IShadowValue): React.CSSProperties => {
  if (!input) return {};

  const style: React.CSSProperties = {};
  const { offsetX, offsetY, blurRadius, color, spreadRadius } = input;

  const shadow = `${offsetX || 0}px ${offsetY || 0}px ${blurRadius || 0}px ${spreadRadius || 0}px ${color || '#00000004'}`;

  style.boxShadow = shadow;

  return style;
};

