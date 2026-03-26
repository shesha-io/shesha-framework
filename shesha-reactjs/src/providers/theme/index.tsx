import { App, ConfigProvider, ThemeConfig } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { IConfigurableTheme, IThemeActionsContext, IThemeStateContext, THEME_CONTEXT_INITIAL_STATE, UiActionsContext, UiStateContext } from './contexts';
import { defaultRequiredMark } from './shaRequiredMark';
import { useSettings, useSheshaApplication } from '..';
import { isDefined } from '@/utils/nullables';

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

  const applicationTheme = useRef<IConfigurableTheme>();

  const settings = useSettings();
  const application = useSheshaApplication();
  application.registerInitialization('theme', async () => {
    // load theme settings
    const theme = await settings.getSetting<IConfigurableTheme>({ module: 'Shesha', name: 'Shesha.ThemeSettings' });
    setState((prev) => ({ ...prev, theme: theme }));
    applicationTheme.current = theme;
  });

  const changeTheme = useCallback((theme: IConfigurableTheme, isApplication: boolean = false) => {
    // save theme to the state
    setState((prev) => ({ ...prev, theme: theme }));
    if (isApplication)
      applicationTheme.current = theme;
  }, [applicationTheme]);

  const resetToApplicationTheme = useCallback(() => {
    // save theme to the state
    if (isDefined(applicationTheme.current))
      setState((prev) => ({ ...prev, theme: applicationTheme.current }));
  }, []);

  const themeConfig = useMemo<ThemeConfig>(() => {
    const appTheme = state.theme?.application;
    const themeDefaults: ThemeConfig['token'] = {};

    const theme: Partial<ThemeConfig['token']> = appTheme
      ? {
        ...(appTheme.primaryColor ? { colorPrimary: appTheme.primaryColor, colorLink: appTheme.primaryColor } : {}),
        ...(appTheme.infoColor ? { colorInfo: appTheme.infoColor } : {}),
        ...(appTheme.successColor ? { colorSuccess: appTheme.successColor } : {}),
        ...(appTheme.errorColor ? { colorError: appTheme.errorColor } : {}),
        ...(appTheme.warningColor ? { colorWarning: appTheme.warningColor } : {}),
      }
      : {};

    const result: ThemeConfig = {
      cssVar: true,
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

function useTheme(): IThemeStateContext & IThemeActionsContext | undefined {
  return { ...useThemeState(), ...useThemeActions() };
}

export { ThemeProvider, useTheme, useThemeActions, useThemeState, type IConfigurableTheme };
