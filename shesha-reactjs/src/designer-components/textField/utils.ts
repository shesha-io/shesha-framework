import { IStyleType } from "@/providers/form/models";
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { useMemo } from 'react';

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};

export interface IPasswordComplexitySettings {
  requireDigit: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNonAlphanumeric: boolean;
  requiredLength: number;
}

const requireDigitSetting: ISettingIdentifier = { module: 'Shesha', name: 'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit' };
const requireLowercaseSetting: ISettingIdentifier = { module: 'Shesha', name: 'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase' };
const requireUppercaseSetting: ISettingIdentifier = { module: 'Shesha', name: 'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase' };
const requireNonAlphanumericSetting: ISettingIdentifier = { module: 'Shesha', name: 'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric' };
const requiredLengthSetting: ISettingIdentifier = { module: 'Shesha', name: 'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength' };

export const usePasswordComplexitySettings = (): IPasswordComplexitySettings => {
  const { value: requireDigit } = useSettingValue<boolean>(requireDigitSetting);
  const { value: requireLowercase } = useSettingValue<boolean>(requireLowercaseSetting);
  const { value: requireUppercase } = useSettingValue<boolean>(requireUppercaseSetting);
  const { value: requireNonAlphanumeric } = useSettingValue<boolean>(requireNonAlphanumericSetting);
  const { value: requiredLength } = useSettingValue<number>(requiredLengthSetting);

  return useMemo(() => ({
    requireDigit: requireDigit ?? false,
    requireLowercase: requireLowercase ?? false,
    requireUppercase: requireUppercase ?? false,
    requireNonAlphanumeric: requireNonAlphanumeric ?? false,
    requiredLength: requiredLength ?? 8,
  }), [requireDigit, requireLowercase, requireUppercase, requireNonAlphanumeric, requiredLength]);
};

export const validatePasswordValue = (value: string, settings: IPasswordComplexitySettings): string[] => {
  const errors: string[] = [];

  if (settings.requiredLength > 0 && value.length < settings.requiredLength) {
    errors.push(`at least ${settings.requiredLength} characters`);
  }
  if (settings.requireDigit && !/[0-9]/.test(value)) {
    errors.push('at least one digit');
  }
  if (settings.requireLowercase && !/[a-z]/.test(value)) {
    errors.push('at least one lowercase letter');
  }
  if (settings.requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('at least one uppercase letter');
  }
  if (settings.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(value)) {
    errors.push('at least one non-alphanumeric character');
  }

  return errors;
};

export const buildPasswordValidatorString = (settings: IPasswordComplexitySettings): string => {
  const checks: string[] = [];
  if (settings.requiredLength > 0) {
    checks.push(`if (pwd.length < ${settings.requiredLength}) errors.push('at least ${settings.requiredLength} characters');`);
  }
  if (settings.requireDigit) {
    checks.push(`if (!/[0-9]/.test(pwd)) errors.push('at least one digit');`);
  }
  if (settings.requireLowercase) {
    checks.push(`if (!/[a-z]/.test(pwd)) errors.push('at least one lowercase letter');`);
  }
  if (settings.requireUppercase) {
    checks.push(`if (!/[A-Z]/.test(pwd)) errors.push('at least one uppercase letter');`);
  }
  if (settings.requireNonAlphanumeric) {
    checks.push(`if (!/[^a-zA-Z0-9]/.test(pwd)) errors.push('at least one non-alphanumeric character');`);
  }

  return `
    try {
      const pwd = typeof value === 'string' ? value : '';
      const errors = [];
      ${checks.join('\n      ')}
      if (errors.length > 0) return Promise.reject('Password must contain ' + errors.join(', '));
      return Promise.resolve();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[TextField] Password validator error:', msg);
      return Promise.reject('Password validation failed: ' + msg);
    }
  `;
};
