import { createNamedContext } from '@/utils/react';
import { FormItemLayout } from 'antd/es/form/Form';
import { FormLabelAlign } from 'antd/es/form/interface';
import { Theme } from 'antd/lib/config-provider/context';

interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

export type SidebarTheme = 'dark' | 'light';

export interface IConfigurableTheme {
  application?: Theme | undefined;
  sidebar?: SidebarTheme | undefined;
  sidebarBackground?: string | undefined;
  layoutBackground?: string | undefined;
  text?: ITextTheme | undefined;
  labelSpan?: number | undefined;
  componentSpan?: number | undefined;

  labelAlign?: FormLabelAlign;
  layout?: FormItemLayout;
  colon?: boolean;
}

export interface IThemeStateContext {
  readonly theme: IConfigurableTheme;
  readonly initialTheme: IConfigurableTheme | undefined;
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
  initialTheme: undefined,
};

export const UiStateContext = createNamedContext<IThemeStateContext | undefined>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext | undefined>(undefined, "UiActionsContext");
