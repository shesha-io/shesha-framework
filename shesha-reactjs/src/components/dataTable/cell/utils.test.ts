import { adjustWidth, asNumber } from './utils';

describe('asNumber', () => {
  it('passes numbers through', () => {
    expect(asNumber(3)).toBe(3);
    expect(asNumber(0)).toBe(0);
  });

  it('parses numeric strings (url/in-memory sources deliver reflist values as strings)', () => {
    expect(asNumber('3')).toBe(3);
    expect(asNumber('3.5')).toBe(3.5);
  });

  it('returns undefined for empty and non-numeric input', () => {
    expect(asNumber('')).toBeUndefined();
    expect(asNumber('  ')).toBeUndefined();
    expect(asNumber('abc')).toBeUndefined();
    expect(asNumber(null)).toBeUndefined();
    expect(asNumber(undefined)).toBeUndefined();
  });

  it('rejects booleans and arrays despite Number() coercing them', () => {
    expect(asNumber(true)).toBeUndefined();
    expect(asNumber(false)).toBeUndefined();
    expect(asNumber([])).toBeUndefined();
    expect(asNumber([5])).toBeUndefined();
    expect(asNumber({})).toBeUndefined();
  });
});

describe('adjustWidth', () => {
  it('sizes all-at-once inline editing by delete availability', () => {
    expect(adjustWidth({ inlineEditMode: 'all-at-once', canDelete: 'yes' })).toEqual({ minWidth: 100, maxWidth: 100 });
    expect(adjustWidth({ inlineEditMode: 'all-at-once' })).toEqual({ minWidth: 90, maxWidth: 90 });
  });

  it('sizes by enabled operations', () => {
    expect(adjustWidth({ canAdd: 'yes' })).toEqual({ minWidth: 70, maxWidth: 70 });
    expect(adjustWidth({ canEdit: 'yes', canDelete: 'yes' })).toEqual({ minWidth: 70, maxWidth: 70 });
    expect(adjustWidth({ canEdit: 'yes' })).toEqual({ minWidth: 70, maxWidth: 70 });
    expect(adjustWidth({ canDelete: 'yes' })).toEqual({ minWidth: 35, maxWidth: 35 });
  });

  it('collapses to zero when nothing is enabled', () => {
    expect(adjustWidth({})).toEqual({ minWidth: 0, maxWidth: 0 });
  });
});
