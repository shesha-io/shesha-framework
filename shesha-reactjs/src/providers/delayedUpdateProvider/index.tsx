import React, { FC, PropsWithChildren, useContext, useState, useCallback } from 'react';
import {
  DelayedUpdateProviderActionsContext,
  DelayedUpdateProviderStateContext,
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE,
  IDelayedUpdateStateContext,
} from './context';

interface IDelayedUpdateProps {}

const DelayedUpdateProvider: FC<PropsWithChildren<IDelayedUpdateProps>> = ({ children }) => {
  const [state, setState] = useState<IDelayedUpdateStateContext>(DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE);

  const addItem = useCallback((groupName: string, id: unknown, data?: unknown) => {
    setState((prevState) => {
      const group = prevState.groups?.find((x) => x.name === groupName);
      if (!group) {
        // Create new group with the item
        return {
          ...prevState,
          groups: [...prevState.groups, { name: groupName, items: [{ id, data }] }]
        };
      }

      const item = group.items?.find((x) => x.id === id);
      if (item) {
        // Update existing item
        return {
          ...prevState,
          groups: prevState.groups.map((gr) =>
            gr.name === groupName
              ? { ...gr, items: gr.items.map((it) => it.id === id ? { id, data } : it) }
              : gr
          ),
        };
      }

      // Add new item to existing group
      return {
        ...prevState,
        groups: prevState.groups.map((gr) =>
          gr.name === groupName
            ? { ...gr, items: [...gr.items, { id, data }] }
            : gr
        ),
      };
    });
  }, []);

  const removeItem = useCallback((groupName: string, id: unknown) => {
    setState((prevState) => {
      const group = prevState.groups.find((x) => x.name === groupName);
      if (!group) {
        return prevState;
      }
      const item = group.items.find((x) => x.id === id);
      if (!item) {
        return prevState;
      }
      return {
        ...prevState,
        groups: prevState.groups.map((gr) =>
          gr.name === groupName
            ? { ...gr, items: gr.items.filter((it) => it.id !== id) }
            : gr,
        ),
      };
    });
  }, []);

  const getPayload = useCallback(() => {
    const obj = [...state.groups?.filter((g) => g.items?.length > 0)];
    return obj.length > 0 ? obj : undefined;
  }, [state]);

  return (
    <DelayedUpdateProviderStateContext.Provider value={state}>
      <DelayedUpdateProviderActionsContext.Provider
        value={{
          addItem,
          removeItem,
          getPayload,
        }}
      >
        {children}
      </DelayedUpdateProviderActionsContext.Provider>
    </DelayedUpdateProviderStateContext.Provider>
  );
};

const useDelayedUpdate = (require: boolean = true) => {
  const actionsContext = useContext(DelayedUpdateProviderActionsContext);
  const stateContext = useContext(DelayedUpdateProviderStateContext);

  if ((actionsContext === undefined || actionsContext === undefined) && require) {
    throw new Error('useDelayedUpdate must be used within a DelayedUpdateProvider');
  }
  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

export { DelayedUpdateProvider, useDelayedUpdate };
