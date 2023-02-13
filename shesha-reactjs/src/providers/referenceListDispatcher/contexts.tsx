import { createContext } from 'react';
import { IReferenceList, IReferenceListItem } from '../../interfaces/referenceList';
import { PromisedValue } from '../../utils/promises';
import { IReferenceListIdentifier } from './models';

export interface IReferenceListDispatcherStateContext {
  activeProvider?: string;
}

export interface IGetReferenceListPayload {
  refListId: IReferenceListIdentifier;
}

export interface IReferenceListDispatcherActionsContext {
  getReferenceList: (payload: IGetReferenceListPayload) => PromisedValue<IReferenceList>;
  getReferenceListItem: (moduleName: string, name: string, itemValue?: number) => Promise<IReferenceListItem>;
}

/** initial state */
export const REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE: IReferenceListDispatcherStateContext = {
};

export const ReferenceListDispatcherStateContext = createContext<IReferenceListDispatcherStateContext>(REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE);

export const ReferenceListDispatcherActionsContext = createContext<IReferenceListDispatcherActionsContext>(undefined);