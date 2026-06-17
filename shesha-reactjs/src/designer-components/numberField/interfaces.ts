import { IconType } from '@/components/shaIcon';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles, IPropertySetting, IStyleType } from '@/providers/form/models';

export interface INumberFieldComponentPropsV1 extends IConfigurableFormComponent, IInputStyles, IStyleType {
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

export interface INumberFieldComponentProps extends IConfigurableFormComponent, IInputStyles, IStyleType {
  numberFormat?: NumberFieldFormat | undefined;
  hideBorder?: boolean | undefined;
  highPrecision?: boolean | undefined;
  numDecimalPlaces?: number | undefined;
  thousandsSeparator?: string | undefined;
  customFormat?: string | IPropertySetting<string>;
  placeholder?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  suffixIcon?: IconType | undefined;
  prefixIcon?: IconType | undefined;
}
interface INumberFieldComponentCalculatedValues {
  executeCustomFormat?: (value: unknown, code: string) => string;
}

export type NumberFieldComponentDefinition = ComponentDefinition<"numberField", INumberFieldComponentProps, INumberFieldComponentCalculatedValues>;

