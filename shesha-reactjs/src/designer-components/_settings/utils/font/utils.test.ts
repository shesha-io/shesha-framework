import { getFontStyle, withFontFallback } from './utils';

describe('withFontFallback', () => {
  it('appends the bundled Inter fallback to a configured family', () => {
    expect(withFontFallback('Segoe UI')).toBe("Segoe UI, 'Inter Variable', sans-serif");
  });

  it('does not double up when the family already ends in Inter', () => {
    expect(withFontFallback("'Inter Variable', sans-serif")).toBe("'Inter Variable', sans-serif");
    expect(withFontFallback('Inter Variable')).toBe('Inter Variable');
  });

  it('returns undefined for an empty family', () => {
    expect(withFontFallback(undefined)).toBeUndefined();
    expect(withFontFallback(null)).toBeUndefined();
    expect(withFontFallback('   ')).toBeUndefined();
  });
});

describe('getFontStyle', () => {
  it('emits the font family with the Inter fallback', () => {
    expect(getFontStyle({ type: 'Arial' }).fontFamily).toBe("Arial, 'Inter Variable', sans-serif");
  });

  it('omits fontFamily when no type is configured', () => {
    expect(getFontStyle({ size: 12 })).not.toHaveProperty('fontFamily');
  });
});
