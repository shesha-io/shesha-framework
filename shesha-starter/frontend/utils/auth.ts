import { IPasswordValidation } from '@/models';

/**
 * Check if the password is valid and strong.
 *  A strong password must
 *    - contain at least 1 lowercase alphabetical character
 *    - contain at least 1 uppercase alphabetical character
 *    - contain at least 1 numeric character
 *    - contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
 *    - be eight characters or longer
 * @param password - the password to validate
 */
export const isStrongPassword = (password: string) => {
  const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');

  return passwordRegex.test(password);
};

/**
 *
 * @param password
 */
export const getPasswordValidations = (password: string): IPasswordValidation => {
  if (!password) return {};

  return {
    hasLowerCaseChar: new RegExp('^.*[a-z]').test(password),
    hasUpperCaseChar: new RegExp('^.*[A-Z]').test(password),
    hasNumericChar: new RegExp('^.*[0-9]').test(password),
    hasSpecialChar: new RegExp('^.*[!@#$%^&*]').test(password),
    hasEightChars: password.length >= 8,
  };
};
