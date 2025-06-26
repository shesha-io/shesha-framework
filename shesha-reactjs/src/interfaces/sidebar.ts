import { IConfigurableActionConfiguration } from '@/providers/configurableActionsDispatcher/index';
import { ReactNode } from 'react';

export type SidebarItemType = 'button' | 'item' | 'divider' | 'group';
export type ButtonActionType = 'navigate' | 'dialogue' | 'executeScript' | 'executeFormAction';

export interface ISidebarMenuItemV0 {
  id: string;
  title: string;
  tooltip?: ReactNode | string;
  itemType: SidebarItemType;
  buttonAction?: ButtonActionType;
  target?: string;
  icon?: ReactNode | string;
  isHidden?: boolean;
  visibility?: string;
  requiredPermissions?: string[];
  isRootItem?: boolean;
  childItems?: ISidebarMenuItemV0[];
  selected?: boolean;
}

export interface ISidebarMenuItem {
  actionConfiguration?: IConfigurableActionConfiguration;
  id: string;
  title: string;
  tooltip?: ReactNode | string;
  itemType: SidebarItemType;

  icon?: ReactNode | string;
  hidden?: boolean;
  visibility?: string;
  requiredPermissions?: string[];
}

export interface ISidebarButton extends ISidebarMenuItem {
  actionConfiguration: IConfigurableActionConfiguration;
}

export interface ISidebarGroup extends ISidebarMenuItem {
  childItems?: ISidebarMenuItem[];
}

export const isSidebarGroup = (item: ISidebarMenuItem): item is ISidebarGroup => {
  return item && item.itemType === 'group';
};

export const isSidebarButton = (item: ISidebarMenuItem): item is ISidebarButton => {
  return item && item.itemType === 'button';
};

export const isSidebarDivider = (item: ISidebarMenuItem): item is ISidebarButton => {
  return item && item.itemType === 'divider';
};