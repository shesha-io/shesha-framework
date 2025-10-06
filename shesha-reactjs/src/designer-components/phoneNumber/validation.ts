import { IPhoneNumberValue } from './interfaces';

/**
 * Validates that phone number uses an allowed dial code
 * @param value - Phone number value (string or object)
 * @param allowedDialCodes - Array of allowed dial codes (e.g., ['+27', '+1'])
 * @returns true if valid, error message if invalid
 */
export const validateDialCode = (
  value: string | IPhoneNumberValue | undefined,
  allowedDialCodes?: string[]
): string | true => {
  if (!value || !allowedDialCodes || allowedDialCodes.length === 0) return true;

  const dialCode = typeof value === 'string'
    ? value.match(/^\+\d+/)?.[0]
    : value.dialCode;

  if (!dialCode) return 'Phone number must include a dial code';

  const normalizedAllowedCodes = allowedDialCodes.map((code) => code.replace(/\s/g, ''));
  const normalizedDialCode = dialCode.replace(/\s/g, '');

  if (!normalizedAllowedCodes.includes(normalizedDialCode)) {
    return `Phone number must use one of the allowed dial codes: ${allowedDialCodes.join(', ')}`;
  }

  return true;
};
