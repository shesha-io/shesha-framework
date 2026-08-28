import { IButtonComponentProps, IButtonStyleValue } from "@/designer-components/button/interfaces";
import { isNullOrWhiteSpace } from "@/utils";

export const defaultStyles = (prev?: IButtonComponentProps | undefined): IButtonStyleValue => {
  return {
    buttonType: isNullOrWhiteSpace(prev?.buttonType) ? 'link' : prev.buttonType,
    background: { type: 'color' },
    font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
    border: {
      border: { all: { width: '1px', style: 'none', color: '#d9d9d9' } },
      radius: { all: 8 },
      borderType: 'all',
    },
    shadow: {
      color: '#000000',
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
    },
    dimensions: {
      width: prev?.block === true ? '100%' : 'auto',
      height: 'auto', minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};
