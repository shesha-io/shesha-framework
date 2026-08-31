import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    background: {
      type: 'color',
      color: '#ffffff00',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: {
      size: 24,
      color: '#000',
      align: 'left',
    },
    border: {
      border: {
        all: {
          width: 0,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 6 },
      borderType: 'all',
      radiusType: 'all',
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
      paddingBottom: "4",
      paddingLeft: "4",
      paddingRight: "4",
      paddingTop: "4",
    },
  };
};
