import { App, ConfigProvider, ThemeConfig } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import { setThemeAction } from './actions';
import { IConfigurableTheme, THEME_CONTEXT_INITIAL_STATE, UiActionsContext, UiStateContext } from './contexts';
import { uiReducer } from './reducer';
import { defaultRequiredMark } from './shaRequiredMark';
import { useSettings, useSheshaApplication } from '..';

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
  const [state, dispatch] = useReducer(uiReducer, {
    ...THEME_CONTEXT_INITIAL_STATE,
    prefixCls: prefixCls,
    iconPrefixCls: iconPrefixCls,
  });

  const applicationTheme = useRef<IConfigurableTheme>();

  const settings = useSettings();
  const application = useSheshaApplication();
  application.registerInitialization('theme', async () => {
    // load theme settings
    const theme = await settings.getSetting({ module: 'Shesha', name: 'Shesha.ThemeSettings' }) as IConfigurableTheme;
    dispatch(setThemeAction(theme));
    applicationTheme.current = theme;
  });

  const changeTheme = useCallback((theme: IConfigurableTheme, isApplication: boolean = false) => {
    // save theme to the state
    dispatch(setThemeAction(theme));
    if (isApplication)
      applicationTheme.current = theme;
  }, [dispatch, applicationTheme]);

  const resetToApplicationTheme =  useCallback(() => {
    // save theme to the state
    dispatch(setThemeAction(applicationTheme.current));
  }, [dispatch]);

  const themeConfig = useMemo<ThemeConfig>(() => {
    const appTheme = state.theme?.application;
    const themeDefaults: ThemeConfig['token'] = {};

    const theme: ThemeConfig['token'] = appTheme
      ? {
        colorPrimary: appTheme.primaryColor,
        colorLink: appTheme.primaryColor,
        colorInfo: appTheme.infoColor,
        colorSuccess: appTheme.successColor,
        colorError: appTheme.errorColor,
        colorWarning: appTheme.warningColor,
      }
      : {};

    const result: ThemeConfig = {
      cssVar: true,
      token: { ...themeDefaults, ...theme },
      components: {
        Menu: {
          itemHeight: 'clamp(40px, 40px, 100%)' as any
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
          }}
          form={{
            // override required mark position
            requiredMark: defaultRequiredMark,
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

function useThemeState() {
  const context = useContext(UiStateContext);

  if (context === undefined) {
    throw new Error('useUiState must be used within a UiProvider');
  }
  return context;
}

function useThemeActions() {
  const context = useContext(UiActionsContext);

  if (context === undefined) {
    throw new Error('useUiActions must be used within a UiProvider');
  }

  return context;
}

function useTheme() {
  return { ...useThemeState(), ...useThemeActions() };
}

export { ThemeProvider, useTheme, useThemeActions, useThemeState, type IConfigurableTheme };
