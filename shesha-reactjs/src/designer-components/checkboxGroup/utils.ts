import { SpaceProps } from 'antd';
import { IInputStyles, IStyleValue } from '@/providers/form/models';

export const getSpan = (direction: SpaceProps['direction'], size: number): number =>
  direction === 'vertical' ? 24 : size < 4 ? 24 / size : 6;

// Default Appearance styles for a checkbox in the group. Mirrors the standalone
// Checkbox component so both look consistent out of the box.
export const defaultStyles = (prev?: IInputStyles): IStyleValue => {
  return {
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 4 },
    },
    dimensions: {
      width: !prev?.width || prev.width === 'auto' ? '14px' : prev.width,
      height: !prev?.height || prev.height === 'auto' ? '14px' : prev.height,
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
