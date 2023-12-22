import { createContext } from 'react';
import { IFlagsState, IFlagsSetters } from '@/interfaces';

export type IFlagProgressFlags = 'filtering' | 'selectingColumns' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = '__DEFAULT__' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = '__DEFAULT__' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface IIndexViewStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {}

export interface IIndexViewActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  toggleIsSelectingColumns?: (val: boolean) => void;
  toggleIsFiltering?: (filtering: boolean) => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const INDEX_VIEW_CONTEXT_INITIAL_STATE: IIndexViewStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
};

export const IndexViewStateContext = createContext<IIndexViewStateContext>(INDEX_VIEW_CONTEXT_INITIAL_STATE);

export const IndexViewActionsContext = createContext<IIndexViewActionsContext>(undefined);
