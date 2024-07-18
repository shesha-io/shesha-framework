import { App, ConfigProvider, ThemeConfig } from 'antd';
import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from 'react';
import { THEME_CONFIG_NAME } from '@/shesha-constants';
import { useDebouncedCallback } from 'use-debounce';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { setThemeAction } from './actions';
import { IConfigurableTheme, THEME_CONTEXT_INITIAL_STATE, UiActionsContext, UiStateContext } from './contexts';
import { uiReducer } from './reducer';
import { defaultRequiredMark } from './shaRequiredMark';

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

  const { getComponent, updateComponent } = useConfigurationItemsLoader();

  // fetch theme
  useEffect(() => {
    const promisedTheme = getComponent({ name: THEME_CONFIG_NAME, isApplicationSpecific: true, skipCache: false });
    promisedTheme.promise.then((data) => {
      const theme = data?.settings as IConfigurableTheme;
      if (theme) dispatch(setThemeAction(theme));
    });
  }, []);

  const debouncedSave = useDebouncedCallback((themeToSave) => {
    updateComponent({ name: THEME_CONFIG_NAME, isApplicationSpecific: true, settings: themeToSave });
  }, 300);

  const changeTheme = (theme: IConfigurableTheme) => {
    // save theme to the state
    dispatch(setThemeAction(theme));

    // persist theme
    debouncedSave(theme);
  };

  const themeConfig = useMemo<ThemeConfig>(() => {
    const appTheme = state.theme?.application;
    const themeDefaults: ThemeConfig['token'] = {};
    // paddingSM: 4,
    // paddingMD: 8,
    // paddingLG: 12,

    const theme: ThemeConfig['token'] = appTheme
      ? {
        colorPrimary: appTheme.primaryColor,
        colorLink: appTheme.primaryColor,
        colorInfo: appTheme.infoColor,
        colorSuccess: appTheme.successColor,
        colorError: appTheme.errorColor,
        colorWarning: appTheme.warningColor,
        borderRadius: state?.theme?.border?.borderRadius
      }
      : {};

    const result: ThemeConfig = {
      cssVar: true,
      token: { ...themeDefaults, ...theme },
    };
    return result;
  }, [state.theme]);

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider
        value={{
          changeTheme,
        }}
      >
        <ConfigProvider
          prefixCls={prefixCls}
          iconPrefixCls={iconPrefixCls}
          theme={themeConfig}
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
