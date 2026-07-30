import { IInputStyles, IStyleValue } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { ISwitchComponentProps } from './interfaces';

export const defaultStyles = (prev?: ISwitchComponentProps & IInputStyles): IStyleValue => {
  const hasDimension = (value: string | number | undefined): value is string | number =>
    isDefined(value) && value !== '' && value !== 'auto';

  return {
    background: { type: 'color', color: '' },
    font: {
      weight: '400',
      size: 12,
      color: '',
      type: 'Segoe UI',
      align: 'left',
    },
    border: {
      border: {
        all: {
          width: '0px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 100 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: hasDimension(prev?.width) ? prev.width : '44px',
      height: hasDimension(prev?.height) ? prev.height : '22px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: {
      spreadRadius: 0,
      blurRadius: 0,
      color: '#000',
      offsetX: 0,
      offsetY: 0,
    },
    stylingBoxJson: {
      _type: 'styleBox',
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
    },
  };
};
