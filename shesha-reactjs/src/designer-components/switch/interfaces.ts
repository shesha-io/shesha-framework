import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';

export interface ISwitchComponentProps extends IConfigurableFormComponent, IStyleType {
  value?: boolean;
  defaultValue?: boolean;
  defaultChecked?: boolean;
}
