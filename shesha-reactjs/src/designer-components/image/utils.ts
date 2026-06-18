import { IStyleType } from "@/providers/form/models";
import { IImageProps } from "./interfaces";

export const defaultStyles = (prev: IImageProps): IStyleType => {
  const { borderColor, borderRadius, borderType } = prev;
  const borderWidth = "borderWidth" in prev && typeof (prev.borderWidth) === "string" ? prev.borderWidth : undefined;
  return {
    border: {
      radiusType: 'all', borderType: 'all',
      border: {
        all: { width: borderWidth || '1px', style: borderType || 'none', color: borderColor },
      },
      radius: { all: borderRadius },
    },
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
