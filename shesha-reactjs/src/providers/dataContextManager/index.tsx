import React, { FC, PropsWithChildren, useState } from "react";
import { IDataContextManagerActions, IDataContextManagerFullInstance, IDataContextManagerState } from "./models";
import { createNamedContext } from "@/utils/react";
import { DataContextManagerInstance } from "./instance";
import { useDataContextManager, useDataContextManagerOrUndefined, useDataManagerRegister } from "./hooks";

export const DataContextTopLevels = {
  /** Only aplication root contexts */
  Root: 'root',
  /** All contexts from this Data context manager */
  All: 'all',
  /** All available contexts */
  Full: 'full',
};

export const RootContexts: string[] = [];

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerState = { lastUpdate: 0, id: '' };

export const DataContextManagerUpdateContext = createNamedContext<object>({}, "DataContextManagerUpdateContext");
export const DataContextManagerStateContext = createNamedContext<IDataContextManagerState | undefined>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, "DataContextManagerStateContext");
export const DataContextManagerActionsContext = createNamedContext<IDataContextManagerActions | undefined>(undefined, "DataContextManagerActionsContext");

export interface IDataContextManagerProps {
  id: string;
}

const DataManagerAccessor: FC<PropsWithChildren<Omit<IDataContextManagerProps, 'id'>>> = ({ children }) => {
  const manager = useDataContextManager();
  useDataManagerRegister(manager);
  return children;
};

export const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ id, children }) => {
  const parent = useDataContextManagerOrUndefined();
  const [state, setState] = useState<IDataContextManagerState>({ ...DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, id, parent: parent });
  const internalUpdate = (): void => setState({ ...state, lastUpdate: Date.now() });
  const [instance] = useState<IDataContextManagerFullInstance>(() => new DataContextManagerInstance(id, parent, internalUpdate));

  // ToDo: AS - review and remove
  /* if (isRoot()) {
    dataContextsManagerActions.getRoot = () => {
      return { ...state, ...dataContextsManagerActions };
    };
  }*/

  return (
    <DataContextManagerActionsContext.Provider value={instance}>
      <DataContextManagerStateContext.Provider value={state}>
        <DataManagerAccessor>
          {children}
        </DataManagerAccessor>
      </DataContextManagerStateContext.Provider>
    </DataContextManagerActionsContext.Provider>
  );
};
