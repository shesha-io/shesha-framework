import { normalizeSingleBraceAccessor } from '../mustacheNormalization';

describe('normalizeSingleBraceAccessor', () => {
  it('upgrades a whole-string single-brace dotted accessor to a Mustache tag', () => {
    expect(normalizeSingleBraceAccessor('{data.id}')).toBe('{{data.id}}');
    expect(normalizeSingleBraceAccessor('{data.primaryContact.id}')).toBe('{{data.primaryContact.id}}');
  });

  it('tolerates surrounding and inner whitespace', () => {
    expect(normalizeSingleBraceAccessor('  { data.id }  ')).toBe('{{data.id}}');
  });

  it('leaves existing Mustache tags untouched', () => {
    expect(normalizeSingleBraceAccessor('{{data.id}}')).toBe('{{data.id}}');
    expect(normalizeSingleBraceAccessor('{{{data.id}}}')).toBe('{{{data.id}}}');
  });

  it('does not touch a single token without a dot (never resolved historically)', () => {
    expect(normalizeSingleBraceAccessor('{data}')).toBe('{data}');
  });

  it('leaves inline / partial single braces literal', () => {
    expect(normalizeSingleBraceAccessor('id={data.id}')).toBe('id={data.id}');
    expect(normalizeSingleBraceAccessor('{data.id} and more')).toBe('{data.id} and more');
  });

  it('leaves JSON / CSS-like single-brace content untouched', () => {
    expect(normalizeSingleBraceAccessor('{ "a": 1 }')).toBe('{ "a": 1 }');
    expect(normalizeSingleBraceAccessor('{}')).toBe('{}');
  });

  it('passes through plain literals (e.g. a hardcoded GUID)', () => {
    const guid = '1ac1b1ec-4ff3-4540-8ee6-00aacd3da7ab';
    expect(normalizeSingleBraceAccessor(guid)).toBe(guid);
  });

  it('returns non-string input unchanged', () => {
    expect(normalizeSingleBraceAccessor(undefined as unknown as string)).toBeUndefined();
  });
});
