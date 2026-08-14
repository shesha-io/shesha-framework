import { getIdOrUndefined, isEntityReferenceId } from '../entity';

describe('getIdOrUndefined', () => {
  it('returns the id of a plain object with a string id (e.g. form arguments)', () => {
    expect(getIdOrUndefined({ id: '9d84d079-cd07-4925-8468-077b0f6cec07' })).toBe('9d84d079-cd07-4925-8468-077b0f6cec07');
  });

  it('returns the id of an entity reference', () => {
    expect(getIdOrUndefined({ id: 'abc', _className: 'Shesha.Domain.Person' })).toBe('abc');
  });

  it('returns a non-empty string as is', () => {
    expect(getIdOrUndefined('abc')).toBe('abc');
  });

  it('returns undefined for an empty or whitespace string', () => {
    expect(getIdOrUndefined('')).toBeUndefined();
    expect(getIdOrUndefined('  ')).toBeUndefined();
  });

  it('returns undefined for null, undefined, arrays and objects without a string id', () => {
    expect(getIdOrUndefined(null)).toBeUndefined();
    expect(getIdOrUndefined(undefined)).toBeUndefined();
    expect(getIdOrUndefined([{ id: 'abc' }])).toBeUndefined();
    expect(getIdOrUndefined({ id: 5 })).toBeUndefined();
    expect(getIdOrUndefined({ name: 'abc' })).toBeUndefined();
  });
});

describe('isEntityReferenceId', () => {
  it('requires both id and _className to be strings', () => {
    expect(isEntityReferenceId({ id: 'abc', _className: 'Shesha.Domain.Person' })).toBe(true);
    expect(isEntityReferenceId({ id: 'abc' })).toBe(false);
    expect(isEntityReferenceId('abc')).toBe(false);
  });
});
