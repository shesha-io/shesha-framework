import { App, ConfigProvider, ThemeConfig } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { IComponentGroupsSettings, IConfigurableTheme, IThemeActionsContext, IThemeStateContext, THEME_CONTEXT_INITIAL_STATE, ThemeComponentGroup, ThemeDevice, UiActionsContext, UiStateContext } from './contexts';
import { defaultRequiredMark } from './shaRequiredMark';
import { useSettings, useSheshaApplication } from '..';
import { coerceCssColor, isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';

export interface ThemeProviderProps {
  prefixCls?: string;
  iconPrefixCls?: string;
  themeConfigKey?: string;
}

const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  iconPrefixCls = 'anticon',
  prefixCls = 'ant',
}) => {
  const [state, setState] = useState<IThemeStateContext>({
    ...THEME_CONTEXT_INITIAL_STATE,
    prefixCls: prefixCls,
    iconPrefixCls: iconPrefixCls,
  });

  const settings = useSettings();
  const application = useSheshaApplication();
  application.registerInitialization('theme', async () => {
    // load theme settings
    const theme = await settings.getSetting<IConfigurableTheme>({ module: 'Shesha', name: 'Shesha.ThemeSettings' });
    setState((prev) => ({ ...prev, theme: theme, initialTheme: theme }));
  });

  const changeTheme = useCallback((theme: IConfigurableTheme, isApplication: boolean = false) => {
    // save theme to the state
    setState((prev) => ({
      ...prev,
      theme: theme,
      initialTheme: isApplication ? { ...theme } : prev.initialTheme,
    }));
  }, []);

  const resetToApplicationTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: { ...prev.initialTheme } }));
  }, []);

  // Component/group theme styles live under a device key (theme.desktop / theme.tablet / theme.mobile);
  // desktop is the base and the requested device overlays it. Legacy themes stored these at the theme
  // root, so fall back to the deprecated top-level fields.
  const getComponentStyle = useCallback((componentName: string, device: ThemeDevice = 'desktop') => {
    const base = (state.theme.desktop?.components ?? state.theme.components ?? {}) as Record<string, unknown>;
    const overlay = device === 'desktop' ? {} : (state.theme[device]?.components ?? {}) as Record<string, unknown>;
    return deepMergeValues(base[componentName] ?? {}, overlay[componentName] ?? {}, deepMergeSkipUndefinedFunc);
  }, [state.theme]);

  const getComponentGroupStyle = useCallback(
    (group: ThemeComponentGroup | undefined, device: ThemeDevice = 'desktop') => {
      if (!isDefined(group)) return {};
      const base = state.theme.desktop?.componentGroups ?? state.theme.componentGroups ?? {};
      const overlay = device === 'desktop' ? {} : state.theme[device]?.componentGroups ?? {};
      const groups = deepMergeValues(base, overlay, deepMergeSkipUndefinedFunc) as IComponentGroupsSettings;
      return groups[group] ?? {};
    },
    [state.theme],
  );

  const themeConfig = useMemo<ThemeConfig>(() => {
    const appTheme = state.theme.application;
    const themeDefaults: ThemeConfig['token'] = {};

    const primaryColor = coerceCssColor(appTheme?.primaryColor);
    const infoColor = coerceCssColor(appTheme?.infoColor);
    const successColor = coerceCssColor(appTheme?.successColor);
    const errorColor = coerceCssColor(appTheme?.errorColor);
    const warningColor = coerceCssColor(appTheme?.warningColor);

    const theme: Partial<ThemeConfig['token']> = appTheme
      ? {
        ...(isNotNullOrWhiteSpace(primaryColor) ? { colorPrimary: primaryColor, colorLink: primaryColor } : {}),
        ...(isNotNullOrWhiteSpace(infoColor) ? { colorInfo: infoColor } : {}),
        ...(isNotNullOrWhiteSpace(successColor) ? { colorSuccess: successColor } : {}),
        ...(isNotNullOrWhiteSpace(errorColor) ? { colorError: errorColor } : {}),
        ...(isNotNullOrWhiteSpace(warningColor) ? { colorWarning: warningColor } : {}),
      }
      : {};

    const result: ThemeConfig = {
      cssVar: {
        prefix: 'ant',
      },
      token: { ...themeDefaults, ...theme },
      components: {
        Menu: {
          itemHeight: 'clamp(40px, 40px, 100%)',
        },
      },
    };
    return result;
  }, [state.theme]);

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider
        value={{
          changeTheme,
          resetToApplicationTheme,
          getComponentStyle,
          getComponentGroupStyle,
        }}
      >
        <ConfigProvider
          prefixCls={prefixCls}
          iconPrefixCls={iconPrefixCls}
          theme={{
            ...themeConfig,
            token: { ...themeConfig.token },
            components: {
              ...themeConfig.components,
              Tabs: {
                zIndexPopup: 2000,
              },
            },
          }}
          form={{
            // override required mark position
            requiredMark: defaultRequiredMark,
          }}
          getPopupContainer={(triggerNode) => {
            // Check if trigger is inside the canvas designer
            if (triggerNode) {
              const isInCanvas = triggerNode.closest('.designer-canvas');
              if (isInCanvas) {
                // Use dedicated canvas popup container (inherits zoom)
                const canvasPopupContainer = document.getElementById('canvas-popup-container');
                if (canvasPopupContainer) {
                  return canvasPopupContainer;
                }
              }
            }
            // Default: render to body (for toolbar, sidebars, etc.)
            return document.body;
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
      </UiActionsContext.Provider>
    </UiStateContext.Provider>
  );
};

function useThemeState(): IThemeStateContext {
  const context = useContext(UiStateContext);

  if (context === undefined) {
    throw new Error('useUiState must be used within a UiProvider');
  }
  return context;
}

function useThemeActions(): IThemeActionsContext {
  const context = useContext(UiActionsContext);

  if (context === undefined) {
    throw new Error('useUiActions must be used within a UiProvider');
  }

  return context;
}

function useTheme(): IThemeStateContext & IThemeActionsContext {
  return { ...useThemeState(), ...useThemeActions() };
}

export { ThemeProvider, useTheme, useThemeActions, useThemeState, type IConfigurableTheme };
