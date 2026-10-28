import { ICommonContainerProps } from "@/designer-components/container/interfaces";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (): Omit<ICommonContainerProps, 'style' | 'id' | 'label'> => {
  return {
    font: { weight: '400', size: 14, type: DEFAULT_FONT_TYPE },
  };
};
