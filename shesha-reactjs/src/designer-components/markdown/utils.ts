import { IStyleValue } from "@/providers/form/models";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: DEFAULT_FONT_TYPE },
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
