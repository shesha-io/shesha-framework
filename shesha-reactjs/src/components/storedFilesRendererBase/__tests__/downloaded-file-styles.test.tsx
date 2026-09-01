import { renderHook } from '@testing-library/react';
import { useStyles } from '../styles/styles';

/**
 * The Downloaded Files set and the root Font both style the file name, and they have to be styled
 * through the same selectors: antd puts its own colour and font on the Typography element, so
 * neither can be left to inherit from an ancestor. That makes the two rules a specificity tie, which
 * source order alone decided — and the root Font is emitted later, so it silently won every property
 * it declared. The set was reported twice as "only the colour works": the root Font declares size,
 * weight, family and align and overrode all four, and colour got through only while the root Font
 * defaulted to carrying none.
 *
 * These read the resolved cascade rather than the emitted text, because the text was never the
 * problem — both rules were always emitted correctly.
 */
describe('Downloaded Files styling', () => {
  const ROOT_FONT = { type: 'Segoe UI', size: 14, weight: '400', align: 'left', color: 'rgb(17, 17, 17)' } as const;

  const renderName = (downloadedFileStyles: React.CSSProperties): CSSStyleDeclaration => {
    const { result } = renderHook(() => useStyles({
      model: { listType: 'text', layout: false, hasFiles: true, font: { ...ROOT_FONT } },
      downloadedFileStyles,
    }));

    const s = result.current.styles;
    /* The nesting the renderer produces: the container, the row wrapper carrying the downloaded
       class, the two file-name divs, and antd's Typography element holding the text. */
    document.body.innerHTML = `
      <div class="${s.shaStoredFilesRenderer}">
        <div class="${s.shaFileNameWrapper} ${s.downloadedFile}">
          <div class="${s.shaItemFileName}">
            <div class="${s.shaItemFileName}">
              <span id="target" class="ant-typography">file.pdf</span>
            </div>
          </div>
        </div>
      </div>`;

    return getComputedStyle(document.getElementById('target')!);
  };

  it('overrides the root Font on a downloaded file', () => {
    const computed = renderName({
      color: 'rgb(1, 2, 3)',
      fontSize: '27px',
      fontWeight: '700',
      fontFamily: 'Comic Sans MS',
    });

    expect(computed.color).toBe('rgb(1, 2, 3)');
    expect(computed.fontSize).toBe('27px');
    expect(computed.fontWeight).toBe('700');
    // jsdom normalises a family containing spaces to a quoted string.
    expect(computed.fontFamily.replace(/"/g, '')).toBe('Comic Sans MS');
  });

  it('leaves the root Font in place for the properties it does not set', () => {
    const computed = renderName({ color: 'rgb(1, 2, 3)' });

    expect(computed.color).toBe('rgb(1, 2, 3)');
    expect(computed.fontSize).toBe('14px');
    expect(computed.fontWeight).toBe('400');
  });
});
