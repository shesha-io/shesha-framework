import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export type ValueFormat = 'fullNumber' | 'object';

export interface IPhoneNumberValue {
  number: string;
  dialCode: string;
  countryCode: string;
}

export interface IPhoneNumberInputComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string;
  initialValue?: string;
  valueFormat?: ValueFormat;
  allowedDialCodes?: string[];
  desktop?: IInputStyles;
  mobile?: IInputStyles;
  tablet?: IInputStyles;
}
