import { describe, expect, it } from 'vitest';
import { dimensionsStyles } from '../utils';

describe('dimensionsStyles - the CSS-string path used by the container component', () => {
  it('bounds every width axis, as getDimensionsStyle does', () => {
    const css = dimensionsStyles({ width: '200%', minWidth: '300%', maxWidth: '400%' });

    expect(css).toContain('width: 100%;');
    expect(css).toContain('min-width: 100%;');
    expect(css).toContain('max-width: 100%;');
  });

  it('leaves vw alone - it is viewport-relative until something rewrites it against a canvas', () => {
    // Clamping to 100vw here would neither fit a canvas narrower than the viewport nor respect a
    // deliberate wide scroller on a rendered page, where there is no canvas at all.
    expect(dimensionsStyles({ width: '200vw' })).toContain('width: 200vw;');
  });

  it('leaves a width within the container as it was', () => {
    const css = dimensionsStyles({ width: '80%', minWidth: '10px', maxWidth: 'max-content' });

    expect(css).toContain('width: 80%;');
    expect(css).toContain('min-width: 10px;');
    expect(css).toContain('max-width: max-content;');
  });

  it('cannot judge an absolute width here - no canvas width reaches this path', () => {
    expect(dimensionsStyles({ width: '2000px' })).toContain('width: 2000px;');
  });

  it('leaves a viewport height alone with no canvas - a rendered page is the real viewport', () => {
    expect(dimensionsStyles({ height: '100vh' })).toContain('height: 100vh;');
    expect(dimensionsStyles({ minHeight: '100vh' })).toContain('min-height: 100vh;');
    expect(dimensionsStyles({ maxHeight: '100vh' })).toContain('max-height: 100vh;');
  });

  it('resolves a viewport height against the canvas the container is sitting on', () => {
    expect(dimensionsStyles({ height: '100vh' }, '820px')).toContain('height: calc((100 * 820px) / 100);');
    expect(dimensionsStyles({ minHeight: '99vh' }, '820px')).toContain('min-height: calc((99 * 820px) / 100);');
  });

  it('leaves a height that is not in vh alone on the canvas', () => {
    expect(dimensionsStyles({ height: '800px' }, '820px')).toContain('height: 800px;');
    expect(dimensionsStyles({ height: 'auto' }, '820px')).toContain('height: auto;');
  });
});
