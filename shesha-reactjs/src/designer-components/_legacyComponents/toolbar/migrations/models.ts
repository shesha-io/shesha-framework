import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IConfigurableFormComponent } from "@/interfaces/index";
import { ButtonType } from "antd/lib/button";

export type ButtonGroupItemType = 'item' | 'group';
export type ToolbarItemSubType = 'button' | 'separator' | 'line' | 'dynamic';

export interface IToolbarProps extends IConfigurableFormComponent {
  items: ToolbarItemProps[];
}

interface IToolbarItemBase {
  id: string;
  name: string;
  label: string;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  itemType: ToolbarItemType;
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

type ButtonActionType =
  | 'navigate' |
  'dialogue' |
  'executeScript' |
  'executeFormAction' | // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  'customAction' | // This is the new one. Old one is 'executeFormAction'
  'dispatchAnEvent' |
  'submit' |
  'reset' |
  'startFormEdit' |
  'cancelFormEdit';

type ToolbarItemType = 'item' | 'group';

export type ToolbarItemProps = IToolbarButton | IButtonGroup;

interface IButtonGroup extends IToolbarItemBase {
  childItems?: ToolbarItemProps[];
}
