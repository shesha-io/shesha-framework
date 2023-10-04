import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ButtonGroupItemProps } from '../../../../../providers/buttonGroupConfigurator/models';

export interface IButtonGroupComponentProps extends IConfigurableFormComponent {
  items: ButtonGroupItemProps[];
  size?: SizeType;
  permissions?: string[];
  spaceSize?: SizeType;
  isInline?: boolean;
  noStyles?: boolean;
}
