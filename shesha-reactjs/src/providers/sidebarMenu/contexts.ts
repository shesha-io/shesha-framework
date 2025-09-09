import { IFlagsSetters } from '@/interfaces/flagsSetters';
import { IFlagsState } from '@/interfaces/flagsState';
import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { IHeaderAction } from './models';
import { createNamedContext } from '@/utils/react';

export type IFlagProgressFlags = 'fetchFileInfo';
export type IFlagSucceededFlags = 'fetchFileInfo';
export type IFlagErrorFlags = 'fetchFileInfo';
export type IFlagActionedFlags = '__DEFAULT__';

export interface ISidebarMenuStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  isExpanded: boolean;
  actions?: IHeaderAction[];
  accountDropdownListItems?: IHeaderAction[];
  items: ISidebarMenuItem[];
}

export interface ISidebarMenuActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  expand: () => void;
  collapse: () => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const SIDEBAR_MENU_CONTEXT_INITIAL_STATE: ISidebarMenuStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  isExpanded: false,
  items: [],
};

export const SidebarMenuStateContext = createNamedContext<ISidebarMenuStateContext>(SIDEBAR_MENU_CONTEXT_INITIAL_STATE, "SidebarMenuStateContext");

export const SidebarMenuActionsContext = createNamedContext<ISidebarMenuActionsContext>(undefined, "SidebarMenuActionsContext");

//#region temporary defaults provider

export interface ISidebarMenuDefaultsContext {
  items: ISidebarMenuItem[];
}
export const SidebarMenuDefaultsContext = createNamedContext<ISidebarMenuDefaultsContext>({ items: [] }, "SidebarMenuDefaultsContext");

//#endregion
