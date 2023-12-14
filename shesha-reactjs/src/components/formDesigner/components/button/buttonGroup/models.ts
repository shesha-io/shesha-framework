import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

export interface IButtonGroupComponentProps extends IConfigurableFormComponent, IBaseButtonGroupProps {
  permissions?: string[];
}

export interface IButtonGroupProps extends IBaseButtonGroupProps {
  id: string;
  disabled?: boolean;
}

export interface IBaseButtonGroupProps {
  items: ButtonGroupItemProps[];
  size?: SizeType;
  spaceSize?: SizeType;
  isInline?: boolean;
  noStyles?: boolean;
}
