import { IConfigurableFormComponent } from '@/providers/form/models';

export type ValueFormat = 'string' | 'national' | 'object';

export interface IPhoneNumberValue {
    number: string;
    dialCode: string;
    countryCode: string;
}

export interface IPhoneNumberInputComponentProps extends IConfigurableFormComponent {
    placeholder?: string;
    initialValue?: string | IPhoneNumberValue;
    valueFormat?: ValueFormat;
    stripCountryCode?: boolean;
    country?: string;
    defaultCountry?: string;
    allowClear?: boolean;
    enableArrow?: boolean;
    distinct?: boolean;
    disableParentheses?: boolean;
    disableDropdown?: boolean;
    onlyCountries?: string[] | string;
    excludeCountries?: string[] | string;
    preferredCountries?: string[] | string;
    size?: 'small' | 'middle' | 'large';
    styles?: string;
    onChangeCustom?: string;
    onBlurCustom?: string;
    onFocusCustom?: string;
}
