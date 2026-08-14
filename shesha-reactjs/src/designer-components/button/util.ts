import { IStyleValue } from "@/providers/form/models";
import { IButtonComponentProps } from "./interfaces";

export const buttonTypes = [
  {
    label: 'Default',
    value: 'default',
  },
  {
    label: 'Primary',
    value: 'primary',
  },
  {
    label: 'Link',
    value: 'link',
  },
  {
    label: 'Text',
    value: 'text',
  },
];

export const defaultStyles = (prev: IButtonComponentProps): IStyleValue & { buttonType: IButtonComponentProps['buttonType'] } => {
  return {
    buttonType: 'default',
    background: { type: 'color' },
    font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
    border: {
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 8 },
      hideBorder: false,
      borderType: 'all',
      radiusType: 'all',
    },
    shadow: {
      color: '#000000',
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
    },
    dimensions: {
      width: prev.block === true ? '100%' : 'auto',
      height: '32px', minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};

