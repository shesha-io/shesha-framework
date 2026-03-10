import { IStyleType } from "@/index";

export const initialStyles = (): IStyleType => {
  return {
    border: {
      hideBorder: false,
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
        top: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
        bottom: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
        left: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
        right: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },

      },
      radius: { all: 8 },
    },
    background: {
      type: 'color',
      color: "#ffffff",
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: {} },
    },
    font: {
      color: '#000',
      type: 'Arial',
      align: 'left',
      size: 14,
      weight: '400',
    },
    dimensions: {
      height: "32px",
      width: '100%',
      minHeight: '0px',
      minWidth: '0px',
      maxWidth: '100%',
      maxHeight: '100%',
    },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000000',
      blurRadius: 0,
      spreadRadius: 0,
    },
  };
};
