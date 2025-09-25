import { IStyleType } from "@/index";

export const defaultStyles = (prev): IStyleType => {
  const { borderWidth, borderColor, borderRadius, borderType } = prev;
  return {
    border: {
      radiusType: 'all', borderType: 'all',
      border: {
        all: { width: borderWidth || '1px', style: borderType || 'none', color: borderColor },
      },
      radius: { all: borderRadius },
    },
  };
};
