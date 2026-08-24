import { IStyleValue } from "@/providers/form/models";
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useMemo } from 'react';
import { TextType } from './interfaces';

export interface ITextTypeFormatConfig {
  pattern: RegExp;
  message: string;
  inputType: string;
  autoComplete: string;
}

/** Built-in format presets for the non-password "typed" TextField variants. */
export const TEXT_TYPE_FORMATS: Partial<Record<TextType, ITextTypeFormatConfig>> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
    inputType: 'email',
    autoComplete: 'email',
  },
  url: {
    pattern: /^https?:\/\/[^\s$.?#].[^\s]*$/,
    message: 'Please enter a valid URL, e.g. https://example.com',
    inputType: 'url',
    autoComplete: 'url',
  },
  phone: {
    // Lenient: leading "+", digits, spaces, dashes, dots and parentheses, 7-20 chars.
    // The lookahead requires at least one digit, so separators alone (e.g. "-------") are rejected.
    pattern: /^\+?(?=.*[0-9])[0-9\s\-().]{7,20}$/,
    message: 'Please enter a valid phone number',
    inputType: 'tel',
    autoComplete: 'tel',
  },
};

export const buildFormatValidatorString = (pattern: RegExp, message: string): string => `
    try {
      if (typeof value !== 'string' || value.length === 0) return Promise.resolve();
      return ${pattern.toString()}.test(value) ? Promise.resolve() : Promise.reject(${JSON.stringify(message)});
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[TextField] Format validator error:', msg);
      return Promise.reject('Validation failed: ' + msg);
    }
  `;

export const parseGroupLengths = (groups: string | undefined): number[] => {
  if (isNullOrWhiteSpace(groups)) return [];
  return groups
    .split(',')
    .map((part) => part.trim())
    .filter((part) => /^\d+$/.test(part))
    .map((part) => parseInt(part, 10))
    .filter((length) => Number.isFinite(length) && length > 0);
};

/** Removes every occurrence of `separator` from `value`, leaving only the raw characters. */
export const stripSeparator = (value: string, separator: string): string => {
  if (isNullOrWhiteSpace(value) || !isDefined(separator) || separator === '') return value;
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return value.split(new RegExp(escapedSeparator, 'g')).join('');
};

export const totalGroupLength = (groupLengths: number[]): number => groupLengths.reduce((sum, length) => sum + length, 0);

/**
 * Re-groups raw characters with a separator, e.g. groupLengths [3, 4] and separator '-'
 * turns "1234567" into "123-4567". Strips any separator characters already present first,
 * so it can be applied both to raw stored values and to the input's current (already-formatted) value.
 */
export const applyGroupFormatting = (rawValue: string, groupLengths: number[], separator: string): string => {
  if (groupLengths.length === 0 || isNullOrWhiteSpace(rawValue)) return rawValue;

  const stripped = stripSeparator(rawValue, separator);
  const capped = stripped.slice(0, totalGroupLength(groupLengths));

  const groupedParts: string[] = [];
  let position = 0;
  for (const length of groupLengths) {
    if (position >= capped.length) break;
    groupedParts.push(capped.slice(position, position + length));
    position += length;
  }

  return groupedParts.join(separator);
};

export const defaultStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '#fff' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: '32px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: {
      spreadRadius: 0,
      blurRadius: 0,
      color: '#000',
      offsetX: 0,
      offsetY: 0,
    },
    stylingBoxJson: {
      _type: 'styleBox',
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "0",
      paddingLeft: "8",
      paddingRight: "8",
      paddingTop: "0",
    },
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
