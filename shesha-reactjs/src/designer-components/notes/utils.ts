import { IStyleValue } from '@/providers/form/models';

/**
 * Complete default appearance for the notes component.
 *
 * Every slot the Appearance tab exposes is listed deliberately: these values are the render-time
 * fallback for an unconfigured component, the defaults the freeze migration bakes into old forms,
 * and the baseline the theme editor shows as inherited. The background is spelled out in full
 * (size/position/repeat/gradient/url) so each of its compound inputs has something to inherit from
 * and shows an inheritance popover.
 */
export const defaultStyles = (): IStyleValue => ({
  font: {
    weight: '400',
    size: 14,
    color: '#000',
    type: 'Segoe UI',
    align: 'left',
  },
  border: {
    hideBorder: false,
    borderType: 'all',
    radiusType: 'all',
    border: { all: { width: 1, style: 'solid', color: '#d9d9d9' } },
    radius: { all: 8 },
  },
  background: {
    type: 'color',
    color: '#fff',
    repeat: 'no-repeat',
    size: 'cover',
    position: 'center',
    gradient: { direction: 'to right', colors: [] },
    url: '',
  },
  dimensions: {
    width: '100%',
    height: 'auto',
    minHeight: '0px',
    maxHeight: 'auto',
    minWidth: '0px',
    maxWidth: 'auto',
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
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0',
    paddingTop: '8',
    paddingRight: '8',
    paddingBottom: '8',
    paddingLeft: '8',
  },
});
