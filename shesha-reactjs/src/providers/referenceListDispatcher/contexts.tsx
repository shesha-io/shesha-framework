import { IReferenceList, IReferenceListItem } from '@/interfaces/referenceList';
import { PromisedValue } from '@/utils/promises';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { createNamedContext } from '@/utils/react';

export interface IGetReferenceListPayload {
  refListId: IReferenceListIdentifier;
}

export interface IReferenceListDispatcherActionsContext {
  getReferenceList: (payload: IGetReferenceListPayload) => PromisedValue<IReferenceList>;
  getReferenceListItem: (moduleName: string, name: string, itemValue?: number) => Promise<IReferenceListItem>;
}

export const ReferenceListDispatcherActionsContext = createNamedContext<IReferenceListDispatcherActionsContext | undefined>(undefined, "ReferenceListDispatcherActionsContext");
