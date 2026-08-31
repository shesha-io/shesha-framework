import { describe, expect, it } from 'vitest';
import { MAX_DIMENSION_PERCENT, boundWidth, boundWidthToCanvas, exceedsWidth, getDimensionsStyle } from '../utils';

describe('boundWidth', () => {
  it('overrides a percentage wider than the container', () => {
    expect(boundWidth('200%')).toBe('100%');
    expect(boundWidth('101%')).toBe('100%');
    expect(boundWidth('9999%')).toBe('100%');
    expect(boundWidth(' 150 % ')).toBe('100%');
    // Strictly over the container: 100.5% overflows it just as 200% does.
    expect(boundWidth('100.5%')).toBe('100%');
  });

  it('overrides a vw width over the canvas, which vw resolves against', () => {
    expect(boundWidth('200vw')).toBe('100vw');
    expect(boundWidth('101VW')).toBe('100vw');
    expect(boundWidth(' 150 vw ')).toBe('100vw');
  });

  it('leaves a width within the container alone', () => {
    expect(boundWidth('100%')).toBe('100%');
    expect(boundWidth('50%')).toBe('50%');
    expect(boundWidth('33.5%')).toBe('33.5%');
    expect(boundWidth('0%')).toBe('0%');
    expect(boundWidth('100vw')).toBe('100vw');
    expect(boundWidth('50vw')).toBe('50vw');
  });

  it('leaves values it cannot judge without the canvas width or a font size untouched', () => {
    // An absolute length needs the canvas to compare against - see boundWidthToCanvas. A keyword,
    // a calc() and a font-relative unit cannot be judged here at all.
    expect(boundWidth('2000px')).toBe('2000px');
    expect(boundWidth('max-content')).toBe('max-content');
    expect(boundWidth('auto')).toBe('auto');
    expect(boundWidth('calc(200% - 10px)')).toBe('calc(200% - 10px)');
    expect(boundWidth('500em')).toBe('500em');
    expect(boundWidth('50rem')).toBe('50rem');
    expect(boundWidth(2000)).toBe(2000);
  });
});

describe('boundWidthToCanvas', () => {
  it('overrides an absolute width wider than the canvas', () => {
    expect(boundWidthToCanvas('2000px', '1157px')).toBe('1157px');
    expect(boundWidthToCanvas('5000px', '1024px')).toBe('1024px');
    // Absolute units convert to px exactly, so they can be compared too. 20in = 1920px.
    expect(boundWidthToCanvas('20in', '1024px')).toBe('1024px');
    expect(boundWidthToCanvas('100cm', '1024px')).toBe('1024px');
    expect(boundWidthToCanvas('2000pt', '1024px')).toBe('1024px');
  });

  it('leaves an absolute width that fits the canvas exactly as entered', () => {
    expect(boundWidthToCanvas('800px', '1157px')).toBe('800px');
    expect(boundWidthToCanvas('1157px', '1157px')).toBe('1157px');
    expect(boundWidthToCanvas('5in', '1024px')).toBe('5in');
  });

  it('still applies the relative bounds', () => {
    expect(boundWidthToCanvas('200%', '1157px')).toBe('100%');
    expect(boundWidthToCanvas('200vw', '1157px')).toBe('100vw');
  });

  it('cannot judge an absolute width without a usable canvas width, so leaves it alone', () => {
    expect(boundWidthToCanvas('2000px', undefined)).toBe('2000px');
    expect(boundWidthToCanvas('2000px', 'auto')).toBe('2000px');
    expect(boundWidthToCanvas('2000px', '0px')).toBe('2000px');
    // A font-relative width stays untouched even with the canvas known - no resolved font size.
    expect(boundWidthToCanvas('500em', '1157px')).toBe('500em');
  });
});

describe('exceedsWidth', () => {
  it('reports only the values that would be overridden', () => {
    expect(exceedsWidth('200%')).toBe(true);
    expect(exceedsWidth('200vw')).toBe(true);
    expect(exceedsWidth('100%')).toBe(false);
    expect(exceedsWidth('50%')).toBe(false);
    expect(exceedsWidth(undefined)).toBe(false);
  });

  it('reports an absolute width only when the canvas width makes it judgeable', () => {
    expect(exceedsWidth('2000px')).toBe(false);
    expect(exceedsWidth('2000px', '1157px')).toBe(true);
    expect(exceedsWidth('800px', '1157px')).toBe(false);
  });
});


describe('getDimensionsStyle', () => {
  it('bounds every width axis so none can overflow the container', () => {
    const style = getDimensionsStyle({ width: '200%', minWidth: '300%', maxWidth: '400%' });

    expect(style.width).toBe(`${MAX_DIMENSION_PERCENT}%`);
    expect(style.minWidth).toBe(`${MAX_DIMENSION_PERCENT}%`);
    expect(style.maxWidth).toBe(`${MAX_DIMENSION_PERCENT}%`);
  });

  it('bounds a width already saved in a form before the bound existed', () => {
    expect(getDimensionsStyle({ width: '200%' }).width).toBe('100%');
  });

  it('leaves widths within the container as they were', () => {
    const style = getDimensionsStyle({ width: '80%', minWidth: '10px', maxWidth: 'max-content' });

    expect(style.width).toBe('80%');
    expect(style.minWidth).toBe('10px');
    expect(style.maxWidth).toBe('max-content');
  });

  it('does not bound heights - a different axis, and 100vh is the reported case there', () => {
    const style = getDimensionsStyle({ height: '200%', minHeight: '300%' });

    expect(style.height).toBe('200%');
    expect(style.minHeight).toBe('300%');
  });

  it('still resolves vw against the canvas after bounding', () => {
    expect(getDimensionsStyle({ width: '50vw' }, '1024px').width).toBe('calc((50 * 1024px) / 100)');
  });

  it('bounds an over-wide vw width before resolving it against the canvas', () => {
    expect(getDimensionsStyle({ width: '200vw' }, '1024px').width).toBe('calc((100 * 1024px) / 100)');
  });

  it('bounds an absolute width against the canvas once the canvas width is known', () => {
    expect(getDimensionsStyle({ width: '2000px' }, '1024px').width).toBe('1024px');
    expect(getDimensionsStyle({ width: '800px' }, '1024px').width).toBe('800px');
    // Without a canvas width there is nothing to compare against, so it is left as entered.
    expect(getDimensionsStyle({ width: '2000px' }).width).toBe('2000px');
  });
});

describe('full-viewport heights on the designer canvas', () => {
  it('takes the allowance off an exact 100vh', () => {
    expect(getDimensionsStyle({ height: '100vh' }).height).toBe('80vh');
    expect(getDimensionsStyle({ minHeight: '100vh' }).minHeight).toBe('80vh');
    expect(getDimensionsStyle({ maxHeight: '100vh' }).maxHeight).toBe('80vh');
  });

  it('leaves any other height alone', () => {
    // Only the value meaning "as tall as the screen" is adjusted; the rest are deliberate sizes.
    expect(getDimensionsStyle({ height: '50vh' }).height).toBe('50vh');
    expect(getDimensionsStyle({ height: '120vh' }).height).toBe('120vh');
    expect(getDimensionsStyle({ height: '800px' }).height).toBe('800px');
    expect(getDimensionsStyle({ height: 'auto' }).height).toBe('auto');
    expect(getDimensionsStyle({ height: 'calc(100vh - 10px)' }).height).toBe('calc(100vh - 10px)');
  });

  it('does not touch widths', () => {
    expect(getDimensionsStyle({ width: '100vw' }).width).toBe('100vw');
  });
});
