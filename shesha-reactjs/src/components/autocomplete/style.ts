import { createStyles } from '@/styles';
import { fontStyles, splitTextProperties } from '@/designer-components/_common/styles/utils';
import { IStyleValue } from '@/providers/form/models';

/**
 * Styles for the autocomplete control itself.
 *
 * Takes the Appearance model rather than a flat `CSSProperties`: the caller passes `styleValue`, so
 * the font settings live under `font.*` (`font.color`, `font.size`, …) and are emitted through the
 * shared builders. Reading them as flat CSS keys — the previous shape — silently matched nothing.
 *
 * The Appearance box (border, background, shadow, dimensions, padding) is emitted by the designer
 * component's own `styles.ts` and arrives as `className`, so it is deliberately not repeated here;
 * this hook only covers what the control needs on top of that.
 */
export const useStyles = createStyles(({ css, cx, token }, model: IStyleValue | undefined) => {
  const { width: _w, height: _h, ...popupCustomStyle } = model?.styleCss ?? {};
  const { text: customTextStyle } = splitTextProperties(popupCustomStyle);

  const autocomplete = cx("sha-autocomplete", css``);

  /* Shown in place of the control while the list loads, so it restates the configured font to keep
     the same text metrics and avoid a visible jump when the real control replaces it. */
  const loadingSpinner = cx("sha-autocomplete-loading", css`
    display: flex;
    align-items: center;
    min-height: 32px;
    border-radius: ${token.borderRadius}px;
    padding: 4px 11px;
    font-size: ${token.fontSize}px;
    font-family: ${token.fontFamily};
    color: ${token.colorText};
    ${fontStyles(model?.font, customTextStyle)}

    &:hover {
      border-color: ${token.colorPrimaryHover};
    }
  `);

  const loadingText = cx("sha-autocomplete-loading-text", css`
    margin-left: 8px;
    color: ${token.colorTextSecondary};
  `);

  return {
    autocomplete,
    loadingSpinner,
    loadingText,
  };
});
