import { FormItemProps } from 'antd/lib/form';
import { isStrongPassword } from 'utils/auth';

export const passwordValidations = (password: string): FormItemProps => {
  const passwordIsBad = !isStrongPassword(password);

  const hasFeedback = !!password && !passwordIsBad;

  const validateStatus = passwordIsBad ? 'error' : 'success';

  return { hasFeedback, validateStatus, help: null, children: null };
};

export const confirmPasswordValidations = (password: string, confirmPassword: string): FormItemProps => {
  const passwordsMatch = password === confirmPassword;

  const confirmPaswordDirty = !!confirmPassword && passwordsMatch;

  const hasFeedback = confirmPaswordDirty;

  const validateStatus = confirmPaswordDirty ? 'success' : !confirmPassword ? undefined : 'error';

  // const help = confirmPaswordDirty ? '' : !confirmPassword ? undefined : 'Passwords to not match';

  return { hasFeedback, validateStatus, help: null, children: null };
};
