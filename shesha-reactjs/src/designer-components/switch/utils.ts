import { IInputStyles, IStyleValue } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { ISwitchComponentProps } from './interfaces';

/** Styles for the handle (the moving knob). Sized to antd's own handle for a default track. */
export const defaultHandleStyles = (): IStyleValue => ({
  background: { type: 'color', color: '#fff' },
  border: {
    border: {
      all: {
        width: '0px',
        style: 'solid',
        color: '#d9d9d9',
      },
    },
    radius: { all: 100 },
    borderType: 'all',
    radiusType: 'all',
  },
  // 18px is the track height (22px) less 2px of track padding on each side.
  dimensions: {
    width: '18px',
    height: '18px',
    minHeight: '0px',
    maxHeight: 'auto',
    minWidth: '0px',
    maxWidth: 'auto',
  },
  shadow: {
    spreadRadius: 0,
    blurRadius: 2,
    color: '#00230b33',
    offsetX: 0,
    offsetY: 2,
  },
});

/** Styles for the track. The handle is styled separately, see `defaultHandleStyles`. */
export const defaultStyles = (prev?: ISwitchComponentProps & IInputStyles): IStyleValue => {
  const hasDimension = (value: string | number | undefined): value is string | number =>
    isDefined(value) && value !== '' && value !== 'auto';

  return {
    // Track styles. The background applies only in the "on" state; the off state keeps antd's
    // default grey so the two states stay distinguishable. Left empty so an unconfigured switch
    // inherits antd's own "on" colour rather than being forced to a hard-coded one.
    background: { type: 'color', color: '' },
    border: {
      border: {
        all: {
          width: '0px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 100 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: hasDimension(prev?.width) ? prev.width : '44px',
      height: hasDimension(prev?.height) ? prev.height : '22px',
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
