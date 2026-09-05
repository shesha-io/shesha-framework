import { App, ConfigProvider, ThemeConfig, theme as antdTheme } from 'antd';
import { FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import './interFont.generated.css';
import './baseFont.css';
import { ColorScheme, IConfigurableTheme, IThemeActionsContext, IThemeStateContext, ResolvedTheme, THEME_CONTEXT_INITIAL_STATE, UiActionsContext, UiStateContext } from './contexts';
import { useResolvedTheme } from './useResolvedTheme';
import { defaultRequiredMark } from './shaRequiredMark';
import { useSettings, useSheshaApplication } from '..';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

export interface ThemeProviderProps {
  prefixCls?: string;
  iconPrefixCls?: string;
  themeConfigKey?: string;
}

// Bundled and self-hosted (not a system font) so the default look is identical on every OS,
// instead of resolving to whatever native UI font each OS happens to ship.
const DEFAULT_FONT_FAMILY = "'Inter Variable', sans-serif";

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

  const getComponentStyle = useCallback((componentName: string) => state.theme.components?.[componentName] ?? {}, [state.theme.components]);

  // 'system' follows the OS preference and re-resolves when the user flips it.
  const resolvedTheme = useResolvedTheme(state.theme.sidebar);
  const isDark = resolvedTheme === 'dark';

  const stateWithResolvedTheme = useMemo<IThemeStateContext>(
    () => ({ ...state, resolvedTheme }),
    [state, resolvedTheme],
  );

  const themeConfig = useMemo<ThemeConfig>(() => {
    const appTheme = state.theme.application;
    const themeDefaults: ThemeConfig['token'] = {};

    const theme: Partial<ThemeConfig['token']> = appTheme
      ? {
        ...(isNotNullOrWhiteSpace(appTheme.primaryColor) ? { colorPrimary: appTheme.primaryColor, colorLink: appTheme.primaryColor } : {}),
        ...(isNotNullOrWhiteSpace(appTheme.infoColor) ? { colorInfo: appTheme.infoColor } : {}),
        ...(isNotNullOrWhiteSpace(appTheme.successColor) ? { colorSuccess: appTheme.successColor } : {}),
        ...(isNotNullOrWhiteSpace(appTheme.errorColor) ? { colorError: appTheme.errorColor } : {}),
        ...(isNotNullOrWhiteSpace(appTheme.warningColor) ? { colorWarning: appTheme.warningColor } : {}),
      }
      : {};

    const result: ThemeConfig = {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      cssVar: {
        prefix: 'ant',
      },
      token: {
        ...themeDefaults,
        ...theme,
        fontFamily: DEFAULT_FONT_FAMILY,
      },
      components: {
        Menu: {
          itemHeight: 'clamp(40px, 40px, 100%)',
        },
      },
    };
    return result;
  }, [state.theme, isDark]);

  return (
    <UiStateContext.Provider value={stateWithResolvedTheme}>
      <UiActionsContext.Provider
        value={{
          changeTheme,
          resetToApplicationTheme,
          getComponentStyle,
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

export {
  ThemeProvider,
  useTheme,
  useThemeActions,
  useThemeState,
  useResolvedTheme,
  type IConfigurableTheme,
  type ColorScheme,
  type ResolvedTheme,
};
