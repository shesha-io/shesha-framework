import { DEFAULT_REF_LIST_DISPLAY_MODE, resolveRefListDisplay, toRefListDisplayMode } from '../models';

describe('resolveRefListDisplay', () => {
  it.each([
    ['name', { showName: true, showIcon: false }],
    ['icon', { showName: false, showIcon: true }],
    ['both', { showName: true, showIcon: true }],
  ] as const)('maps the %s mode to its flags', (mode, expected) => {
    expect(resolveRefListDisplay(mode)).toEqual(expected);
  });

  it('takes the flags a JS setting returns as they are', () => {
    expect(resolveRefListDisplay({ showName: false, showIcon: true })).toEqual({ showName: false, showIcon: true });
  });

  // At least one of the two is always shown. The selector cannot express "neither", but an
  // expression can, and an empty tag is not a useful thing to render.
  it('falls back to the default mode when a JS setting turns both off', () => {
    expect(resolveRefListDisplay({ showName: false, showIcon: false }))
      .toEqual(resolveRefListDisplay(DEFAULT_REF_LIST_DISPLAY_MODE));
  });

  it('falls back to the default mode when nothing has been configured', () => {
    expect(resolveRefListDisplay(undefined)).toEqual(resolveRefListDisplay(DEFAULT_REF_LIST_DISPLAY_MODE));
  });
});

describe('toRefListDisplayMode', () => {
  it.each([
    [{ showName: true, showIcon: true }, 'both'],
    [{ showName: false, showIcon: true }, 'icon'],
    [{ showName: true, showIcon: false }, 'name'],
  ] as const)('reports %p as the %s mode, so the selector shows it as chosen', (value, expected) => {
    expect(toRefListDisplayMode(value)).toBe(expected);
  });
});
