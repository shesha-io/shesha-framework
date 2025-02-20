import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent {
  value?: boolean;
  defaultValue?: boolean;
}