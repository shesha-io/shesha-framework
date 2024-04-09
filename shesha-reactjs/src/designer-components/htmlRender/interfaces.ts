import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IHtmlComponentProps extends IConfigurableFormComponent {
  renderer?: string;
}
