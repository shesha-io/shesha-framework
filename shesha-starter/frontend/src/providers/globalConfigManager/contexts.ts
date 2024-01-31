import { createContext } from 'react';
import { IFlagsState, IFlagsSetters } from 'models';

export type IFlagProgressFlags = '__DEFAULT__' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = '__DEFAULT__' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = '__DEFAULT__' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface IGlobalConfigManagerStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {}

export interface IGlobalConfigManagerActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const GLOBAL_CONFIG_MANAGER_CONTEXT_INITIAL_STATE: IGlobalConfigManagerStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
};

export const GlobalConfigManagerStateContext = createContext<IGlobalConfigManagerStateContext>(
  GLOBAL_CONFIG_MANAGER_CONTEXT_INITIAL_STATE
);

export const GlobalConfigManagerActionsContext = createContext<IGlobalConfigManagerActionsContext>(undefined);
