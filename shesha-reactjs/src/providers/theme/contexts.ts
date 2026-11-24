import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';
import { FormItemLayout } from 'antd/lib/form/Form';
import { FormLabelAlign } from 'antd/lib/form/interface';
import { ThemeComponentGroup } from '@/interfaces/formDesigner';
import type { IStyleValue } from '@/providers/form/models';
import type { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';

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

const COLOR_SCHEMES: readonly ColorScheme[] = ['light', 'dark', 'system'];

/**
 * Coerces a persisted colour scheme to a valid {@link ColorScheme}.
 *
 * Saved theme settings predate the 'system' option and are not schema-validated, so the stored
 * value can be empty or something no longer supported. Anything unrecognised falls back to
 * 'system' — the default — so the settings control always has exactly one option selected.
 */
export const normalizeColorScheme = (value: unknown): ColorScheme =>
  COLOR_SCHEMES.includes(value as ColorScheme) ? (value as ColorScheme) : 'system';

export type { ThemeComponentGroup };

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
  /**
   * Application-wide base font: the lowest style layer (see `getEffectiveStyle`). Every component, group
   * and label inherits the parts it does not set itself. Unset `type` means the default font (Inter).
   */
  font?: IFontValue | undefined;
  /**
   * @deprecated Saved by earlier versions as the application font type name; read into `font.type`
   * when a theme is loaded (see `upgradeLegacyThemeFonts`). Do not use.
   */
  fontFamily?: string | undefined;
  /**
   * @deprecated Saved by earlier versions as the label font; read into `componentGroups.input.labelFont`
   * when a theme is loaded (see `upgradeLegacyThemeFonts`). Do not use.
   */
  labelFont?: IFontValue | undefined;
  labelSpan?: number | undefined;
  componentSpan?: number | undefined;

  labelAlign?: FormLabelAlign | undefined;
  layout?: FormItemLayout | undefined;
  colon?: boolean | undefined;
  components?: { [key: string]: unknown };
  /**
   * Per-style-group appearance defaults (Input/Inline/Standard/Layout Components tabs). Every
   * component whose explicit `themeGroup` is one of these tiers inherits from it, between the
   * component's hardcoded defaults and its own per-type override in `components`.
   */
  componentGroups?: Partial<Record<ThemeComponentGroup, IThemeGroupStyle>>;
}

/**
 * Key of a theme group style's header defaults (Layout Components tab > Header Defaults). Only the
 * overrides are stored there: a header otherwise follows the body's style (see `getHeaderGroupStyle`).
 */
export const GROUP_HEADER_STYLES_KEY = 'headerStyles';

/**
 * Style of a theme component group. Besides the style its components inherit, a group carries styles
 * for parts that are not components themselves - header defaults, the label font - which are kept out
 * of the components' own style (see `getGroupStyleForComponent`).
 */
export type IThemeGroupStyle = IStyleValue & {
  /** Header defaults of components that have a header (card, panel, tabs). */
  [GROUP_HEADER_STYLES_KEY]?: IStyleValue | undefined;
  /** Font of form item labels (Input Components group); unset parts inherit the base `font`. */
  labelFont?: IFontValue | undefined;
};

/** Keys of {@link IThemeGroupStyle} that style something other than the group's components. */
export const GROUP_NON_COMPONENT_STYLE_KEYS = [GROUP_HEADER_STYLES_KEY, 'labelFont'] as const;

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
  /** Group-tier theme styles for a style group (Input/Inline/Standard/Layout Components), or {} when unset. */
  getComponentGroupStyle: (group: ThemeComponentGroup | undefined) => IStyleValue;

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
