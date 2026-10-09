import { getDisabledAndReadOnly, normalizeEditMode } from './formComponentApi';

describe('normalizeEditMode', () => {
  it.each([
    [true, 'editable'],
    ['true', 'editable'],
    ['edit', 'editable'],
    ['Editable', 'editable'],
    ['enabled', 'editable'],
    [false, 'readOnly'],
    ['false', 'readOnly'],
    ['readonly', 'readOnly'],
    ['readOnly', 'readOnly'],
    ['Read-Only', 'readOnly'],
    ['read only', 'readOnly'],
    ['disabled', 'disabled'],
    ['Disabled', 'disabled'],
    ['inherited', 'inherited'],
    ['inherit', 'inherited'],
  ])('maps %j to %s', (value, expected) => {
    expect(normalizeEditMode(value)).toBe(expected);
  });

  it.each([undefined, null, '', 'unknown', 1, {}])('returns undefined for unrecognised value %j', (value) => {
    expect(normalizeEditMode(value)).toBeUndefined();
  });
});

describe('getDisabledAndReadOnly', () => {
  it('keeps editable components enabled', () => {
    expect(getDisabledAndReadOnly('editable')).toEqual({ disabled: false, readOnly: false });
  });

  it('makes read only components read only, not disabled', () => {
    expect(getDisabledAndReadOnly('readOnly')).toEqual({ disabled: false, readOnly: true });
  });

  it('disables disabled components', () => {
    expect(getDisabledAndReadOnly('disabled')).toEqual({ disabled: true, readOnly: false });
  });
});
