import { SpaceProps } from 'antd';
import { IInputStyles, IStyleValue } from '@/providers/form/models';
import { IOptionStyleValue } from '../_common-migrations/migrateStylesToOption';
import { isNullOrWhiteSpace } from '@/utils';

export const getSpan = (direction: SpaceProps['direction'], size: number): number =>
  direction === 'vertical' ? 24 : size < 4 ? 24 / size : 6;

// Default Appearance styles. These describe a checkbox in the group, so they sit under the
// `option` set; the wrapper is left unstyled so the group takes its size from its content.
// Mirrors the standalone Checkbox component so both look consistent out of the box.
export const defaultStyles = (prev?: IInputStyles): IOptionStyleValue => {
  return { option: defaultOptionStyles(prev) };
};

const defaultOptionStyles = (prev?: IInputStyles): IStyleValue => {
  return {
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 4 },
    },
    dimensions: {
      width: !prev?.width || isNullOrWhiteSpace(`${prev.width}`) || `${prev.width}` === 'auto' ? '14px' : `${prev.width}`,
      height: !prev?.height || isNullOrWhiteSpace(`${prev.height}`) || `${prev.height}` === 'auto' ? '14px' : `${prev.height}`,
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
    stylingBoxJson: {
      _type: 'styleBox',
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
  };
};
