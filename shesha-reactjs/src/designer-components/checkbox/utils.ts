import { IInputStyles, IStyleType } from '@/index';
import { ICheckboxComponentProps } from './interfaces';

export const defaultStyles = (prev: ICheckboxComponentProps & IInputStyles): IStyleType => {
  return {
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 4 },
    },
    dimensions: {
      width: !prev.width || prev.width === 'auto' ? '14px' : prev.width,
      height: !prev.height || prev.height === 'auto' ? '14px' : prev.height,
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    background: {
      type: 'color',
      color: '',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: {} },
      url: '',
      storedFile: { id: null },
      uploadFile: null,
    },
    font: {
      color: '',
      size: 14,
      weight: '400',
    },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000',
      blurRadius: 0,
      spreadRadius: 0,
    },
  };
};
