import { ButtonType } from 'antd/es/button/buttonHelpers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IDynamicActionsConfiguration } from '@/designer-components/dynamicActionsConfigurator/models';
import { EditMode, IStyleType } from '@/index';
import React from 'react';
import { IFullAuditedEntity } from '@/publicJsApis/entities';
import { ListItemWithId } from '@/components/listEditor/models';
import { isDefined } from '@/utils/nullables';

type ButtonGroupItemType = 'item' | 'group';

export type ButtonGroupItemProps = IButtonGroupItem | IButtonGroup;

export type ToolbarItemSubType = 'button' | 'separator' | 'line' | 'dynamic';

export type ButtonActionType =
  | 'navigate' |
  'dialogue' |
  'executeScript' |
  'executeFormAction' | // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  'customAction' | // This is the new one. Old one is 'executeFormAction'
  'submit' |
  'reset' |
  'startFormEdit' |
  'cancelFormEdit' |
  'dispatchAnEvent';

export interface IButtonGroupItemBase extends IStyleType {
  id: string;
  name?: string | undefined;
  block?: boolean | undefined;
  label?: string | React.ReactNode;
  tooltip?: string | undefined;
  sortOrder?: number | undefined;
  danger?: boolean | undefined;
  hidden?: boolean | undefined;
  isDynamic?: boolean | undefined;
  itemType?: ButtonGroupItemType | undefined;
  icon?: string | React.ReactNode | undefined;
  iconPosition?: 'start' | 'end' | undefined;
  downIcon?: string | undefined;
  buttonType?: ButtonType | 'ghost' | undefined;
  ghost?: boolean | undefined;
  permissions?: string[] | undefined;
  size?: SizeType | undefined;
  editMode?: EditMode | undefined;
  readOnly?: boolean | undefined;
  width?: string | undefined;
  height?: string | undefined;
  backgroundColor?: string | undefined;
  fontSize?: number | undefined | undefined;
  color?: string | undefined;
  fontWeight?: string | undefined;
  borderWidth?: string | undefined;
  borderColor?: string | undefined;
  borderStyle?: 'dotted' | 'solid' | 'dashed' | undefined;
  borderRadius?: number | undefined;
  styles?: React.CSSProperties | undefined;
}

export interface IButtonGroupItem extends IButtonGroupItemBase, ListItemWithId {
  itemSubType?: ToolbarItemSubType;
  styles?: React.CSSProperties;
  dividerWidth?: string;
  dividerColor?: string;
  actionConfiguration?: IConfigurableActionConfiguration;
}

export interface IButtonItem extends Omit<IButtonGroupItem, 'type'> {
  actionConfiguration?: IConfigurableActionConfiguration;
  dynamicItem?: IFullAuditedEntity;
}

export const isItem = (item: IButtonGroupItemBase | undefined): item is IButtonGroupItem => {
  return isDefined(item) && item.itemType === 'item';
};

export interface IButtonGroup extends IButtonGroupItemBase {
  /**
   * If true, indicates that the group should be hidden when it has no visible items
   */
  hideWhenEmpty?: boolean;
  /**
   * Child items (buttons or nested groups)
   */
  childItems?: ButtonGroupItemProps[] | undefined;
}

export const isGroup = (item: IButtonGroupItemBase | undefined): item is IButtonGroup => {
  return isDefined(item) && item.itemType === 'group';
};

export interface IDynamicItem extends IButtonGroupItem {
  dynamicItemsConfiguration: IDynamicActionsConfiguration | undefined;
}

export const isDynamicItem = (item: IButtonGroupItemBase): item is IDynamicItem => {
  return isItem(item) && item.itemSubType === 'dynamic';
};

export const isButtonItem = (item: IButtonGroupItemBase): item is IButtonItem => {
  return isItem(item) && item.itemSubType === 'button';
};
