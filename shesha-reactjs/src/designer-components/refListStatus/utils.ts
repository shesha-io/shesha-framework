import { IStyleValue } from '@/providers/form/models';

export const defaultStyles = (): IStyleValue => {
  return {
    // The full compound set: every Appearance input needs a matching slot here, or it renders with
    // no inheritance popover (getValueInfo falls back to 'onlyModel').
    background: {
      type: 'color',
      color: '',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: {
      weight: '400',
      size: 12,
      color: '#000',
      type: 'Segoe UI',
      align: 'center',
    },
    border: {
      border: {
        all: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 4 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'auto',
      height: '24px',
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
      marginBottom: '0',
      marginLeft: '0',
      marginRight: '0',
      marginTop: '0',
      paddingBottom: '0',
      paddingLeft: '8',
      paddingRight: '8',
      paddingTop: '0',
    },
  };
};
