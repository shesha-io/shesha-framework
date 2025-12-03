import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import {
  DelayedUpdateProviderActionsContext,
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE,
  IDelayedUpdateStateContext,
  IDelayedUpdateActionContext,
} from './context';
import { IDelayedUpdateGroup } from './models';

const DelayedUpdateProvider: FC<PropsWithChildren> = ({ children }) => {
  const state = useRef<IDelayedUpdateStateContext>(DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE);

  const addItem = (groupName: string, id: any, data?: any): void => {
    const group = state.current.groups?.find((x) => x.name === groupName);
    if (Boolean(group)) {
      const item = group.items?.find((x) => x.id === id);
      if (Boolean(item)) {
        state.current = {
          groups: [
            ...state.current.groups.map((gr) => {
              return gr.name === groupName
                ? {
                  name: groupName,
                  items: [...gr.items.map((it) => it.id === id ? { id, data } : it),
                  ],
                }
                : gr;
            }),
          ],
        };
      } else {
        state.current = {
          groups: [
            ...state.current.groups.map((gr) => gr.name === groupName ? { ...gr, items: [...gr.items, { id, data }] } : gr),
          ],
        };
      }
    } else {
      state.current = { groups: [...state.current.groups, { name: groupName, items: [{ id, data }] }] };
    }
  };

  const removeItem = (groupName: string, id: any): void => {
    const group = state.current.groups.find((x) => x.name === groupName);
    if (Boolean(group)) {
      const item = group.items.find((x) => x.id === id);
      if (Boolean(item)) {
        state.current = {
          groups: [
            ...state.current.groups.map((gr) => {
              return gr.name === groupName
                ? { name: groupName, items: [...gr.items.filter((it) => it.id !== id)] }
                : gr;
            }),
          ],
        };
      }
    }
  };

  const getPayload = (): IDelayedUpdateGroup[] | undefined => {
    const obj = [...state.current.groups?.filter((g) => g.items?.length > 0)];
    return obj.length > 0 ? obj : undefined;
  };

  return (
    <DelayedUpdateProviderActionsContext.Provider
      value={{
        addItem,
        removeItem,
        getPayload,
      }}
    >
      {children}
    </DelayedUpdateProviderActionsContext.Provider>
  );
};

const useDelayedUpdate = (require: boolean = true): IDelayedUpdateActionContext | undefined => {
  const actionsContext = useContext(DelayedUpdateProviderActionsContext);

  if (actionsContext === undefined && require) {
    throw new Error('useDelayedUpdate must be used within a DelayedUpdateProvider');
  }
  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext;
};

export { DelayedUpdateProvider, useDelayedUpdate };
