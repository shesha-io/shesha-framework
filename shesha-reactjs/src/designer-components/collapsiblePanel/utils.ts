import { IStyleValue } from "@/providers/form/models";
import { ICollapsiblePanelComponentProps } from "./interfaces";
import { isDefined, isNullOrWhiteSpace } from "@/utils";
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (prev: ICollapsiblePanelComponentProps): IStyleValue => {
  const bodyColor = isNullOrWhiteSpace(prev.bodyColor) ? '#fff' : prev.bodyColor;
  const { ghost, borderRadius } = prev;

  return {
    background: { type: 'color', color: bodyColor },
    dimensions: { width: 'auto', height: 'fit-content', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: {
      radiusType: 'all', borderType: 'custom',
      border: {
        ...ghost === true ? { all: { width: '1px', color: '#d9d9d9', style: 'solid' } }
          : {
            all: { width: '1px', color: '#d9d9d9', style: 'solid' },
            top: { width: '1px', color: '#d9d9d9', style: 'none' },
            bottom: { width: '1px', color: '#d9d9d9', style: 'solid' },
            left: { width: '1px', color: '#d9d9d9', style: 'solid' },
            right: { width: '1px', color: '#d9d9d9', style: 'solid' },
          },
      },
      radius: { all: borderRadius ?? 8 },
    },
    shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '8', paddingBottom: '8', paddingTop: '8', paddingRight: '8', marginLeft: '0', marginBottom: '5', marginTop: '0', marginRight: '0' },
  };
};

/**
 * The part of the Layout Components theme style a panel's header inherits: border, background and
 * padding, so the header matches the body. Margin and shadow stay with the panel as a whole - on the
 * header they would offset it inside the panel and double the shadow.
 */
export const headerGroupStyle = (groupStyle: IStyleValue): IStyleValue => {
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

export const defaultHeaderStyles = (prev: ICollapsiblePanelComponentProps): IStyleValue => {
  const headerBgColor = isNullOrWhiteSpace(prev.headerColor) ? '#fff' : prev.headerColor;
  const { isSimpleDesign, borderRadius } = prev;

  return {
    font: { color: '#000', size: 14, weight: isSimpleDesign === true ? '400' : '500', align: 'left', type: DEFAULT_FONT_TYPE },
    background: {
      type: 'color',
      color: headerBgColor,
      repeat: 'no-repeat',
      position: 'center',
      size: 'cover',
    },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0', maxHeight: 'auto', minWidth: '0', maxWidth: 'auto' },
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: { width: '1px', color: '#d9d9d9', style: 'solid' },
      },
      radius: { all: borderRadius ?? 8 },
    },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '8', paddingBottom: '8', paddingTop: '8', paddingRight: '8', marginLeft: '0', marginBottom: '0', marginTop: '0', marginRight: '0' },
  };
};

