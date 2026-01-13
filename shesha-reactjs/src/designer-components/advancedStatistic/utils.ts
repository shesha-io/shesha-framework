import { IFontValue } from '../_settings/utils/font/interfaces';
import { IBorderValue } from '../_settings/utils/border/interfaces';

export interface IDefaultStyles {
  valueFont: IFontValue;
  titleFont: IFontValue;
  shadow: {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadRadius: number;
    color: string;
  };
  border: {
    border: IBorderValue;
    borderRadius: {
      borderTopLeftRadius: string;
      borderTopRightRadius: string;
      borderBottomLeftRadius: string;
      borderBottomRightRadius: string;
    };
  };
}

export const defaultStyles = (): IDefaultStyles => {
  return {
    valueFont: {
      type: 'Roboto',
      size: 32,
      weight: '600',
      color: '#1890ff',
    },
    titleFont: {
      type: 'Roboto',
      size: 14,
      weight: '400',
      color: 'rgba(0, 0, 0, 0.65)',
    },
    shadow: {
      offsetX: 0,
      offsetY: 7,
      blurRadius: 30,
      spreadRadius: -10,
      color: 'rgba(150, 170, 180, 0.5)',
    },
    border: {
      border: {
        border: {
          all: {
            width: 1,
            color: '#d9d9d9',
            style: 'solid',
          },
        },
      },
      borderRadius: {
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      },
    },
  };
};
