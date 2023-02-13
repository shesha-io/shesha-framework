import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ButtonGroupItemProps } from '../../../../providers/buttonGroupConfigurator/models';

export interface IButtonGroupProps extends IConfigurableFormComponent {
  items: ButtonGroupItemProps[];
  size?: SizeType;
  permissions?: string[];
  spaceSize?: SizeType;
}
