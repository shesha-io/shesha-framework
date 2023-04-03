import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface INumberFieldComponentProps extends IConfigurableFormComponent {
  hideBorder?: boolean;
  min?: number;
  max?: number;
  highPrecision?: boolean;
  stepNumeric?: number;
  stepString?: string;
}
