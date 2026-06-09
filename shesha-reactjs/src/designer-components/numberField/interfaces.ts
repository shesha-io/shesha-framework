import { IconType } from '@/components/shaIcon';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles, IPropertySetting } from '@/providers/form/models';

export interface INumberFieldComponentPropsV1 extends IConfigurableFormComponent, IInputStyles {
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

export type NumberFieldFormat = 'integer' | 'decimal' | 'percent' | 'currency' | 'custom';

export interface INumberFieldComponentProps extends IConfigurableFormComponent, IInputStyles {
  numberFormat?: NumberFieldFormat;
  hideBorder?: boolean;
  highPrecision?: boolean;
  numDecimalPlaces?: number;
  thousandsSeparator?: string;
  customFormat?: string | IPropertySetting<string>;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
}
interface INumberFieldComponentCalculatedValues {
  defaultValue?: string;
  eventHandlers?: any;
  executeCustomFormat?: (value: unknown, code: string) => string;
}

export type NumberFieldComponentDefinition = ComponentDefinition<"numberField", INumberFieldComponentProps, INumberFieldComponentCalculatedValues>;

