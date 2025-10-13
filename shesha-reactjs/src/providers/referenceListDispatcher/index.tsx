import React, { FC, PropsWithChildren, useContext, useEffect, useRef, /* useRef,*/ useState } from 'react';
import { IReferenceList, IReferenceListItem, IReferenceListIdentifier } from '@/interfaces/referenceList';
import { PromisedValue, StatefulPromise } from '@/utils/promises';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import {
  IGetReferenceListPayload,
  IReferenceListDispatcherActionsContext,
  ReferenceListDispatcherActionsContext,
} from './contexts';
import { ILoadingState } from './models';

import { isDefined } from '@/utils/nullables';

const ReferenceListDispatcherProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const loader = useConfigurationItemsLoader();


  const getReferenceList = (payload: IGetReferenceListPayload): PromisedValue<IReferenceList> => {
    return loader.getRefList({
      refListId: payload.refListId,
      skipCache: false,
    });
  };

  const getReferenceListItem = (moduleName: string, name: string, itemValue?: number): Promise<IReferenceListItem> => {
    return getReferenceList({ refListId: { module: moduleName, name: name } }).promise.then((list) => {
      const item = list.items.find((i) => i.itemValue === itemValue);
      if (!isDefined(item))
        throw new Error(`Item with value ${itemValue} not found in reference list '${moduleName}.${name}'`);
      return item;
    });
  };

  const referenceListActions: IReferenceListDispatcherActionsContext = {
    getReferenceList,
    getReferenceListItem,
    /* NEW_ACTION_GOES_HERE */
  };

  return (
    <ReferenceListDispatcherActionsContext.Provider value={referenceListActions}>
      {children}
    </ReferenceListDispatcherActionsContext.Provider>
  );
};

const useReferenceListDispatcher = (): IReferenceListDispatcherActionsContext => {
  const context = useContext(ReferenceListDispatcherActionsContext);

  if (context === undefined) {
    throw new Error('useReferenceListDispatcherActions must be used within a ReferenceListDispatcherProvider');
  }

  return context;
};

const getRefListItemByValue = (list: IReferenceList, itemValue: number | null | undefined): IReferenceListItem | undefined => {
  return itemValue === null || itemValue === undefined
    ? undefined
    : list.items.find((i) => i.itemValue === itemValue);
};

const makeRefListIdNotSpecifiedPromise = (): PromisedValue<IReferenceList> => {
  return new StatefulPromise(Promise.reject<IReferenceList>("Reference List identifier must be specified"));
};

const useReferenceList = (refListId: IReferenceListIdentifier): ILoadingState<IReferenceList> => {
  const { getReferenceList } = useReferenceListDispatcher();
  const failedPromise = useRef<PromisedValue<IReferenceList>>();

  const refListPromise = isDefined(refListId)
    ? getReferenceList({ refListId: refListId })
    : failedPromise.current ?? (failedPromise.current = makeRefListIdNotSpecifiedPromise());

  const [state, setState] = useState<ILoadingState<IReferenceList>>({
    data: refListPromise.value,
    loading: refListPromise.isPending,
    error: refListPromise.error,
  });

  useEffect(() => {
    const updateState = (): void => {
      setState({
        data: refListPromise.value,
        loading: refListPromise.isPending,
        error: refListPromise.error,
      });
    };

    // if the reflist is not loaded on first rendering - use promise to return data
    if (refListPromise.isPending)
      refListPromise.promise
        .then(() => {
          updateState();
        })
        .catch(() => {
          updateState();
        });
    else
      updateState();
  }, [refListPromise]);

  return state;
};

const useReferenceListItem = (
  moduleName: string,
  listName: string,
  itemValue?: number,
): ILoadingState<IReferenceListItem> => {
  const { getReferenceList } = useReferenceListDispatcher();

  const refListPromise = getReferenceList({ refListId: { module: moduleName, name: listName } });
  const loadedItem = refListPromise.isResolved && isDefined(refListPromise.value)
    ? getRefListItemByValue(refListPromise.value, itemValue)
    : undefined;

  const [data, setData] = useState<IReferenceListItem | undefined>(loadedItem);

  if (refListPromise.isPending)
    refListPromise.promise.then((list) => {
      const item = getRefListItemByValue(list, itemValue);
      setData(item);
    });

  useEffect(() => {
    refListPromise.promise.then((list) => {
      const item = getRefListItemByValue(list, itemValue);
      setData(item);
    });
  }, [itemValue, refListPromise.promise]);

  const result: ILoadingState<IReferenceListItem> = {
    data,
    loading: refListPromise.isPending,
    error: refListPromise.error,
  };
  return result;
};

export { ReferenceListDispatcherProvider, useReferenceList, useReferenceListDispatcher, useReferenceListItem };
