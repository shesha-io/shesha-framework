import { IconType } from '@/components';
import { IConfigurableFormComponent, IInputStyles, IStyleType } from '@/providers/form/models'; ;

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
