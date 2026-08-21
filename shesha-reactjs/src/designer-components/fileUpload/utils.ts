import { IStyleValue } from "@/providers/form/models";

/**
 * Code-level defaults for the component. These are the render-time fallback for every style slot the
 * model leaves unset, the defaults baked in by the style-freeze migration, and the baseline the theme
 * editor shows as inherited — so every group the Appearance tab exposes is represented here.
 *
 * The dimensions describe the thumbnail tile; in file-name mode the uploader sizes itself to its
 * content and these are not applied (see `styles.ts`).
 */
export const defaultStyles = (): IStyleValue => {
  return {
    font: {
      type: 'Segoe UI',
      align: 'left',
      size: 14,
      weight: '400',
      color: '',
    },
    border: {
      hideBorder: false,
      radiusType: 'all',
      borderType: 'all',
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 8 },
    },
    dimensions: {
      width: '54px',
      height: '54px',
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
      gradient: { direction: 'to right', colors: [] },
      url: '',
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
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
    },
  };
};
