import { IconType } from '@/components';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { IInputStyles } from '../textField/interfaces';

export interface INumberFieldComponentProps extends IConfigurableFormComponent, IInputStyles, IStyleType {
  hideBorder?: boolean;
  min?: number;
  max?: number;
  highPrecision?: boolean;
  stepNumeric?: number;
  stepString?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
}
