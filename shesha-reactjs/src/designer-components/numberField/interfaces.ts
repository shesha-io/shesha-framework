import { IconType } from '@/components';
import { IToolboxComponent } from '@/interfaces';
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
interface INumberFieldComponentCalulatedValues {
  defaultValue?: string;
  eventHandlers?: any;
}

export type NumberFieldComponentDefinition = IToolboxComponent<INumberFieldComponentProps, INumberFieldComponentCalulatedValues>;

