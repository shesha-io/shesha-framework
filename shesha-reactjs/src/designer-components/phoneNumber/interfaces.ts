import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { CSSProperties } from 'styled-components';

export type ValueFormat = 'fullNumber' | 'object';

export interface IPhoneNumberValue {
  number: string;
  dialCode: string;
  countryCode: string;
}

export interface IPhoneNumberInputComponentProps extends IConfigurableFormComponent, IInputStyles {
  desktop?: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
  placeholder?: string;
  valueFormat?: ValueFormat;
  country?: string;
  defaultCountry?: string;
  allowClear?: boolean;
  enableArrow?: boolean;
  disableParentheses?: boolean;
  onlyCountries?: string[];
  excludeCountries?: string[];
  preferredCountries?: string[];
  searchNotFound?: string;
  onChangeCustom?: string;
}
