import { ConfigProvider } from 'antd';
import { CSSProperties, FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { IConfigurableTheme, IThemeActionsContext, IThemeStateContext, ThemeComponentGroup, UiActionsContext, UiStateContext } from '@/providers/theme/contexts';
import { useThemeActions, useThemeState } from '@/providers/theme';
import { getThemeFontStack, THEME_FONT_VAR } from '@/designer-components/_settings/utils/font/utils';
import { ensureWebFontLoaded } from '@/designer-components/_settings/utils/font/webFonts';

export interface IPreviewThemeProviderProps {
  /** The theme being edited, unsaved changes included. */
  theme: IConfigurableTheme;
}

/**
 * Gives a preview the theme being edited instead of the application's: `useThemeState()`/`useTheme()`,
 * the component and group style getters, and the font token all follow it, so unsaved styles and fonts
 * show straight away - including the layout a form inherits from the theme (see `resolveFormLayout`).
 */
export const PreviewThemeProvider: FC<PropsWithChildren<IPreviewThemeProviderProps>> = ({ theme, children }) => {
  const parentState = useThemeState();
  const parentActions = useThemeActions();

  const state = useMemo<IThemeStateContext>(() => ({ ...parentState, theme }), [parentState, theme]);

  const getComponentStyle = useCallback((componentName: string) => theme.components?.[componentName] ?? {}, [theme.components]);
  const getComponentGroupStyle = useCallback(
    (group: ThemeComponentGroup | undefined) => (group ? theme.componentGroups?.[group] ?? {} : {}),
    [theme.componentGroups],
  );
  const actions = useMemo<IThemeActionsContext>(
    () => ({ ...parentActions, getComponentStyle, getComponentGroupStyle }),
    [parentActions, getComponentStyle, getComponentGroupStyle],
  );

  // Font token scoped to the preview: the variable on a wrapper (components on the default font reference it)
  // and Ant Design's own font token.
  const fontFamily = useMemo(() => getThemeFontStack(theme.fontFamily), [theme.fontFamily]);
  useEffect(() => {
    ensureWebFontLoaded(fontFamily);
  }, [fontFamily]);
  const fontStyle = useMemo(() => ({ display: 'contents', [THEME_FONT_VAR]: fontFamily }) as CSSProperties, [fontFamily]);

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider value={actions}>
        <ConfigProvider theme={{ token: { fontFamily } }}>
          <div style={fontStyle}>
            {children}
          </div>
        </ConfigProvider>
      </UiActionsContext.Provider>
    </UiStateContext.Provider>
  );
};
