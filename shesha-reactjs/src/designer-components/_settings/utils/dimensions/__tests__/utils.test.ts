import { getDimensionsStyle } from '../utils';

describe('getDimensionsStyle vw/vh conversion', () => {
  it('converts vw relative to an absolute (px) canvas width', () => {
    expect(getDimensionsStyle({ width: '50vw' }, '1024px').width).toBe('calc((50 * 1024px) / 100)');
  });

  it('keeps real viewport units when the canvas width is relative', () => {
    expect(getDimensionsStyle({ width: '50vw' }, '100%').width).toBe('50vw');
    expect(getDimensionsStyle({ width: '.5vw' }, '100%').width).toBe('.5vw');
    expect(getDimensionsStyle({ width: '50VW' }, '100%').width).toBe('50VW');
  });

  it('keeps real viewport units when no canvas width is provided', () => {
    expect(getDimensionsStyle({ width: '50vw' }).width).toBe('50vw');
  });
});
