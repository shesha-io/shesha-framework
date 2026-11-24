import { IStyleValue } from '@/providers/form/models';
import { GROUP_HEADER_STYLES_KEY, IThemeGroupStyle } from '@/providers/theme/contexts';
import { isDefined } from '@/utils/nullables';
import { deepCopyViaJson, deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';

/**
 * The part of a theme group's body style a header inherits by default: border, background and padding,
 * so the header matches the body. Margin and shadow stay with the component as a whole - on the header
 * they would offset it inside the component and double the shadow.
 */
export const getHeaderStyleFromBody = (groupStyle: IStyleValue): IStyleValue => {
  const { border, background, stylingBoxJson } = groupStyle;
  const padding = isDefined(stylingBoxJson)
    ? {
      _type: 'styleBox' as const,
      paddingTop: stylingBoxJson.paddingTop,
      paddingRight: stylingBoxJson.paddingRight,
      paddingBottom: stylingBoxJson.paddingBottom,
      paddingLeft: stylingBoxJson.paddingLeft,
    }
    : undefined;
  return {
    ...(isDefined(border) ? { border } : {}),
    ...(isDefined(background) ? { background } : {}),
    ...(isDefined(padding) ? { stylingBoxJson: padding } : {}),
  };
};

/**
 * A theme group's effective header style: what the header inherits from the body (see
 * {@link getHeaderStyleFromBody}), with the group's own Header Defaults overriding it value by value.
 */
export const getHeaderGroupStyle = (groupStyle: IThemeGroupStyle): IStyleValue => {
  const fromBody = getHeaderStyleFromBody(groupStyle);
  const overrides = groupStyle[GROUP_HEADER_STYLES_KEY];
  // deepMergeValues only shallow-copies its target, so merge into a deep copy: the body's nested values
  // are the theme's own objects.
  return isDefined(overrides) ? deepMergeValues(deepCopyViaJson(fromBody), overrides, deepMergeSkipUndefinedFunc) : fromBody;
};
