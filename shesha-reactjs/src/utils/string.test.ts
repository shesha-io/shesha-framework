import { camelcaseDotNotation, camelcaseDotNotationKeepUnderscores } from './string';

describe('camelcaseDotNotationKeepUnderscores', () => {
  it('keeps the leading underscore of the display name field', () => {
    expect(camelcaseDotNotation('_displayName')).toBe('displayName');
    expect(camelcaseDotNotationKeepUnderscores('_displayName')).toBe('_displayName');
  });

  it('keeps leading underscores of each part of a dot notation path', () => {
    expect(camelcaseDotNotationKeepUnderscores('User._displayName')).toBe('user._displayName');
  });

  it('converts parts without underscores the same way as camelcaseDotNotation', () => {
    expect(camelcaseDotNotationKeepUnderscores('User.FullName')).toBe(camelcaseDotNotation('User.FullName'));
  });
});
