import { ensureWebFontLoaded, getWebFontUrl } from './webFonts';

const webFontLinks = (): HTMLLinkElement[] => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[data-sha-web-font]'));

describe('getWebFontUrl', () => {
  it('returns the Google Fonts stylesheet for a web font, matching the name case-insensitively', () => {
    expect(getWebFontUrl('Ubuntu')).toBe('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
    expect(getWebFontUrl('Pt Sans')).toContain('family=PT+Sans');
    expect(getWebFontUrl("'Open Sans'")).toContain('family=Open+Sans');
  });

  it('returns undefined for system fonts and the bundled Inter', () => {
    expect(getWebFontUrl('Arial')).toBeUndefined();
    expect(getWebFontUrl('Inter Variable')).toBeUndefined();
  });
});

describe('ensureWebFontLoaded', () => {
  it('adds the stylesheet for the first family of a stack, once', () => {
    ensureWebFontLoaded("Merriweather, 'Inter Variable', sans-serif");
    ensureWebFontLoaded('Merriweather');
    expect(webFontLinks().filter((l) => l.dataset['shaWebFont'] === 'Merriweather')).toHaveLength(1);
  });

  it('adds nothing for a font the OS provides', () => {
    const before = webFontLinks().length;
    ensureWebFontLoaded('Arial, sans-serif');
    expect(webFontLinks()).toHaveLength(before);
  });
});
