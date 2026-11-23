import { describe, expect, it } from 'vitest';
import { extractPreviewError, extractTotalCount, hasRuntimeExpressions } from '../queryPreview';

describe('hasRuntimeExpressions', () => {
  it('finds an evaluate node at any depth', () => {
    const logic = {
      and: [
        { '==': [{ var: 'firstName' }, 'Sys'] },
        { '>=': [{ var: 'creationTime' }, { evaluate: [{ expression: '{{data.from}}', type: 'mustache', required: true }] }] },
      ],
    };
    expect(hasRuntimeExpressions(logic)).toBe(true);
  });

  it('is false for plain filters, scalars and empty logic', () => {
    expect(hasRuntimeExpressions({ and: [{ startsWith: [{ var: 'firstName' }, 'Sys'] }] })).toBe(false);
    expect(hasRuntimeExpressions(undefined)).toBe(false);
    expect(hasRuntimeExpressions('{{data.id}}')).toBe(false);
  });
});

describe('extractTotalCount', () => {
  it('reads the abp envelope', () => {
    expect(extractTotalCount({ result: { totalCount: 42, items: [] }, success: true })).toBe(42);
  });

  it('reads a bare result object', () => {
    expect(extractTotalCount({ totalCount: 0, items: [] })).toBe(0);
  });

  it('returns undefined for error payloads and non-objects', () => {
    expect(extractTotalCount({ result: null, success: false })).toBeUndefined();
    expect(extractTotalCount(null)).toBeUndefined();
    expect(extractTotalCount('nope')).toBeUndefined();
  });
});

describe('extractPreviewError', () => {
  it('prefers the server error details', () => {
    const payload = { result: null, error: { message: 'Your request is not valid!', details: "Operator `datetime_add` is not supported" } };
    expect(extractPreviewError(payload)).toBe("Operator `datetime_add` is not supported");
  });

  it('falls back to the message, then to a generic text', () => {
    expect(extractPreviewError({ error: { message: 'Your request is not valid!' } })).toBe('Your request is not valid!');
    expect(extractPreviewError({})).toBe('The query could not be checked');
    expect(extractPreviewError(new Error('network down'))).toBe('network down');
  });
});
