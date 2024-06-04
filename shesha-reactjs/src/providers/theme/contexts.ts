import { Theme } from 'antd/lib/config-provider/context';
import { createContext } from 'react';

interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

export interface IConfigurableTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  layoutBackground?: string;
  text?: ITextTheme;
  labelSpan?: number;
  componentSpan?: number;
}

export interface IThemeStateContext {
  readonly theme?: IConfigurableTheme;
  prefixCls: string;
  iconPrefixCls: string;
  labelSpan: number;
  componentSpan: number;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IConfigurableTheme) => void;

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
    text: {
      default: '#000000d9',
      secondary: '#00000073',
      link: '',
    },
  },
  prefixCls: 'antd',
  iconPrefixCls: 'antdicon',
  labelSpan: 6,
  componentSpan: 18,
};

export const UiStateContext = createContext<IThemeStateContext>(THEME_CONTEXT_INITIAL_STATE);

export const UiActionsContext = createContext<IThemeActionsContext>(undefined);
