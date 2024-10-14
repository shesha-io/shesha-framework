import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ISliderComponentProps extends IConfigurableFormComponent {
  defaultValue?: string;
  min?: string;
  max?: string;
}
