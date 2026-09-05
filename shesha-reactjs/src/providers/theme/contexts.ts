import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';
import { FormItemLayout } from 'antd/lib/form/Form';
import { FormLabelAlign } from 'antd/lib/form/interface';

interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

/** Resolved colour scheme actually applied to the UI. Never 'system'. */
export type ResolvedTheme = 'dark' | 'light';

/**
 * Colour scheme as configured by the user. 'system' follows the OS
 * `prefers-color-scheme` setting and is resolved to a {@link ResolvedTheme} at render time.
 */
export type ColorScheme = ResolvedTheme | 'system';

/** @deprecated use {@link ColorScheme}. Kept as an alias because `sidebar` used to be sidebar-only. */
export type SidebarTheme = ColorScheme;

export interface IConfigurableTheme {
  application?: Theme | undefined;
  /**
   * Application-wide colour scheme. Named `sidebar` for backwards compatibility with
   * previously saved theme settings, where it only controlled the side menu.
   */
  sidebar?: ColorScheme | undefined;
  sidebarBackground?: string | undefined;
  layoutBackground?: string | undefined;
  text?: ITextTheme | undefined;
  labelSpan?: number | undefined;
  componentSpan?: number | undefined;

  labelAlign?: FormLabelAlign;
  layout?: FormItemLayout;
  colon?: boolean;
  components?: { [key: string]: unknown };
}

export interface IThemeStateContext {
  readonly theme: IConfigurableTheme;
  /** Colour scheme currently applied, with 'system' already resolved against the OS setting. */
  readonly resolvedTheme: ResolvedTheme;
  readonly initialTheme: IConfigurableTheme | undefined;
  prefixCls: string;
  iconPrefixCls: string;
  labelSpan: number;
  componentSpan: number;
  labelAlign?: FormLabelAlign;
  layout?: FormItemLayout;
  colon?: boolean;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IConfigurableTheme, isApplication?: boolean) => void;
  resetToApplicationTheme: () => void;
  getComponentStyle: (componentName: string) => unknown;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const THEME_CONTEXT_INITIAL_STATE: IThemeStateContext = {
  resolvedTheme: 'light',
  theme: {
    application: {
      primaryColor: '#1890ff',
      errorColor: '#ff4d4f',
      warningColor: '#faad14',
      successColor: '#52c41a',
      infoColor: '#1890ff',
    },
    sidebar: 'light',
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
  colon: true,
  layout: 'horizontal',
  initialTheme: undefined,
};

export const UiStateContext = createNamedContext<IThemeStateContext | undefined>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext | undefined>(undefined, "UiActionsContext");
