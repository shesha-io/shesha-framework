import { ReactNode } from 'react';

export type SidebarItemType = 'button' | 'separator' | 'group';
export type ButtonActionType = 'navigate' | 'dialogue' | 'executeScript' | 'executeFormAction';

export interface ISidebarMenuItem {
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
  childItems?: ISidebarMenuItem[];
  selected?: boolean;
}
