import { ButtonType } from 'antd/lib/button';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IDynamicActionsConfiguration } from '@/designer-components/dynamicActionsConfigurator/models';
import { EditMode } from '@/index';
import { IFullAuditedEntity } from '@/publicJsApis/entities';

type ButtonGroupItemType = 'item' | 'group';

export type ButtonGroupItemProps = IButtonGroupItem | IButtonGroup;

export type ToolbarItemSubType = 'button' | 'separator' | 'line' | 'dynamic';

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
  isDynamic?: boolean;
  itemType: ButtonGroupItemType;
  icon?: string | React.ReactNode;
  iconPosition?: 'start' | 'end';
  downIcon?: string;
  buttonType?: ButtonType;
  ghost?: boolean;
  permissions?: string[];
  style?: string;
  size?: SizeType;
  editMode?: EditMode;
  readOnly?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'dotted' | 'solid' | 'dashed';
  borderRadius?: string;
}

export interface IButtonGroupItem extends IButtonGroupItemBase {
  itemSubType: ToolbarItemSubType;
}

export interface IButtonItem extends IButtonGroupItem {
  actionConfiguration?: IConfigurableActionConfiguration;
  dynamicItem?: IFullAuditedEntity;
}

export const isItem = (item: IButtonGroupItemBase): item is IButtonGroupItem => {
  return item && item.itemType === 'item';
};

export interface IButtonGroup extends IButtonGroupItemBase {
  /**
   * If true, indicates that the group should be hidden when it has no visible items
   */
  hideWhenEmpty?: boolean;
  /**
   * Child items (buttons or nested groups)
   */
  childItems?: ButtonGroupItemProps[];
}

export const isGroup = (item: IButtonGroupItemBase): item is IButtonGroup => {
  return item && item.itemType === 'group';
};

export interface IDynamicItem extends IButtonGroupItem {
  dynamicItemsConfiguration: IDynamicActionsConfiguration;
}

export const isDynamicItem = (item: IButtonGroupItemBase): item is IDynamicItem => {
  return isItem(item) && item.itemSubType === 'dynamic';
};

export const isButtonItem = (item: IButtonGroupItemBase): item is IButtonItem => {
  return isItem(item) && item.itemSubType === 'button';
};