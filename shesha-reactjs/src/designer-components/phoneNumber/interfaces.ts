import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { ComponentDefinition } from '@/interfaces';

export type PhoneNumberValueFormat = 'string' | 'national' | 'object';

export interface IPhoneNumberValue {
  number: string;
  dialCode: string;
  countryCode: string;
}

export interface IPhoneNumberComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  initialValue?: string | undefined;
  valueFormat?: PhoneNumberValueFormat | undefined;
  stripCountryCode?: boolean | undefined;
  country?: string | undefined;
  defaultCountry?: string | undefined;
  allowClear?: boolean | undefined;
  enableArrow?: boolean | undefined;
  distinct?: boolean | undefined;
  disableParentheses?: boolean | undefined;
  disableDropdown?: boolean | undefined;
  onlyCountries?: string | undefined;
  excludeCountries?: string | undefined;
  preferredCountries?: string | undefined;
  desktop?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;
  onChangeCustom?: string | undefined;
  onBlurCustom?: string | undefined;
  onFocusCustom?: string | undefined;
}

export type PhoneNumberComponentDefinition = ComponentDefinition<"phoneNumberInput", IPhoneNumberComponentProps>;
