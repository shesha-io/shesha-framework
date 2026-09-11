import { ICommonContainerProps } from "@/designer-components/container/interfaces";

export const defaultStyles = (): Omit<ICommonContainerProps, 'style' | 'id' | 'label'> => {
  return {
    font: { weight: '400', size: 14, type: 'Segoe UI' },
  };
};
