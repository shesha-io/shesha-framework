import { IConfigurableFormComponent } from '@/providers/form/models';

export type ValueFormat = 'string' | 'national' | 'object';

export interface IPhoneNumberValue {
    number: string;
    dialCode: string;
    countryCode: string;
}

export interface IPhoneNumberInputComponentProps extends IConfigurableFormComponent {
    placeholder?: string;
    initialValue?: string;
    valueFormat?: ValueFormat;
    stripCountryCode?: boolean;
    country?: string;
    defaultCountry?: string;
    allowClear?: boolean;
    enableArrow?: boolean;
    enableSearch?: boolean;
    distinct?: boolean;
    disableParentheses?: boolean;
    disableDropdown?: boolean;
    onlyCountries?: string[] | string;
    excludeCountries?: string[] | string;
    preferredCountries?: string[] | string;
    searchNotFound?: string;
    searchPlaceholder?: string;
    size?: 'small' | 'middle' | 'large';
    wrapperStyle?: string;
    inputGroupWrapperStyle?: string;
    inputWrapperStyle?: string;
    inputGroupStyle?: string;
    inputStyle?: string;
    onChangeCustom?: string;
}
