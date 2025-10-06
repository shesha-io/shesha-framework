/**
 * Mapping of dial codes to ISO country codes for phone number input
 * Used to filter allowed countries based on dial codes
 */
export const DIAL_CODE_TO_COUNTRY_MAP: Record<string, string[]> = {
  1: ['us', 'ca'], // USA, Canada
  20: ['eg'], // Egypt
  27: ['za'], // South Africa
  31: ['nl'], // Netherlands
  32: ['be'], // Belgium
  33: ['fr'], // France
  34: ['es'], // Spain
  39: ['it'], // Italy
  41: ['ch'], // Switzerland
  43: ['at'], // Austria
  44: ['gb'], // United Kingdom
  45: ['dk'], // Denmark
  46: ['se'], // Sweden
  47: ['no'], // Norway
  48: ['pl'], // Poland
  49: ['de'], // Germany
  52: ['mx'], // Mexico
  54: ['ar'], // Argentina
  55: ['br'], // Brazil
  56: ['cl'], // Chile
  57: ['co'], // Colombia
  58: ['ve'], // Venezuela
  60: ['my'], // Malaysia
  61: ['au'], // Australia
  62: ['id'], // Indonesia
  63: ['ph'], // Philippines
  64: ['nz'], // New Zealand
  65: ['sg'], // Singapore
  66: ['th'], // Thailand
  81: ['jp'], // Japan
  82: ['kr'], // South Korea
  84: ['vn'], // Vietnam
  86: ['cn'], // China
  91: ['in'], // India
  234: ['ng'], // Nigeria
  254: ['ke'], // Kenya
  351: ['pt'], // Portugal
  962: ['jo'], // Jordan
  965: ['kw'], // Kuwait
  966: ['sa'], // Saudi Arabia
  968: ['om'], // Oman
  971: ['ae'], // UAE
  973: ['bh'], // Bahrain
  974: ['qa'], // Qatar
};

/**
 * Get enabled country codes based on allowed dial codes
 * @param allowedDialCodes - Array of dial codes (e.g., ['+27', '+1', '+44'])
 * @returns Array of ISO country codes or undefined for all countries
 */
export const getEnabledCountries = (allowedDialCodes?: string[]): string[] | undefined => {
  if (!allowedDialCodes || allowedDialCodes.length === 0) {
    return undefined; // All countries enabled by default
  }

  const enabledCountryCodes: string[] = [];
  allowedDialCodes.forEach((dialCode) => {
    const cleanDialCode = dialCode.replace('+', '').trim();
    const countries = DIAL_CODE_TO_COUNTRY_MAP[cleanDialCode];
    if (countries) {
      enabledCountryCodes.push(...countries);
    }
  });

  return enabledCountryCodes.length > 0 ? enabledCountryCodes : undefined;
};
