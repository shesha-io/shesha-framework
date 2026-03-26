import React, { FC, PropsWithChildren, useEffect } from "react";
import { IDataTableProviderWithRepositoryProps } from "./provider-with-repo";
import { useDatasetInstance, useDatasetState } from "./hooks";
import { DataTableActionsContext, DataTableStateContext } from "./contexts";
import { useConfigurableAction } from "../configurableActionsDispatcher";

const TempDataSetBridge: FC<PropsWithChildren> = ({ children }) => {
  const state = useDatasetState();
  return (
    <DataTableStateContext.Provider value={state}>
      {children}
    </DataTableStateContext.Provider>
  );
};

export const DataTableProviderWithRepositoryNew: FC<PropsWithChildren<IDataTableProviderWithRepositoryProps>> = (props) => {
  const {
    children,
    repository,
    userConfigId,
    sortMode,
    actionOwnerId = "",
    actionOwnerName = "",

    dataFetchingMode,
    permanentFilter,
  } = props;

  const instance = useDatasetInstance(repository);
  useEffect(() => {
    void instance.init({
      metadata: undefined,
      userConfigId: userConfigId,
      sortMode: sortMode ?? "standard",

      dataFetchingMode: dataFetchingMode,
      permanentFilter: permanentFilter,
    });
  }, [instance, userConfigId, sortMode, permanentFilter, dataFetchingMode]);

  useConfigurableAction(
    {
      name: 'Refresh table',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        return instance.refreshTable();
      },
    },
    [instance],
  );

  useConfigurableAction(
    {
      name: 'Export to Excel',
      description: 'Export current table view to Excel',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        return instance.exportToExcel();
      },
    },
    [instance],
  );

  useConfigurableAction(
    {
      name: 'Toggle Advanced Filter',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        instance.toggleAdvancedFilter();
        return Promise.resolve();
      },
    },
    [instance],
  );

  useConfigurableAction(
    {
      name: 'Toggle Columns Selector',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        instance.toggleColumnsSelector();
        return Promise.resolve();
      },
    },
    [instance],
  );

  return (
    <DataTableActionsContext.Provider value={instance}>
      <TempDataSetBridge>
        {children}
      </TempDataSetBridge>
    </DataTableActionsContext.Provider>
  );
};
