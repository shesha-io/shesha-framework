import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface INumberFieldProps extends IConfigurableFormComponent {
  hideBorder?: boolean;
  min?: number;
  max?: number;
  highPrecision?: boolean;
  stepNumeric?: number;
  stepString?: string;
}
