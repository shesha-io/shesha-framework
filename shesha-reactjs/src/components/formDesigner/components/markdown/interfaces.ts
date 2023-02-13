import { IConfigurableFormComponent } from '../../../../interfaces';

export interface IMarkdownProps extends IConfigurableFormComponent {
  content: string;
  textColor?: string;
  remarkPlugins?: string[];
}
