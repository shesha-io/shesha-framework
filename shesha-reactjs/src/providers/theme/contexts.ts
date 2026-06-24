import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';
import { FormLayout } from 'antd/lib/form/Form';
import { FormLabelAlign } from 'antd/lib/form/interface';
import { ColorValueType } from 'antd/es/color-picker/interface';

interface ITextTheme {
  default?: ColorValueType;
  secondary?: ColorValueType;
  link?: ColorValueType;
}

export type SidebarTheme = 'dark' | 'light';

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

/**
 * The four component-group tiers a component can belong to for theming purposes. A component declares
 * its tier via `IToolboxComponent.themeGroup`; the runtime style merge then layers
 * `theme[device].componentGroups[themeGroup]` between the component's hardcoded defaults and its
 * per-type theme overrides (see `knownFormComponent` effectiveStyle).
 */
export type ThemeComponentGroup = keyof IComponentGroupsSettings;

/** Device buckets the theme's component/group styles are nested under. */
export type ThemeDevice = 'desktop' | 'tablet' | 'mobile';

/**
 * Device-scoped theme styles. Component and group appearance defaults live under a device key
 * (theme.desktop / theme.tablet / theme.mobile) so they can be themed per device, mirroring how a
 * component instance's own desktop/tablet/mobile style buckets cascade. `desktop` is the base; tablet
 * and mobile overlay it.
 */
export interface IThemeDeviceStyles {
  /** Per-component-group appearance defaults (input/layout/standard/inline). */
  componentGroups?: IComponentGroupsSettings;
  /** Per-component-type appearance defaults, keyed by component type. */
  components?: Record<string, unknown>;
}

export interface IConfigurableTheme {
  application?: Theme | undefined;
  sidebar?: SidebarTheme | undefined;
  sidebarBackground?: string | undefined;
  layoutBackground?: ColorValueType | undefined;
  text?: ITextTheme | undefined;
  labelSpan?: number | undefined;
  componentSpan?: number | undefined;

  labelAlign?: FormLabelAlign;
  layout?: FormLayout;
  colon?: boolean;

  /** Device-scoped component & group appearance defaults. `desktop` is the base tier. */
  desktop?: IThemeDeviceStyles;
  tablet?: IThemeDeviceStyles;
  mobile?: IThemeDeviceStyles;
  custom?: IThemeDeviceStyles;

  /**
   * @deprecated Use `theme[device].componentGroups`. Kept for reading legacy themes saved before
   * component/group styles were nested under a device key.
   */
  componentGroups?: IComponentGroupsSettings;
  /**
   * @deprecated Use `theme[device].components`. Kept for reading legacy themes saved before
   * component/group styles were nested under a device key.
   */
  components?: { [key: string]: unknown };
}

export interface IThemeStateContext {
  readonly theme: IConfigurableTheme;
  readonly initialTheme: IConfigurableTheme | undefined;
  prefixCls: string;
  iconPrefixCls: string;
  labelSpan: number;
  componentSpan: number;
  labelAlign?: FormLabelAlign;
  layout?: FormLayout;
  colon?: boolean;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IConfigurableTheme, isApplication?: boolean) => void;
  resetToApplicationTheme: () => void;
  /** Per-component theme styles for a device (defaults to desktop, the base tier), or {} when unset. */
  getComponentStyle: (componentName: string, device?: ThemeDevice) => unknown;
  /** Group-tier theme styles for a component group, for a device (defaults to desktop), or {} when unset. */
  getComponentGroupStyle: (group: ThemeComponentGroup | undefined, device?: ThemeDevice) => unknown;

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
  initialTheme: undefined,
};

export const UiStateContext = createNamedContext<IThemeStateContext | undefined>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext | undefined>(undefined, "UiActionsContext");
