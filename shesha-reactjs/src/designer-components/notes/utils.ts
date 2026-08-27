import { IStyleValue } from '@/providers/form/models';

/**
 * Default appearance for the notes component.
 *
 * The component exposes only Font, Dimensions and Margin & Padding on its Appearance tab, so those
 * are the slots defined here. Each one is the render-time fallback for an unconfigured component,
 * the defaults the freeze migration bakes into old forms, and the baseline the theme editor shows
 * as inherited - so every input on the tab has something to inherit from and shows an inheritance
 * popover. Border, background and shadow are deliberately absent: the notes list and its editor sit
 * on the surface they are placed on rather than drawing a box of their own.
 */
export const defaultStyles = (): IStyleValue => ({
  font: {
    weight: '400',
    size: 14,
    color: '#000',
    type: 'Segoe UI',
    align: 'left',
  },
  dimensions: {
    width: '100%',
    height: 'auto',
    minHeight: '0px',
    maxHeight: 'auto',
    minWidth: '0px',
    maxWidth: 'auto',
  },
  stylingBoxJson: {
    _type: 'styleBox',
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '0',
    paddingLeft: '0',
  },
});
