import React, { FC, PropsWithChildren, useContext, useEffect, /*useRef,*/ useState } from 'react';
import useThunkReducer from '@/hooks/thunkReducer';
import { IReferenceList, IReferenceListItem } from '@/interfaces/referenceList';
import { PromisedValue } from '@/utils/promises';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import {
  IGetReferenceListPayload,
  IReferenceListDispatcherActionsContext,
  IReferenceListDispatcherStateContext,
  REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE,
  ReferenceListDispatcherActionsContext,
  ReferenceListDispatcherStateContext,
} from './contexts';
import { ILoadingState } from './models';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import metadataReducer from './reducer';

export interface IReferenceListDispatcherProviderProps { }

const ReferenceListDispatcherProvider: FC<PropsWithChildren<IReferenceListDispatcherProviderProps>> = ({
  children,
}) => {
  const initial: IReferenceListDispatcherStateContext = {
    ...REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE,
  };

  const loader = useConfigurationItemsLoader();
  const { configurationItemMode } = useAppConfigurator();

  const [state] = useThunkReducer(metadataReducer, initial);

  const getReferenceList = (payload: IGetReferenceListPayload): PromisedValue<IReferenceList> => {
    return loader.getRefList({
      refListId: payload.refListId,
      skipCache: false,
      configurationItemMode: configurationItemMode,
    });
  };

  const getReferenceListItem = (moduleName: string, name: string, itemValue?: number): Promise<IReferenceListItem> => {
    return getReferenceList({ refListId: { module: moduleName, name: name } }).promise.then((list) => {
      return list.items.find((i) => i.itemValue === itemValue);
    });
  };

  const referenceListActions: IReferenceListDispatcherActionsContext = {
    getReferenceList,
    getReferenceListItem,
    /* NEW_ACTION_GOES_HERE */
  };

  return (
    <ReferenceListDispatcherStateContext.Provider value={state}>
      <ReferenceListDispatcherActionsContext.Provider value={referenceListActions}>
        {children}
      </ReferenceListDispatcherActionsContext.Provider>
    </ReferenceListDispatcherStateContext.Provider>
  );
};

function useReferenceListDispatcherState(require: boolean) {
  const context = useContext(ReferenceListDispatcherStateContext);

  if (context === undefined && require) {
    throw new Error('useReferenceListDispatcherState must be used within a ReferenceListDispatcherProvider');
  }

  return context;
}

function useReferenceListDispatcherActions(require: boolean) {
  const context = useContext(ReferenceListDispatcherActionsContext);

  if (context === undefined && require) {
    throw new Error('useReferenceListDispatcherActions must be used within a ReferenceListDispatcherProvider');
  }

  return context;
}

function useReferenceListDispatcher(require: boolean = true) {
  const actionsContext = useReferenceListDispatcherActions(require);
  const stateContext = useReferenceListDispatcherState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

const getRefListItemByValue = (list: IReferenceList, itemValue?: number): IReferenceListItem => {
  return !list || itemValue === null || itemValue === undefined
    ? null
    : list.items.find((i) => i.itemValue === itemValue);
};

const useReferenceList = (refListId: IReferenceListIdentifier): ILoadingState<IReferenceList> => {
  const { getReferenceList } = useReferenceListDispatcher();
  const refListPromise = getReferenceList({ refListId: refListId });

  const [state, setState] = useState<ILoadingState<IReferenceList>>({
    data: refListPromise.value,
    loading: refListPromise.isPending,
    error: refListPromise.error,
  });

  const updateState = () => {
    setState({
      data: refListPromise.value,
      loading: refListPromise.isPending,
      error: refListPromise.error,
    });
  };

  useEffect(() => {
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
  itemValue?: number
): ILoadingState<IReferenceListItem> => {
  const { getReferenceList } = useReferenceListDispatcher();

  const refListPromise = getReferenceList({ refListId: { module: moduleName, name: listName } });
  const loadedItem = refListPromise.isResolved ? getRefListItemByValue(refListPromise.value, itemValue) : null;

  const [data, setData] = useState<IReferenceListItem>(loadedItem);

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
  }, [itemValue]);

  const result: ILoadingState<IReferenceListItem> = {
    data,
    loading: refListPromise.isPending,
    error: refListPromise.error,
  };
  return result;
};

export { ReferenceListDispatcherProvider, useReferenceList, useReferenceListDispatcher, useReferenceListItem };
