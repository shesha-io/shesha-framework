import { calculateAutoZoom, DEFAULT_OPTIONS, defaultDesignerWidth } from '../utils';

describe('canvas defaults (issue #5012)', () => {
  it('defaults to the pane-filling Canvas width', () => {
    expect(defaultDesignerWidth).toBe('100%');
  });

  it('defaults zoom to 75% with 25-step zoom levels', () => {
    expect(DEFAULT_OPTIONS.defaultZoom).toBe(75);
    expect(DEFAULT_OPTIONS.zoomLevels).toEqual([25, 50, 75, 100, 125, 150, 175, 200]);
  });
});

describe('calculateAutoZoom', () => {
  it('resolves a percentage width against the container', () => {
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: '100%', containerWidth: 900 })).toBe(100);
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: '50%', containerWidth: 900 })).toBe(200);
  });

  it('resolves a px width against the container', () => {
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: '1920px', containerWidth: 960 })).toBe(50);
  });

  it('keeps the current zoom when measurements are unusable', () => {
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: '100%', containerWidth: 0 })).toBe(75);
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: '100%', containerWidth: NaN })).toBe(75);
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: 'bogus', containerWidth: 960 })).toBe(75);
  });
});
