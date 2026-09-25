import { IConfigurableFormComponent } from '@/providers/form/models';

/**
 * Value handled by a number field.
 *
 * High precision fields drive the underlying `InputNumber` in `stringMode`, so the value is kept as a
 * string in that case to avoid losing precision - hence this is not just `number`.
 */
export type NumberFieldValue = number | string | null | undefined;

export interface INumberFieldComponentProps extends IConfigurableFormComponent {
  hideBorder?: boolean;
  min?: number;
  max?: number;
  highPrecision?: boolean;
  stepNumeric?: number;
  stepString?: string;
  placeholder?: string;
}
