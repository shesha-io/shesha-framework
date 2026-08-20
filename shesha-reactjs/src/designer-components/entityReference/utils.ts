import { IStyleValue } from "@/providers/form/models";

/**
 * Default appearance of an unconfigured Entity Reference.
 *
 * Complete on purpose: this is the render-time fallback for every slot the model leaves unset, the
 * defaults argument of the style-freeze migration, and the baseline the theme editor shows. The
 * compound `background` set is spelled out in full so every Background input has something to
 * inherit from and shows its inheritance popover.
 *
 * The trigger is a link-style control rather than a boxed input, so the border and background are
 * deliberately transparent/none — an entity reference should read as a link inside its surroundings
 * until the user configures otherwise.
 */
export const defaultStyles = (): IStyleValue => {
  return {
    background: {
      type: 'color',
      color: 'transparent',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: {
      weight: '400',
      size: 14,
      color: '#1677ff',
      type: 'Segoe UI',
      align: 'left',
    },
    border: {
      border: {
        all: { width: 0, style: 'none', color: '#d9d9d9' },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'auto',
      height: '32px',
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
