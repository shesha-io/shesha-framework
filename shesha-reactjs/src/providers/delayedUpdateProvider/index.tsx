import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import {
  DelayedUpdateProviderActionsContext,
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE,
  IDelayedUpdateStateContext,
  IDelayedUpdateActionContext,
} from './context';
import { IDelayedUpdateGroup } from './models';
import { IAnyObject } from '@/interfaces';
import { throwError } from '@/utils/errors';

const getOrCreateGroup = (groups: IDelayedUpdateGroup[], groupName: string): IDelayedUpdateGroup => {
  const existing = groups.find((x) => x.name === groupName);
  if (existing)
    return existing;

  const newGroup = { name: groupName, items: [] };
  groups.push(newGroup);
  return { name: groupName, items: [] };
};

const DelayedUpdateProvider: FC<PropsWithChildren> = ({ children }) => {
  const state = useRef<IDelayedUpdateStateContext>(DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE);
  const allGroups = state.current.groups;

  const addItem = (groupName: string, id: string, data: IAnyObject): void => {
    const group = getOrCreateGroup(allGroups, groupName);
    const item = group.items.find((x) => x.id === id);
    if (item)
      item.data = data;
    else
      group.items.push({ id, data });
  };

  const removeItem = (groupName: string, id: string): void => {
    const group = allGroups.find((x) => x.name === groupName);
    if (group)
      group.items = group.items.filter((x) => x.id !== id);
  };

  const getPayload = (): IDelayedUpdateGroup[] | undefined => {
    const obj = [...allGroups.filter((g) => g.items.length > 0)];
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

const useDelayedUpdateOrUndefined = (): IDelayedUpdateActionContext | undefined => useContext(DelayedUpdateProviderActionsContext);

const useDelayedUpdate = (): IDelayedUpdateActionContext => useDelayedUpdateOrUndefined() ?? throwError('useDelayedUpdate must be used within a DelayedUpdateProvider');

export const addDelayedUpdateProperty = <TData extends object = object>(data: TData, delayedUpdate: IDelayedUpdateGroup[]): void => {
  (data as Record<string, unknown>)["_delayedUpdate"] = delayedUpdate;
};

export { DelayedUpdateProvider, useDelayedUpdateOrUndefined, useDelayedUpdate };
