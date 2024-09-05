import React, { FC, PropsWithChildren, useContext, useState, useCallback } from 'react';
import {
  DeferredUpdateProviderActionsContext,
  DeferredUpdateProviderStateContext,
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE,
  IDeferredUpdateStateContext,
} from './context';

interface IDeferredUpdateProps {}

const DeferredUpdateProvider: FC<PropsWithChildren<IDeferredUpdateProps>> = ({ children }) => {
  const [state, setState] = useState<IDeferredUpdateStateContext>(DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE);

  const addItem = useCallback((groupName: string, id: any, data?: any) => {
    const group = state.groups?.find((x) => x.name === groupName);
    if (Boolean(group)) {
      const item = group.items?.find((x) => x.id === id);
      if (Boolean(item)) {
        setState({
          groups: [
            ...state.groups.map((gr) => {
              return gr.name === groupName
                ? {
                    name: groupName,
                    items: [
                      ...gr.items.map((it) => {
                        return it.id === id ? { id, data } : it;
                      }),
                    ],
                  }
                : gr;
            }),
          ],
        });
      } else {
        setState({
          groups: [
            ...state.groups.map((gr) => {
              return gr.name === groupName ? { ...gr, items: [...gr.items, { id, data }] } : gr;
            }),
          ],
        });
      }
    } else {
      setState({ groups: [...state.groups, { name: groupName, items: [{ id, data }] }] });
    }
  }, [state]);

  const removeItem = useCallback((groupName: string, id: any) => {
    const group = state.groups.find((x) => x.name === groupName);
    if (Boolean(group)) {
      const item = group.items.find((x) => x.id === id);
      if (Boolean(item)) {
        setState({
          groups: [
            ...state.groups.map((gr) => {
              return gr.name === groupName
                ? { name: groupName, items: [...gr.items.filter((it) => it.id !== id)] }
                : gr;
            }),
          ],
        });
      }
    }
  }, [state]);

  const getPayload = useCallback(() => {
    const obj = [...state.groups?.filter((g) => g.items?.length > 0)];
    return obj.length > 0 ? obj : undefined;
  }, [state]);

  return (
    <DeferredUpdateProviderStateContext.Provider value={state}>
      <DeferredUpdateProviderActionsContext.Provider
        value={{
          addItem,
          removeItem,
          getPayload,
        }}
      >
        {children}
      </DeferredUpdateProviderActionsContext.Provider>
    </DeferredUpdateProviderStateContext.Provider>
  );
};

const useDeferredUpdate = (require: boolean = true) => {
  const actionsContext = useContext(DeferredUpdateProviderActionsContext);
  const stateContext = useContext(DeferredUpdateProviderStateContext);

  if ((actionsContext === undefined || actionsContext === undefined) && require) {
    throw new Error('useDeferredUpdate must be used within a DeferredUpdateProvider');
  }
  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

export { DeferredUpdateProvider, useDeferredUpdate };
