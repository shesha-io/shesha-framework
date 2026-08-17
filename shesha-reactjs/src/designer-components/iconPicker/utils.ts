import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    // The full background set (not just type/color) so every Background input on the Appearance tab
    // has a default to inherit from and shows its inheritance popover.
    background: {
      type: 'color',
      color: 'transparent',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    // Weight and family are excluded from the Icon Style panel — a glyph has neither — so only the
    // properties the panel actually exposes are defaulted here.
    font: {
      size: 24,
      color: '#000',
      align: 'left',
    },
    // The icon is a bare glyph rather than a boxed input: no border and no radius by default, so it
    // renders as the icon alone until the user configures a box.
    border: {
      border: {
        all: {
          width: 0,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 0 },
      borderType: 'all',
      radiusType: 'all',
    },
    // No `dimensions`: the Appearance tab exposes no Dimensions panel, since the icon is sized by
    // its font size rather than by width/height.
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
