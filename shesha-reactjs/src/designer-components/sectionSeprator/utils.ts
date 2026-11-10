import { ICommonContainerProps } from "../container/interfaces";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (): Omit<ICommonContainerProps, 'style' | 'id' | 'label'> => {
  return {
    font: { weight: '500', size: 14, color: '#000', type: DEFAULT_FONT_TYPE },
    dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'none', minWidth: '0px', maxWidth: 'none' },
  };
};
