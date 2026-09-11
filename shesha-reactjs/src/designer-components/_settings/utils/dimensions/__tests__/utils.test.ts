import { MAX_DIMENSION_PERCENT, boundWidth, boundWidthToCanvas, getDimensionsStyle } from '../utils';

describe('boundWidth', () => {
  it('overrides a percentage wider than the container', () => {
    expect(boundWidth('200%')).toBe('100%');
    expect(boundWidth('101%')).toBe('100%');
    expect(boundWidth('9999%')).toBe('100%');
    expect(boundWidth(' 150 % ')).toBe('100%');
    // Strictly over the container: 100.5% overflows it just as 200% does.
    expect(boundWidth('100.5%')).toBe('100%');
  });

  it('leaves a width within the container alone', () => {
    expect(boundWidth('100%')).toBe('100%');
    expect(boundWidth('50%')).toBe('50%');
    expect(boundWidth('33.5%')).toBe('33.5%');
    expect(boundWidth('0%')).toBe('0%');
  });

  it('leaves values it cannot judge without the canvas width or a font size untouched', () => {
    // vw is viewport-relative until getWidthDimension rewrites it against the canvas, and an
    // absolute length needs the canvas to compare against - both are boundWidthToCanvas's job. A
    // keyword, a calc() and a font-relative unit cannot be judged at all.
    expect(boundWidth('200vw')).toBe('200vw');
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

  it('bounds vw, which getWidthDimension rewrites as a fraction of the canvas', () => {
    expect(boundWidthToCanvas('200vw', '1157px')).toBe('100vw');
    expect(boundWidthToCanvas('101VW', '1157px')).toBe('100vw');
    expect(boundWidthToCanvas('50vw', '1157px')).toBe('50vw');
    // Without a canvas nothing rewrites vw, so a deliberate wide scroller is left alone.
    expect(boundWidthToCanvas('200vw', undefined)).toBe('200vw');
  });

  it('still applies the percentage bound', () => {
    expect(boundWidthToCanvas('200%', '1157px')).toBe('100%');
    expect(boundWidthToCanvas('200%', undefined)).toBe('100%');
  });

  it('cannot judge an absolute width without a usable canvas width, so leaves it alone', () => {
    expect(boundWidthToCanvas('2000px', undefined)).toBe('2000px');
    expect(boundWidthToCanvas('2000px', 'auto')).toBe('2000px');
    expect(boundWidthToCanvas('2000px', '0px')).toBe('2000px');
    // A font-relative width stays untouched even with the canvas known - no resolved font size.
    expect(boundWidthToCanvas('500em', '1157px')).toBe('500em');
  });
});

describe('getDimensionsStyle', () => {
  it('bounds every width axis on the canvas so none can overflow it', () => {
    const style = getDimensionsStyle({ width: '200%', minWidth: '300%', maxWidth: '400%' }, '1024px');

    expect(style.width).toBe(`${MAX_DIMENSION_PERCENT}%`);
    expect(style.minWidth).toBe(`${MAX_DIMENSION_PERCENT}%`);
    expect(style.maxWidth).toBe(`${MAX_DIMENSION_PERCENT}%`);
  });

  it('leaves an over-wide width alone on a rendered page', () => {
    // Over 100% inside an overflow wrapper is deliberate, and the settings input already warns at
    // the point of entry. Rewriting it here changed forms that were already working.
    expect(getDimensionsStyle({ width: '200%' }).width).toBe('200%');
    expect(getDimensionsStyle({ width: '2000px' }).width).toBe('2000px');
    expect(getDimensionsStyle({ width: '200vw' }).width).toBe('200vw');
  });

  it('leaves vw as the real viewport on a rendered page', () => {
    // The leak this replaces resolved vw against a device preset restored from local storage.
    expect(getDimensionsStyle({ width: '50vw' }).width).toBe('50vw');
  });

  it('leaves widths within the container as they were', () => {
    const style = getDimensionsStyle({ width: '80%', minWidth: '10px', maxWidth: 'max-content' }, '1024px');

    expect(style.width).toBe('80%');
    expect(style.minWidth).toBe('10px');
    expect(style.maxWidth).toBe('max-content');
  });

  it('does not bound heights - a different axis, and 100vh is the reported case there', () => {
    const style = getDimensionsStyle({ height: '200%', minHeight: '300%' }, '1024px');

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

describe('viewport heights', () => {
  // getDimensionsStyle(dimensions, canvasWidth, canvasHeight): a canvas height exists only while a
  // designer canvas is mounted, so its absence is what a rendered page looks like.
  const CANVAS = '820px';

  it('leaves a viewport height alone on a rendered page, where vh already means the viewport', () => {
    expect(getDimensionsStyle({ height: '100vh' }).height).toBe('100vh');
    expect(getDimensionsStyle({ minHeight: '100vh' }).minHeight).toBe('100vh');
    expect(getDimensionsStyle({ maxHeight: '100vh' }).maxHeight).toBe('100vh');
  });

  it('resolves a viewport height against the canvas when one is mounted', () => {
    expect(getDimensionsStyle({ height: '100vh' }, undefined, CANVAS).height).toBe('calc((100 * 820px) / 100)');
    expect(getDimensionsStyle({ minHeight: '100vh' }, undefined, CANVAS).minHeight).toBe('calc((100 * 820px) / 100)');
    expect(getDimensionsStyle({ maxHeight: '100vh' }, undefined, CANVAS).maxHeight).toBe('calc((100 * 820px) / 100)');
  });

  it('resolves every vh proportionally, not only an exact 100vh', () => {
    // The flat allowance this replaces fired on 100vh alone, leaving 99vh to overshoot the canvas.
    expect(getDimensionsStyle({ height: '99vh' }, undefined, CANVAS).height).toBe('calc((99 * 820px) / 100)');
    expect(getDimensionsStyle({ height: '50vh' }, undefined, CANVAS).height).toBe('calc((50 * 820px) / 100)');
  });

  it('leaves a height that is not in vh alone, canvas or no canvas', () => {
    expect(getDimensionsStyle({ height: '800px' }, undefined, CANVAS).height).toBe('800px');
    expect(getDimensionsStyle({ height: 'auto' }, undefined, CANVAS).height).toBe('auto');
    expect(getDimensionsStyle({ height: '120%' }, undefined, CANVAS).height).toBe('120%');
  });

  it('resolves a vh nested in an expression, which a whole-value match missed', () => {
    expect(getDimensionsStyle({ height: 'calc(100vh - 10px)' }, undefined, CANVAS).height).toBe('calc(((100 * 820px) / 100) - 10px)');
  });

  it('leaves a nested vh alone with no canvas', () => {
    expect(getDimensionsStyle({ height: 'calc(100vh - 10px)' }).height).toBe('calc(100vh - 10px)');
  });

  it('does not touch widths', () => {
    expect(getDimensionsStyle({ width: '100vw' }).width).toBe('100vw');
  });
});
