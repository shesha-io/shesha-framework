import { formatDateStringAndPrefix } from './formatting';

describe('formatDateStringAndPrefix', () => {
  it('formats an ISO date-time without leaving the time behind', () => {
    expect(formatDateStringAndPrefix('2004-12-01T00:00:00', 'DD/MM/YYYY')).toBe('01/12/2004');
  });

  it('formats an ISO date-time into a format that keeps the time', () => {
    expect(formatDateStringAndPrefix('2004-12-01T09:05:30', 'DD/MM/YYYY HH:mm')).toBe('01/12/2004 09:05');
  });

  it('formats an ISO date-time embedded in surrounding text', () => {
    expect(formatDateStringAndPrefix('Created 2004-12-01T00:00:00 by admin', 'DD/MM/YYYY')).toBe('Created 01/12/2004 by admin');
  });

  it('uses DD/MM/YYYY when no format is supplied', () => {
    expect(formatDateStringAndPrefix('2004-12-01T00:00:00')).toBe('01/12/2004');
  });

  it('formats a compact date-time', () => {
    expect(formatDateStringAndPrefix('20041201T090530', 'DD/MM/YYYY HH:mm')).toBe('01/12/2004 09:05');
  });

  it('formats a date without a time part', () => {
    expect(formatDateStringAndPrefix('2004-12-01', 'DD/MM/YYYY')).toBe('01/12/2004');
    expect(formatDateStringAndPrefix('01-12-2004', 'YYYY-MM-DD')).toBe('2004-12-01');
  });

  it('leaves text without a date untouched', () => {
    expect(formatDateStringAndPrefix('no date here', 'DD/MM/YYYY')).toBe('no date here');
    expect(formatDateStringAndPrefix('')).toBe('');
  });
});
