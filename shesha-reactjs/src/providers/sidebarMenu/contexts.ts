import { createContext } from 'react';
import { IFlagsSetters } from '../../interfaces/flagsSetters';
import { IFlagsState } from '../../interfaces/flagsState';
import { ISidebarMenuItem } from '../../interfaces/sidebar';
import { IHeaderAction } from './models';
import { getLocalStorage } from 'utils/storage';
import { SIDEBAR_COLLAPSE } from 'components/mainLayout/constant';

export type IFlagProgressFlags = 'fetchFileInfo' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'fetchFileInfo' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'fetchFileInfo' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface ISidebarMenuStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  isExpanded: boolean;
  actions?: IHeaderAction[];
  accountDropdownListItems?: IHeaderAction[];
}

export interface ISidebarMenuActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  expand: () => void;
  collapse: () => void;
  isItemVisible: (item: ISidebarMenuItem) => boolean;
  getItems: () => ISidebarMenuItem[];
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const SIDEBAR_MENU_CONTEXT_INITIAL_STATE: ISidebarMenuStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  isExpanded: !JSON.parse(getLocalStorage()?.getItem(SIDEBAR_COLLAPSE)),
};

export const SidebarMenuStateContext = createContext<ISidebarMenuStateContext>(SIDEBAR_MENU_CONTEXT_INITIAL_STATE);

export const SidebarMenuActionsContext = createContext<ISidebarMenuActionsContext>(undefined);

//#region temporary defaults provider

export interface ISidebarMenuDefaultsContext {
  items: ISidebarMenuItem[];
}
export const SidebarMenuDefaultsContext = createContext<ISidebarMenuDefaultsContext>({ items: [] });

//#endregion
