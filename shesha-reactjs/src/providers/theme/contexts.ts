import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';

export interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

export interface IApplicationTheme {
  primaryColor?: string;
  errorColor?: string;
  warningColor?: string;
  successColor?: string;
  infoColor?: string;
  processingColor?: string;
}

export interface IMarginPaddingTheme {
  formFields?: string;
  layout?: string;
  grid?: string;
  standard?: string;
  inline?: string;
}

export interface IBorderStyle {
  width?: string;
  style?: string;
  color?: string;
}

export interface IRadiusConfig {
  all?: number;
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

export interface IBorderTheme {
  border?: {
    all?: IBorderStyle;
  };
  radius?: IRadiusConfig;
  radiusType?: 'all' | 'individual';
}

export interface IShadowTheme {
  offsetX?: number;
  offsetY?: number;
  blurRadius?: number;
  spreadRadius?: number;
  color?: string;
}

export interface ILayoutComponents {
  stylingBox?: string;
  gridGapHorizontal?: number;
  gridGapVertical?: number;
  border?: IBorderTheme;
  shadow?: IShadowTheme;
}

export interface IInputComponents {
  labelSpan?: number;
  contentSpan?: number;
  labelColon?: boolean;
  stylingBox?: string;
}

export interface IStandardComponents {
  stylingBox?: string;
}

export interface IInlineComponents {
  stylingBox?: string;
}

export interface IConfigurableTheme {
  application?: IApplicationTheme | Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  layoutBackground?: string;
  text?: ITextTheme;
  labelSpan?: number;
  componentSpan?: number;
  marginPadding?: IMarginPaddingTheme;
  componentBackground?: string;
  layoutComponents?: ILayoutComponents;
  inputComponents?: IInputComponents;
  standardComponents?: IStandardComponents;
  inlineComponents?: IInlineComponents;
}

export interface IThemeStateContext {
  readonly theme?: IConfigurableTheme;
  prefixCls: string;
  iconPrefixCls: string;
  labelSpan: number;
  componentSpan: number;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IConfigurableTheme, isApplication?: boolean) => void;
  resetToApplicationTheme: () => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const THEME_CONTEXT_INITIAL_STATE: IThemeStateContext = {
  theme: {
    application: {
      primaryColor: '#1890ff',
      errorColor: '#ff4d4f',
      warningColor: '#faad14',
      successColor: '#52c41a',
      infoColor: '#1890ff',
    },
    sidebar: 'dark',
    layoutBackground: '#f0f2f5',
    componentBackground: '#ffffff',
    text: {
      default: '#000000d9',
      secondary: '#00000073',
      link: '',
    },
    marginPadding: {
      formFields: '{"marginTop":"0","paddingTop":"0"}',
      layout: '{"paddingBottom":"0","paddingTop":"0"}',
      grid: '{"paddingBottom":"0","paddingTop":"0"}',
      standard: '{"marginTop":"0","paddingTop":"0"}',
      inline: '{"paddingTop":"0","marginTop":"0"}',
    },
    layoutComponents: {
      stylingBox: '{"marginBottom":"0"}',
      gridGapHorizontal: 8,
      gridGapVertical: 8,
      border: {
        border: {
          all: {
            width: '1',
            style: 'solid',
            color: '#d9d9d9',
          },
        },
        radius: {
          all: 4,
        },
        radiusType: 'all',
      },
      shadow: {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 0,
        spreadRadius: 0,
        color: '#000000',
      },
    },
    inputComponents: {
      labelSpan: 8,
      contentSpan: 16,
      labelColon: true,
      stylingBox: '{"marginBottom":"0"}',
    },
    standardComponents: {
      stylingBox: '{"marginBottom":"0"}',
    },
    inlineComponents: {
      stylingBox: '{"marginBottom":"0"}',
    },
  },
  prefixCls: 'antd',
  iconPrefixCls: 'antdicon',
  labelSpan: 6,
  componentSpan: 18,
};

export const UiStateContext = createNamedContext<IThemeStateContext>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext>(undefined, "UiActionsContext");
