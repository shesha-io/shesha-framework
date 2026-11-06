import { fontStyles } from './utils';

describe('fontStyles font-family', () => {
  it('keeps the Inter fallback quoted once', () => {
    expect(fontStyles({ type: 'Merriweather' })).toContain("font-family: Merriweather, 'Inter Variable', sans-serif;");
  });

  it('quotes an unquoted family name that contains spaces', () => {
    expect(fontStyles({ type: 'Open Sans' })).toContain("font-family: \"Open Sans\", 'Inter Variable', sans-serif;");
  });

  it('passes the theme font variable through untouched', () => {
    expect(fontStyles({ type: 'Inter Variable' })).toContain("font-family: var(--sha-font-family, 'Inter Variable', sans-serif);");
  });
});
