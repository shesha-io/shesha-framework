import { createContext } from 'react';
import { Theme } from 'antd/lib/config-provider/context';

export interface IApplicationTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
}

export interface IThemeStateContext {
  readonly theme?: IApplicationTheme;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IApplicationTheme) => void;

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
  },
};

export const UiStateContext = createContext<IThemeStateContext>(THEME_CONTEXT_INITIAL_STATE);

export const UiActionsContext = createContext<IThemeActionsContext>(undefined);
