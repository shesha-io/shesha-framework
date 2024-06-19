import { IReferenceList, IReferenceListItem } from '@/interfaces/referenceList';
import { PromisedValue } from '@/utils/promises';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { createNamedContext } from '@/utils/react';

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
export const REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE: IReferenceListDispatcherStateContext = {};

export const ReferenceListDispatcherStateContext = createNamedContext<IReferenceListDispatcherStateContext>(
  REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE,
  "ReferenceListDispatcherStateContext"
);

export const ReferenceListDispatcherActionsContext = createNamedContext<IReferenceListDispatcherActionsContext>(undefined, "ReferenceListDispatcherActionsContext");
