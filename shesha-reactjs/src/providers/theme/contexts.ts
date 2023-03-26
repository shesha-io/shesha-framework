import { createContext } from 'react';
import { Theme } from 'antd/lib/config-provider/context';

export interface IConfigurableTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  layoutBackground?: string;
}

export interface IThemeStateContext {
  readonly theme?: IConfigurableTheme;
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
  },
};

export const UiStateContext = createContext<IThemeStateContext>(THEME_CONTEXT_INITIAL_STATE);

export const UiActionsContext = createContext<IThemeActionsContext>(undefined);
