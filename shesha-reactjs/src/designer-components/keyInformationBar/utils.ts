import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    border: {
      border: {
        all: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
        top: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
        bottom: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
        left: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
        right: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
      },
      radius: { all: 0 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    stylingBox: "{\"marginBottom\":\"5\"}",
  };
};
