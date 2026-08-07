import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { MenuProps } from 'antd';
import { CSSProperties } from 'react';

export interface IButtonGroupComponentProps extends IConfigurableFormComponent, IBaseButtonGroupProps {
}

export interface IButtonGroupProps extends IBaseButtonGroupProps, IStyleValue {
  id: string;
  readOnly?: boolean | undefined;
}

export interface IBaseButtonGroupProps {
  items: ButtonGroupItemProps[];
  size?: SizeType | undefined;
  spaceSize?: SizeType | undefined;
  /** @deprecated use buttonGroupStyle instead */
  isInline?: boolean | undefined;
  buttonGroupStyle?: 'horizontal' | 'menu' | undefined;
  noStyles?: boolean | undefined;
  styles?: CSSProperties | undefined;
  gap?: SizeType | undefined;
}

export type MenuItem = Required<MenuProps>['items'][number];

export type MenuButton = ButtonGroupItemProps & {
  childItems?: MenuButton[] | undefined;
  dividerWidth?: string | undefined;
  dividerColor?: string | undefined;
};

export type VisibilityEvaluator = (item: ButtonGroupItemProps) => boolean;
