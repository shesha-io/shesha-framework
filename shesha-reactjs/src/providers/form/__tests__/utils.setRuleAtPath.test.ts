import { Rules } from '@rc-component/async-validator';
import { isRuleItem, setRuleAtPath } from '../utils';
import { isNonEmptyArray } from '@/utils/array';

type TypeGuard<T extends Src, Src> = (val: Src) => val is T;

export function assertType<T extends Src, Src>(
  value: Src,
  // guard: (val: unknown) => val is T,
  guard: TypeGuard<T, Src>,
  message = 'Value does not satisfy the type guard',
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message);
  }
}

/**
 * Asserts that a value is not `null` or `undefined`.
 * Narrow the type by removing `null` and `undefined`.
 */
function assertNonNull<T>(
  value: T,
  message = 'Value is null or undefined',
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

describe('setRuleAtPath()', () => {
  it('should validate default settings', () => {
    const rules: Rules = {};
    setRuleAtPath(rules, 'a.b.c', { required: true });

    const ruleA = rules['a'];
    expect(ruleA).toBeDefined();

    assertType(ruleA, isRuleItem);

    const fieldsA = ruleA.fields;
    assertNonNull(fieldsA);
    const ruleB = fieldsA['b'];
    assertNonNull(ruleB);
    assertType(ruleB, isRuleItem);
    const fieldsB = ruleB.fields;
    assertNonNull(fieldsB);

    const ruleC = fieldsB['c'];
    assertNonNull(ruleC);

    if (Array.isArray(ruleC)) {
      assertType(ruleC, isNonEmptyArray);
      const requiredRule = ruleC.find((rule) => rule.required === true);
      expect(requiredRule).toBeDefined();
    } else {
      expect(ruleC).toEqual({ required: true });
    }
  });
});
