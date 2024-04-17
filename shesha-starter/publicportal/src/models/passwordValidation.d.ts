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
export interface IPasswordValidation {
  readonly hasLowerCaseChar?: boolean;
  readonly hasUpperCaseChar?: boolean;
  readonly hasNumericChar?: boolean;
  readonly hasSpecialChar?: boolean;
  readonly hasEightChars?: boolean;
}
