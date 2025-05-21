import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormInstance } from 'antd';
import { CSSProperties } from 'react';
export interface IButtonGroupComponentProps extends IConfigurableFormComponent, IBaseButtonGroupProps {
}

export interface IButtonGroupProps extends IBaseButtonGroupProps, Omit<IStyleType, 'style'> {
  id: string;
  readOnly?: boolean;
  style?: CSSProperties;
  form?: FormInstance<any>;
}

export interface IBaseButtonGroupProps {
  items: ButtonGroupItemProps[];
  size?: SizeType;
  spaceSize?: SizeType;
  isInline?: boolean;
  noStyles?: boolean;
}
