import { IBorderType, IStyleType } from "@/index";
import { IImageProps } from ".";

export const defaultStyles = (prev: IImageProps): IStyleType => {
  const { borderColor, borderRadius, borderType } = prev;
  const borderWidth = "borderWidth" in prev && typeof (prev.borderWidth) === "string" ? prev.borderWidth : undefined;
  return {
    border: {
      radiusType: 'all', borderType: 'all',
      border: {
        all: { width: borderWidth || '1px', style: (borderType as IBorderType) || 'none', color: borderColor },
      },
      radius: { all: borderRadius },
    },
  };
};
