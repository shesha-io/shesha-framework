import { IStyleValue } from "@/providers/form/models";
import { IFontValue } from "@/designer-components/_settings/utils/font/interfaces";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (): IStyleValue => {
  return {
    border: { hideBorder: false, radiusType: 'all', borderType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    dimensions: { width: 'auto', height: 'fit-content', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    // No font: a card's font applies to its header title only (Header Style).
    shadow: { offsetX: 0, offsetY: 0, color: '#000', blurRadius: 0, spreadRadius: 0 },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '0', paddingBottom: '0', paddingTop: '0', paddingRight: '0', marginLeft: '0', marginBottom: '5', marginTop: '0', marginRight: '0' },
  };
};

/** Font antd gave a card's title (`fontSizeLG`, `fontWeightStrong`, `colorTextHeading`). */
const legacyHeadingFont = (): IFontValue => ({ type: DEFAULT_FONT_TYPE, size: 16, weight: '600', color: 'rgba(0, 0, 0, 0.88)', align: 'left' });

/**
 * Default style of the card's header: antd's card head (a 56px bar with 24px side padding and a light line
 * under it). The theme's Header Defaults (Layout Components) override it, and the component's Header Style
 * overrides both.
 */
export const defaultHeaderStyles = (): IStyleValue => ({
  font: legacyHeadingFont(),
  dimensions: { height: 'auto', minHeight: '56px', maxHeight: 'auto' },
  border: { borderType: 'custom', radiusType: 'all', border: { bottom: { width: '1px', style: 'solid', color: '#f0f0f0' } } },
  stylingBoxJson: { _type: 'styleBox', paddingLeft: '24', paddingRight: '24', paddingTop: '0', paddingBottom: '0' },
});

/**
 * Header style pinned on cards created before the header was configurable, so they keep antd's look
 * whatever the theme's Header Defaults say. The background is transparent: the head showed the card's own
 * background.
 */
export const legacyHeaderStyles = (): IStyleValue => ({
  ...defaultHeaderStyles(),
  background: { type: 'color', color: 'transparent' },
});
