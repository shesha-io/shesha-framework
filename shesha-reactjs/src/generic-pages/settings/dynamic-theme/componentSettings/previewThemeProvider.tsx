import { ConfigProvider } from 'antd';
import { CSSProperties, FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import { IConfigurableTheme, IThemeActionsContext, IThemeStateContext, ThemeComponentGroup, UiActionsContext, UiStateContext } from '@/providers/theme/contexts';
import { useThemeActions, useThemeState } from '@/providers/theme';
import { getThemeFontStack, THEME_FONT_VAR } from '@/designer-components/_settings/utils/font/utils';
import { ensureWebFontLoaded } from '@/designer-components/_settings/utils/font/webFonts';
import { getApplicationColorTokens } from '@/providers/theme/tokens';

export interface IPreviewThemeProviderProps {
  /** The theme being edited, unsaved changes included. */
  theme: IConfigurableTheme;
}

/**
 * Gives a preview the theme being edited instead of the application's: `useThemeState()`/`useTheme()`,
 * the component and group style getters, the Ant Design colour tokens and the font token all follow it,
 * so unsaved styles, colours and fonts show straight away - including the layout a form inherits from the
 * theme (see `resolveFormLayout`). The colour scheme is left alone: configured forms always render light.
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
  const fontStyle = useMemo(() => ({ position: 'relative', [THEME_FONT_VAR]: fontFamily }) as CSSProperties, [fontFamily]);

  const themeConfig = useMemo(
    () => ({ token: { ...getApplicationColorTokens(theme.application), fontFamily } }),
    [theme.application, fontFamily],
  );

  // Popups (e.g. dropdown options) render inside the wrapper rather than the page body, so they get the
  // preview's font variable too.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const getPopupContainer = useCallback(() => wrapperRef.current ?? document.body, []);

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider value={actions}>
        <ConfigProvider theme={themeConfig} getPopupContainer={getPopupContainer}>
          <div ref={wrapperRef} style={fontStyle}>
            {children}
          </div>
        </ConfigProvider>
      </UiActionsContext.Provider>
    </UiStateContext.Provider>
  );
};
