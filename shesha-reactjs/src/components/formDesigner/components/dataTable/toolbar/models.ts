import { IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ToolbarItemProps } from '../../../../../providers/toolbarConfigurator/models';

export interface IToolbarProps extends IConfigurableFormComponent {
  items: ToolbarItemProps[];
}
