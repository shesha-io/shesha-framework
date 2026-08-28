import { IRefListDisplay } from '@/components/refListDisplaySelector/models';
import { SafeFunctionType } from '@/providers/form/models';
import { migrateItemDisplay } from '../migrateItemDisplay';

type DisplayEvaluator = (data: { showTheName: boolean }) => IRefListDisplay;

/** `new Function` is typed only as callable, which says nothing about how it may be called. */
const isDisplayEvaluator = (value: SafeFunctionType): value is DisplayEvaluator => typeof value === 'function';

describe('migrateItemDisplay', () => {
  it.each([
    [true, false, 'name'],
    [false, true, 'icon'],
    [true, true, 'both'],
    // The old pair had no mode for "neither", which rendered a bare colour badge.
    [false, false, 'both'],
  ] as const)('folds showReflistName=%p and showIcon=%p into %s', (showName, showIcon, expected) => {
    expect(migrateItemDisplay(showName, showIcon).itemDisplay).toBe(expected);
  });

  it('keeps the pre-selector defaults for switches that were never set', () => {
    expect(migrateItemDisplay(undefined, undefined).itemDisplay).toBe('name');
  });

  it('reads a value-mode setting through its stored value', () => {
    expect(migrateItemDisplay({ _mode: 'value', _value: false }, { _mode: 'value', _value: true }).itemDisplay)
      .toBe('icon');
  });

  describe('where either switch was driven by JS', () => {
    const dynamic = migrateItemDisplay(
      { _mode: 'code', _code: 'return data.showTheName;', _value: true },
      false,
    );

    it('produces a JS setting rather than discarding the expression', () => {
      expect(dynamic.itemDisplay).toMatchObject({ _mode: 'code' });
    });

    it('calls the original expression in place', () => {
      const code = typeof dynamic.itemDisplay === 'object' ? dynamic.itemDisplay._code ?? '' : '';

      expect(code).toContain('(() => { return data.showTheName; })()');
    });

    it('keeps the statically mapped mode as the fallback value', () => {
      expect(dynamic.itemDisplay).toMatchObject({ _value: 'name' });
    });

    it('composes into an expression that evaluates to the display flags', () => {
      const code = typeof dynamic.itemDisplay === 'object' ? dynamic.itemDisplay._code ?? '' : '';
      const compiled = new Function('data', code);
      if (!isDisplayEvaluator(compiled)) throw new Error('the migrated setting did not compile');

      expect(compiled({ showTheName: true })).toEqual({ showName: true, showIcon: false });
      expect(compiled({ showTheName: false })).toEqual({ showName: false, showIcon: false });
    });
  });
});
