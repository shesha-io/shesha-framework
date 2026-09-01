import { describe, expect, it } from 'vitest';
import { dimensionsStyles } from '../utils';

describe('dimensionsStyles - the CSS-string path used by the container component', () => {
  it('bounds every width axis on the canvas, as getDimensionsStyle does', () => {
    const css = dimensionsStyles({ width: '200%', minWidth: '300%', maxWidth: '400%' }, '1024px');

    expect(css).toContain('width: 100%;');
    expect(css).toContain('min-width: 100%;');
    expect(css).toContain('max-width: 100%;');
  });

  it('leaves an over-wide width alone on a rendered page, where nothing is judging it', () => {
    expect(dimensionsStyles({ width: '200vw' })).toContain('width: 200vw;');
    expect(dimensionsStyles({ width: '200%' })).toContain('width: 200%;');
    expect(dimensionsStyles({ width: '2000px' })).toContain('width: 2000px;');
  });

  it('resolves vw against the canvas, so a container width matches its height axis', () => {
    expect(dimensionsStyles({ width: '50vw' }, '1024px')).toContain('width: calc((50 * 1024px) / 100);');
  });

  it('leaves a width within the container as it was', () => {
    const css = dimensionsStyles({ width: '80%', minWidth: '10px', maxWidth: 'max-content' }, '1024px');

    expect(css).toContain('width: 80%;');
    expect(css).toContain('min-width: 10px;');
    expect(css).toContain('max-width: max-content;');
  });

  it('bounds an absolute width against the canvas now that one reaches this path', () => {
    expect(dimensionsStyles({ width: '2000px' }, '1024px')).toContain('width: 1024px;');
  });

  it('leaves a viewport height alone with no canvas - a rendered page is the real viewport', () => {
    expect(dimensionsStyles({ height: '100vh' })).toContain('height: 100vh;');
    expect(dimensionsStyles({ minHeight: '100vh' })).toContain('min-height: 100vh;');
    expect(dimensionsStyles({ maxHeight: '100vh' })).toContain('max-height: 100vh;');
  });

  it('resolves a viewport height against the canvas the container is sitting on', () => {
    expect(dimensionsStyles({ height: '100vh' }, undefined, '820px')).toContain('height: calc((100 * 820px) / 100);');
    expect(dimensionsStyles({ minHeight: '99vh' }, undefined, '820px')).toContain('min-height: calc((99 * 820px) / 100);');
  });

  it('leaves a height that is not in vh alone on the canvas', () => {
    expect(dimensionsStyles({ height: '800px' }, undefined, '820px')).toContain('height: 800px;');
    expect(dimensionsStyles({ height: 'auto' }, undefined, '820px')).toContain('height: auto;');
  });
});
