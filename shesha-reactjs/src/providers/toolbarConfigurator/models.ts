import { ButtonType } from 'antd/lib/button';
import { IConfigurableActionConfiguration } from '../../interfaces/configurableAction';

type ToolbarItemType = 'item' | 'group';

type ButtonGroupType = 'inline' | 'dropdown';

export type ToolbarItemProps = IToolbarButton | IButtonGroup;

type ToolbarItemSubType = 'button' | 'separator' | 'line';
type ButtonActionType =
  | 'navigate'
  | 'dialogue'
  | 'executeScript'
  | 'executeFormAction' // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  | 'customAction' // This is the new one. Old one is 'executeFormAction'
  | 'dispatchAnEvent'
  | 'submit'
  | 'reset'
  | 'startFormEdit'
  | 'cancelFormEdit';

export interface IToolbarItemBase {
  id: string;
  name: string;
  label: string;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  itemType: ToolbarItemType;
  groupType?: ButtonGroupType;
  icon?: string;
  buttonType?: ButtonType;
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
}

export interface IToolbarButton extends IToolbarItemBase {
  itemSubType: ToolbarItemSubType;
  buttonAction?: ButtonActionType;
  actionConfiguration?: IConfigurableActionConfiguration;
}

export interface IButtonGroup extends IToolbarItemBase {
  childItems?: ToolbarItemProps[];
}
