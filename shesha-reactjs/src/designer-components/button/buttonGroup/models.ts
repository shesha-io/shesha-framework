import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormInstance } from 'antd';
import { CSSProperties } from 'react';

export interface IButtonGroupComponentProps extends IConfigurableFormComponent, IBaseButtonGroupProps {
}

export interface IButtonGroupProps extends IBaseButtonGroupProps, IStyleType {
  id: string;
  readOnly?: boolean | undefined;
  form?: FormInstance | undefined;
}

export interface IBaseButtonGroupProps {
  items: ButtonGroupItemProps[];
  size?: SizeType | undefined;
  spaceSize?: SizeType | undefined;
  isInline?: boolean | undefined;
  noStyles?: boolean | undefined;
  styles?: CSSProperties | undefined;
  gap?: SizeType | undefined;
}
