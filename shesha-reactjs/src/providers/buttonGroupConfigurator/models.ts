import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ButtonType } from 'antd/lib/button';
import { IConfigurableActionConfiguration } from '../../interfaces/configurableAction';
import { VisibilityType } from '..';

type ButtonGroupItemType = 'item' | 'group';

type ButtonGroupType = 'inline' | 'dropdown';

export type ButtonGroupItemProps = IButtonGroupButton | IButtonGroup;

export type ToolbarItemSubType = 'button' | 'separator' | 'line';

export type ButtonActionType =
  | 'navigate'
  | 'dialogue'
  | 'executeScript'
  | 'executeFormAction' // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  | 'customAction' // This is the new one. Old one is 'executeFormAction'
  | 'submit'
  | 'reset'
  | 'startFormEdit'
  | 'cancelFormEdit'
  | 'dispatchAnEvent';

export interface IButtonGroupItemBase {
  id: string;
  name: string;
  block?: boolean;
  label?: string | React.ReactNode;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isDynamic?: boolean;
  itemType: ButtonGroupItemType;
  groupType?: ButtonGroupType;
  icon?: string;
  buttonType?: ButtonType;
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  style?: string;
  size?: SizeType;
  visibility?: VisibilityType;
}

export interface IButtonGroupButton extends IButtonGroupItemBase {
  itemSubType: ToolbarItemSubType;
  actionConfiguration?: IConfigurableActionConfiguration;
}

export interface IButtonGroup extends IButtonGroupItemBase {
  childItems?: ButtonGroupItemProps[];
}
