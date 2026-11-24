import { isValueLoaded } from './utils';

const saved = { id: '1', _displayName: 'One', _className: 'Test.Entity', name: 'One' };
// Shape produced by outcomeValueFunc for an item picked in the dialog: no custom display property
const picked = { id: '2', _displayName: '', _className: 'Test.Entity' };

describe('isValueLoaded', () => {
  it('returns false for empty values', () => {
    expect(isValueLoaded(undefined, 'name')).toBe(false);
    expect(isValueLoaded(null, 'name')).toBe(false);
  });

  it('checks a single value', () => {
    expect(isValueLoaded(saved, 'name')).toBe(true);
    expect(isValueLoaded(picked, 'name')).toBe(false);
    expect(isValueLoaded('2', 'name')).toBe(false);
  });

  it('is true only when every item carries the display property', () => {
    expect(isValueLoaded([saved], 'name')).toBe(true);
    expect(isValueLoaded([picked], 'name')).toBe(false);
    expect(isValueLoaded([saved, picked], 'name')).toBe(false);
    expect(isValueLoaded(['1', '2'], 'name')).toBe(false);
  });

  it('treats newly picked items as loaded for the default display property', () => {
    expect(isValueLoaded([saved, picked], '_displayName')).toBe(true);
  });
});
