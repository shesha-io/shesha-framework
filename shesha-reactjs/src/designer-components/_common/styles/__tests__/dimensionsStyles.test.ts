import { describe, expect, it } from 'vitest';
import { dimensionsStyles } from '../utils';

describe('dimensionsStyles - the CSS-string path used by the container component', () => {
  it('bounds every width axis, as getDimensionsStyle does', () => {
    const css = dimensionsStyles({ width: '200%', minWidth: '300%', maxWidth: '400%' });

    expect(css).toContain('width: 100%;');
    expect(css).toContain('min-width: 100%;');
    expect(css).toContain('max-width: 100%;');
  });

  it('bounds a vw width over the canvas', () => {
    expect(dimensionsStyles({ width: '200vw' })).toContain('width: 100vw;');
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

  it('still takes the allowance off an exact 100vh height', () => {
    expect(dimensionsStyles({ height: '100vh' })).toContain('height: 80vh;');
  });
});
