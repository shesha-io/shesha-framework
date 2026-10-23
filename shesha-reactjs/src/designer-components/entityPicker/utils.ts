import { IStyleValue } from "@/providers/form/models";
import { IEntityPickerComponentProps } from "./interfaces";


export const defaultStyles = (prev?: IEntityPickerComponentProps): IStyleValue => {
  const size = prev?.size;

  return {
    border: { hideBorder: false, radiusType: 'all', borderType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    dimensions: { width: '100%', height: size === 'small' ? '22px' : size === 'large' ? '38px' : '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: {
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
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
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "0",
      paddingLeft: "8",
      paddingRight: "8",
      paddingTop: "0",
    },
  };
};
