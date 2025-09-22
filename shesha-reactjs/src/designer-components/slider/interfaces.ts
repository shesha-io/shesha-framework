import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ISliderComponentProps extends IConfigurableFormComponent {
  min?: string;
  max?: string;
}
