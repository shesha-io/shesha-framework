import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';
import { FormItemLayout } from 'antd/lib/form/Form';
import { FormLabelAlign } from 'antd/lib/form/interface';

interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

/** Settings shared by every component group: default margin/padding in the styleBox JSON format. */
export interface IComponentGroupBaseSettings {
  /** Margin/padding values as a styleBox JSON string (same format as designer `stylingBox`). */
  stylingBox?: string;
  /** Allow any additional properties for the enhanced theme system. */
  [key: string]: any;
}

/** Group-level defaults for input components (text fields, dropdowns, checkboxes, ...). */
export interface IInputGroupSettings extends IComponentGroupBaseSettings {
  labelAlign?: FormLabelAlign | 'top';
  colon?: boolean;
  /** Label span on the 24-column grid; content span is its complement. */
  labelSpan?: number;
}

/** Group-level defaults for layout components (containers, panels, columns, tabs, ...). */
export interface ILayoutGroupSettings extends IComponentGroupBaseSettings {
  /** Gutter spacing (px) when using grid layout. */
  gridGap?: number;
  backgroundColor?: string;
  borderRadius?: number;
  /** CSS box-shadow value. */
  shadow?: string;
}

/** Group-level defaults for standard (display) components (text, alerts, links, ...). */
export type IStandardGroupSettings = IComponentGroupBaseSettings;

/** Group-level defaults for in-line components (buttons and other inline actions). */
export interface IInlineGroupSettings extends IComponentGroupBaseSettings {
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | 'ghost';
  buttonBorderRadius?: number;
  /** CSS box-shadow value applied to buttons. */
  buttonShadow?: string;
}

/**
 * Group-level component settings — the middle tier of the Theme → Group → Component inheritance
 * model. Component-level overrides win over these, which in turn win over theme-level settings.
 */
export interface IComponentGroupsSettings {
  input?: IInputGroupSettings;
  layout?: ILayoutGroupSettings;
  standard?: IStandardGroupSettings;
  inline?: IInlineGroupSettings;
}

export interface IConfigurableTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  layoutBackground?: string;
  text?: ITextTheme;
  labelSpan?: number;
  componentSpan?: number;
  labelAlign?: FormLabelAlign;
  layout?: FormItemLayout;
  colon?: boolean;
  componentGroups?: IComponentGroupsSettings;
}

export interface IThemeStateContext {
  readonly theme?: IConfigurableTheme | undefined;
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
  colon: true,
  layout: 'horizontal',
};

export const UiStateContext = createNamedContext<IThemeStateContext | undefined>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext | undefined>(undefined, "UiActionsContext");
