import { describe, expect, it } from 'vitest';
import { MAX_DIMENSION_PERCENT, boundWidthPercent, exceedsWidthPercent, getDimensionsStyle } from '../utils';

describe('boundWidthPercent', () => {
  it('overrides a percentage wider than the container', () => {
    expect(boundWidthPercent('200%')).toBe('100%');
    expect(boundWidthPercent('101%')).toBe('100%');
    expect(boundWidthPercent('9999%')).toBe('100%');
    expect(boundWidthPercent(' 150 % ')).toBe('100%');
    // Strictly over the container: 100.5% overflows it just as 200% does.
    expect(boundWidthPercent('100.5%')).toBe('100%');
  });

  it('leaves a percentage within the container alone', () => {
    expect(boundWidthPercent('100%')).toBe('100%');
    expect(boundWidthPercent('50%')).toBe('50%');
    expect(boundWidthPercent('33.5%')).toBe('33.5%');
    expect(boundWidthPercent('0%')).toBe('0%');
  });

  it('leaves anything that is not a plain percentage untouched', () => {
    // A length, a keyword, a calc() and a viewport unit either do not resolve against the container
    // or cannot be bounded without evaluating them.
    expect(boundWidthPercent('2000px')).toBe('2000px');
    expect(boundWidthPercent('max-content')).toBe('max-content');
    expect(boundWidthPercent('auto')).toBe('auto');
    expect(boundWidthPercent('calc(200% - 10px)')).toBe('calc(200% - 10px)');
    expect(boundWidthPercent('200vw')).toBe('200vw');
    expect(boundWidthPercent(2000)).toBe(2000);
  });
});

describe('exceedsWidthPercent', () => {
  it('reports only the values that would be overridden', () => {
    expect(exceedsWidthPercent('200%')).toBe(true);
    expect(exceedsWidthPercent('100%')).toBe(false);
    expect(exceedsWidthPercent('50%')).toBe(false);
    expect(exceedsWidthPercent('2000px')).toBe(false);
    expect(exceedsWidthPercent(undefined)).toBe(false);
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
