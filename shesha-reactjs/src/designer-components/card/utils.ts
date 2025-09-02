import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {

  return {
    border: { hideBorder: false, radiusType: 'all', borderType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: {} },
      url: '',
      storedFile: { id: null },
      uploadFile: null,
    },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000',
      blurRadius: 0,
      spreadRadius: 0
    },
  };
};
