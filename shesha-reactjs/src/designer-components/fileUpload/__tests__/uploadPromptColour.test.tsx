import { renderHook } from '@testing-library/react';
import { useStyles as useComponentStyles } from '@/components/fileUpload/styles/styles';
import { useStyles as useFieldStyles } from '../styles';
import { IFileUploadProps } from '../interfaces';

/**
 * The configured Font colour reaches the upload prompt through the field's own class, which restates
 * it on `.ant-btn-link` because antd colours the button itself. The renderer inside also had a say on
 * `.ant-btn`, with `!important` — which no specificity can outrank — so the prompt stayed the theme's
 * primary colour whatever the Font panel said.
 *
 * Read as a resolved cascade across both classes, rather than as emitted text: both rules were always
 * emitted, and which one landed was the whole question.
 */
describe('upload prompt colour', () => {
  const FONT_COLOUR = 'rgb(200, 30, 90)';

  const promptColour = (styleCss?: React.CSSProperties): string => {
    const field = renderHook(() => useFieldStyles({
      listType: 'text',
      font: { type: 'Segoe UI', size: 14, weight: '400', align: 'left', color: FONT_COLOUR },
      ...(styleCss ? { styleCss } : {}),
    } as IFileUploadProps)).result.current.styles;

    const component = renderHook(() => useComponentStyles({
      style: styleCss,
      model: { layout: false, isDragger: false, hideFileName: false, listType: 'text' },
    })).result.current.styles;

    /* The nesting the field renders: its own class outside, the renderer's span inside, and antd's
       link button holding the prompt. */
    document.body.innerHTML = `
      <div class="${field.fileUpload}">
        <span class="${component.shaStoredFilesRenderer}">
          <button id="prompt" class="ant-btn ant-btn-link" type="button">(press to upload)</button>
        </span>
      </div>`;

    return getComputedStyle(document.getElementById('prompt')!).color;
  };

  it('takes the configured Font colour', () => {
    expect(promptColour()).toBe(FONT_COLOUR);
  });

  /* A Custom style is the one case the renderer still states a colour, and it is meant to win — the
     same precedence every other style set here uses. */
  it('lets a Custom style override the Font colour', () => {
    expect(promptColour({ color: 'rgb(1, 2, 3)' })).toBe('rgb(1, 2, 3)');
  });

  /* A Custom style counts as provided whatever it sets, so gating the colour on "a style exists"
     rather than "a colour is set" left the fallback overriding the Font colour again the moment any
     other property was configured. */
  it('keeps the Font colour when a Custom style sets something other than colour', () => {
    expect(promptColour({ backgroundColor: 'rgb(9, 9, 9)' })).toBe(FONT_COLOUR);
  });
});
