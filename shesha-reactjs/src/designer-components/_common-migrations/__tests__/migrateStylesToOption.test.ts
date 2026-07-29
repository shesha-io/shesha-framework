import { migrateStylesToOption } from '../migrateStylesToOption';

describe('migrateStylesToOption', () => {
  it('moves the existing device styles under option', () => {
    const result = migrateStylesToOption({
      id: 'x',
      desktop: {
        border: { radiusType: 'all' },
        background: { type: 'color' as const, color: '#fff' },
        enableStyleOnReadonly: false,
      },
    });

    expect(result.desktop).toEqual({
      enableStyleOnReadonly: false,
      option: {
        border: { radiusType: 'all' },
        background: { type: 'color', color: '#fff' },
      },
    });
  });

  it('leaves non-style properties on the wrapper', () => {
    const result = migrateStylesToOption({ id: 'x', desktop: { border: { radiusType: 'all' } } });

    expect(result.id).toBe('x');
  });

  it('migrates every device bucket', () => {
    const result = migrateStylesToOption({
      desktop: { font: { size: 14 } },
      tablet: { font: { size: 12 } },
      mobile: { font: { size: 10 } },
    });

    expect(result.desktop?.option?.font?.size).toBe(14);
    expect(result.tablet?.option?.font?.size).toBe(12);
    expect(result.mobile?.option?.font?.size).toBe(10);
  });

  it('is idempotent — a second run does not nest again', () => {
    const once = migrateStylesToOption({ desktop: { border: { radiusType: 'all' } } });
    const twice = migrateStylesToOption(once);

    expect(twice.desktop).toEqual({ option: { border: { radiusType: 'all' } } });
  });

  it('leaves a bucket alone when it holds no style properties', () => {
    const result = migrateStylesToOption({ desktop: { enableStyleOnReadonly: false } });

    expect(result.desktop).toEqual({ enableStyleOnReadonly: false });
  });

  it('handles a model with no device buckets', () => {
    expect(migrateStylesToOption({ id: 'y' })).toEqual({ id: 'y' });
  });

  it('skips an undefined device bucket', () => {
    const result = migrateStylesToOption({ desktop: undefined, tablet: { border: {} } });

    expect(result.tablet).toEqual({ option: { border: {} } });
  });
});
