import { IStyleValue } from "@/providers/form/models";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (): IStyleValue => {
  return {
    font: {
      color: '#000',
      type: DEFAULT_FONT_TYPE,
      align: 'left',
      weight: '400',
      size: 14,
    },
    dimensions: {
      width: 'auto',
      height: 30,
    },
  };
};
