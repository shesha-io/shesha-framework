import { IStyleType } from "@/providers/form/models";

export const defaultStyles = (): IStyleType => {
  return {
    font: {
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
      weight: '400',
    },
    dimensions: {
      width: 'auto',
      height: 30,
    },
  };
};
