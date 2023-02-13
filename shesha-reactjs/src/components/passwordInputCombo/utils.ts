import { FormItemProps } from 'antd';
import { IPasswordValidation } from '../../interfaces';

const ERROR_MSG = 'Passwords do not match';

export const confirmPasswordValidations = (
  password: string,
  confirmPassword: string,
  errorMessage: string = null
): FormItemProps => {
  const passwordsMatch = password === confirmPassword;

  const confirmPaswordDirty = !!confirmPassword && passwordsMatch;

  const hasFeedback = confirmPaswordDirty;

  const validateStatus = confirmPaswordDirty ? 'success' : !confirmPassword ? undefined : 'error';

  const help = validateStatus === 'error' ? errorMessage : null;

  const rules = help ? [{ required: true, validator: () => Promise.reject(errorMessage || ERROR_MSG) }] : undefined;

  if (rules) return { hasFeedback, validateStatus, help, rules };

  return { hasFeedback, validateStatus, help };
};

export const getPasswordValidations = (password: string, passwordLength: number = 4): IPasswordValidation => {
  if (!Boolean(password)) return {};

  return {
    hasLowerCaseChar: new RegExp('^.*[a-z]').test(password),
    hasUpperCaseChar: new RegExp('^.*[A-Z]').test(password),
    hasNumericChar: new RegExp('^.*[0-9]').test(password),
    hasSpecialChar: new RegExp('^.*[!@#$%^&*]').test(password),
    hasEightChars: password.length >= passwordLength,
  };
};

export const isSamePassword = (initialPassword: string, confirmPassword: string, passwordLength: number = 4) => {
  if (initialPassword) {
    if (isStrongPassword(initialPassword, passwordLength)) {
      return initialPassword === confirmPassword;
    }
  }

  return false;
};

export const isStrongPassword = (password: string, length: number) => {
  const passwordRegex = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{${length},})`);

  return passwordRegex.test(password);
};

export const passwordValidations = (
  password: string,
  errorMessage: string = null,
  length: number = 4
): FormItemProps => {
  const passwordIsBad = !isStrongPassword(password, length);

  const hasFeedback = !!password && !passwordIsBad;

  const validateStatus = password ? (passwordIsBad ? 'error' : 'success') : '';

  const help = validateStatus === 'error' ? errorMessage : null;

  const rules = help ? [{ required: true, validator: () => Promise.reject(errorMessage || ERROR_MSG) }] : undefined;

  if (rules) return { hasFeedback, validateStatus, help, rules };

  return { hasFeedback, validateStatus, help };
};
