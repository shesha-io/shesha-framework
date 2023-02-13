import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { uiReducer } from './reducer';
import {
  setThemeAction,
} from './actions';
import { UiActionsContext, UiStateContext, THEME_CONTEXT_INITIAL_STATE, IApplicationTheme } from './contexts';
import { ConfigProvider } from 'antd';
import { THEME_CONFIG_NAME } from '../../constants';
import { useDebouncedCallback } from 'use-debounce';
import { useConfigurationItemsLoader } from '../configurationItemsLoader';

export interface ThemeProviderProps {
  prefixCls?: string;
  iconPrefixCls?: string;
  themeConfigKey?: string;
}

const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  iconPrefixCls,

  // TODO: Later this to be configurable so that. Currently if you change it the layout fails because the styling references the `--ant prefixCls`
  prefixCls = 'ant',
}) => {
  const [state, dispatch] = useReducer(uiReducer, THEME_CONTEXT_INITIAL_STATE);

  const { getComponent, updateComponent } = useConfigurationItemsLoader();

  // fetch theme
  useEffect(() => {
    const promisedTheme = getComponent({ name: THEME_CONFIG_NAME, isApplicationSpecific: true, skipCache: false });
    promisedTheme.promise.then(data => {
      const theme = data?.settings as IApplicationTheme;
      if (theme)
        dispatch(setThemeAction(theme));
    });
  }, []);

  const debouncedSave = useDebouncedCallback(themeToSave => {
    updateComponent({ name: THEME_CONFIG_NAME, isApplicationSpecific: true, settings: themeToSave });
  }, 300);

  useEffect(() => {
    // apply theme
    ConfigProvider.config({
      prefixCls,
      theme: state?.theme?.application,
      iconPrefixCls,
    });
  }, [state?.theme]);

  const changeTheme = (theme: IApplicationTheme) => {
    // save theme to the state
    dispatch(setThemeAction(theme));

    // persist theme
    debouncedSave(theme);
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */
  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider
        value={{
          changeTheme,

          /* NEW_ACTION_GOES_HERE */
        }}
      >
        <ConfigProvider prefixCls={prefixCls}>{children}</ConfigProvider>
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

export { ThemeProvider, useThemeState, useThemeActions, useTheme };
