import { ICommonContainerProps } from "../container/interfaces";

export const defaultStyles = (): Omit<ICommonContainerProps, 'style' | 'id' | 'label'> => {
  return {
    font: { weight: '500', size: 14, color: '#000', type: 'Segoe UI' },
    dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
