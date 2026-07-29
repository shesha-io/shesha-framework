import { migrateStylesToNestedSet } from '../migrateStylesToNestedSet';

describe('migrateStylesToNestedSet', () => {
  it('moves the existing device styles under the nested set', () => {
    const result = migrateStylesToNestedSet({
      id: 'x',
      desktop: {
        border: { radiusType: 'all' },
        background: { type: 'color' as const, color: '#fff' },
        enableStyleOnReadonly: false,
      },
    }, 'radio');

    expect(result.desktop).toEqual({
      enableStyleOnReadonly: false,
      radio: {
        border: { radiusType: 'all' },
        background: { type: 'color', color: '#fff' },
      },
    });
  });

  it('uses the nested name it is given', () => {
    const result = migrateStylesToNestedSet({ desktop: { border: { radiusType: 'all' } } }, 'checkbox');

    expect(result.desktop).toEqual({ checkbox: { border: { radiusType: 'all' } } });
  });

  it('leaves font and shadow on the wrapper', () => {
    // The nested panel exposes neither, so those values stay where they are.
    const result = migrateStylesToNestedSet({
      desktop: { font: { size: 14 }, shadow: { blurRadius: 2 }, border: { radiusType: 'all' } },
    }, 'radio');

    expect(result.desktop).toEqual({
      font: { size: 14 },
      shadow: { blurRadius: 2 },
      radio: { border: { radiusType: 'all' } },
    });
  });

  it('leaves non-style properties on the wrapper', () => {
    const result = migrateStylesToNestedSet({ id: 'x', desktop: { border: { radiusType: 'all' } } }, 'radio');

    expect(result.id).toBe('x');
  });

  it('migrates every device bucket', () => {
    const result = migrateStylesToNestedSet({
      desktop: { dimensions: { width: '14px' } },
      tablet: { dimensions: { width: '12px' } },
      mobile: { dimensions: { width: '10px' } },
    }, 'radio');

    expect(result.desktop?.radio?.dimensions?.width).toBe('14px');
    expect(result.tablet?.radio?.dimensions?.width).toBe('12px');
    expect(result.mobile?.radio?.dimensions?.width).toBe('10px');
  });

  it('is idempotent — a second run does not nest again', () => {
    const once = migrateStylesToNestedSet({ desktop: { border: { radiusType: 'all' } } }, 'radio');
    const twice = migrateStylesToNestedSet(once, 'radio');

    expect(twice.desktop).toEqual({ radio: { border: { radiusType: 'all' } } });
  });

  it('leaves a bucket alone when it holds no nested style properties', () => {
    const result = migrateStylesToNestedSet({ desktop: { enableStyleOnReadonly: false } }, 'radio');

    expect(result.desktop).toEqual({ enableStyleOnReadonly: false });
  });

  it('handles a model with no device buckets', () => {
    expect(migrateStylesToNestedSet({ id: 'y' }, 'radio')).toEqual({ id: 'y' });
  });

  it('skips an undefined device bucket', () => {
    const result = migrateStylesToNestedSet({ desktop: undefined, tablet: { border: {} } }, 'radio');

    expect(result.tablet).toEqual({ radio: { border: {} } });
  });
});
