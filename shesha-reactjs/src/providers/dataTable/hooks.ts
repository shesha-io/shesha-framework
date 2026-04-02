import { useContext, useEffect, useRef, useState } from "react";
import { DatasetInstance } from "./instance";
import { IDatasetInstance } from "./models";
import { IRepository } from "./repository/interfaces";
import { DataFetchDependency, DataFetchDependencyStateSwitcher, DatasetEvents } from "./interfaces";
import { IDataTableStateContext } from "./interfaces.state";
import { DataTableActionsContext, DataTableStateContext, IDataTableActionsContext } from "./contexts";
import { throwError } from "@/utils/errors";
import { asyncStorage } from "@/configuration-studio/storage";

export const useDatasetInstance = (repository: IRepository): IDatasetInstance => {
  const [instance] = useState(() => {
    return new DatasetInstance({
      repository,
      logEnabled: false,
      storage: asyncStorage,
    });
  });

  return instance;
};

const useDataset = (): IDatasetInstance => {
  return useDataTableActions() as IDatasetInstance; // TODO: remove cast when refactoring is done
};

export const useDatasetSubscription = (eventType: DatasetEvents): object => {
  const instance = useDataset();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    return instance.subscribe(eventType, () => forceUpdate({}));
  }, [instance, eventType]);

  return dummy;
};

const useDataTableStateOrUndefined = (): IDataTableStateContext | undefined => useContext(DataTableStateContext);
const useDataTableState = (): IDataTableStateContext => useDataTableStateOrUndefined() ?? throwError("useDataTableState must be used within a DataTableProvider");

const useDataTableActionsOrUndefined = (): IDataTableActionsContext | undefined => useContext(DataTableActionsContext);
const useDataTableActions = (): IDataTableActionsContext => useDataTableActionsOrUndefined() ?? throwError("useDataTableActions must be used within a DataTableProvider");

const useDataTableStoreOrUndefined = (): IDataTableStateContext & IDataTableActionsContext | undefined => {
  const actionsContext = useDataTableActionsOrUndefined();
  const stateContext = useDataTableStateOrUndefined();
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};
const useDataTableStore = (): IDataTableStateContext & IDataTableActionsContext => useDataTableStoreOrUndefined() ?? throwError("useDataTableStore must be used within a DataTableProvider");

/**
 * Define a dependency of the data fetching. Is used by the components which require some preparation logic before the data can be fetched by the DataTable context
 */
const useDataFetchDependency = (ownerId: string): DataFetchDependencyStateSwitcher => {
  const depState = useRef<DataFetchDependency>({ state: 'waiting' });
  const { registerDataFetchDependency, unregisterDataFetchDependency } = useDataTableStore();

  // dependency should be affected immediately
  registerDataFetchDependency(ownerId, depState.current);
  useEffect(() => {
    registerDataFetchDependency(ownerId, depState.current);

    return () => {
      unregisterDataFetchDependency(ownerId);
    };
  }, [ownerId, registerDataFetchDependency, unregisterDataFetchDependency]);

  // switcher is just a syntactical sugar
  const switcher: DataFetchDependencyStateSwitcher = {
    ready: () => {
      depState.current.state = 'ready';
    },
    waiting: () => {
      depState.current.state = 'waiting';
    },
  };
  return switcher;
};

export const useDatasetState = (): IDataTableStateContext => {
  const instance = useDataset();
  useDatasetSubscription('data');
  return instance.state;
};

export {
  useDataTableStateOrUndefined,
  useDataTableState,
  useDataTableActionsOrUndefined,
  useDataTableActions,
  useDataTableStoreOrUndefined,
  useDataTableStore,
  useDataFetchDependency,
};
