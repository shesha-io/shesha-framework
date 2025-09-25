import { IStyleType } from "@/index";

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
