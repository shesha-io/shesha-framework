import React, { FC, PropsWithChildren, useEffect, useMemo } from "react";
import { useDatasetInstance, useDatasetState } from "./hooks";
import { DataTableActionsContext, DataTableStateContext, IDataTableStateContext } from "./contexts";
import { useConfigurableAction } from "../configurableActionsDispatcher";
import { IDataTableProviderBaseProps } from "./provider.props";
import { IHasModelType, IHasRepository } from "./repository/interfaces";
import DataContextBinder from "../dataContextProvider/dataContextBinder";
import { IObjectMetadata } from "@/interfaces/metadata";
import { dataTableContextCode } from '@/publicJsApis/apis';
import { DataTypes } from "@/interfaces/dataTypes";
import { isDefined } from "@/utils/nullables";
import { isEqual } from "lodash";
import { ContextOnChangeData } from "../dataContextProvider/contexts";
import { IDatasetInstance } from "./models";

const TempDataSetBridge: FC<PropsWithChildren> = ({ children }) => {
  const state = useDatasetState();
  return (
    <DataTableStateContext.Provider value={state}>
      {children}
    </DataTableStateContext.Provider>
  );
};

export interface IDataTableProviderWithRepositoryProps extends IDataTableProviderBaseProps, IHasRepository, IHasModelType { }

type DataTableProviderWithRepositoryWithContextProps = {
  userConfigId: string;
  actionOwnerId: string;
  actionOwnerName: string;
  instance: IDatasetInstance;
};
const DataTableProviderWithRepositoryWithContext: FC<PropsWithChildren<DataTableProviderWithRepositoryWithContextProps>> = (props) => {
  const {
    children,
    userConfigId,
    actionOwnerId = "",
    actionOwnerName = "",
    instance,
  } = props;

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

  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'IDataTableContexApi',
        files: [{ content: dataTableContextCode, fileName: 'apis/dataTableContextApi.ts' }],
      });
    },
    properties: [],
    dataType: DataTypes.object,
  }), []);

  const contextOnChangeData: ContextOnChangeData<IDataTableStateContext> = (_, changedData): void => {
    if (!isDefined(changedData))
      return;

    if (isDefined(changedData.quickSearch) && changedData.quickSearch !== instance.state.quickSearch) {
      instance.changeQuickSearch(changedData.quickSearch);
      return;
    }

    if (isDefined(changedData.currentPage) && changedData.currentPage !== instance.state.currentPage) {
      instance.setCurrentPage(changedData.currentPage);
      return;
    }

    if (isDefined(changedData.grouping) && !isEqual(changedData.grouping, instance.state.grouping)) {
      instance.onGroup(changedData.grouping);
      return;
    }
  };

  return (
    <DataContextBinder
      id={'ctx_' + userConfigId}
      name={actionOwnerName}
      description={`Table context for ${actionOwnerName}`}
      type="control"
      data={instance.state}
      api={instance}
      onChangeData={contextOnChangeData}
      metadata={contextMetadata}
    >
      {children}
    </DataContextBinder>
  );
};

export const DataTableProviderWithRepository: FC<PropsWithChildren<IDataTableProviderWithRepositoryProps>> = (props) => {
  const {
    children,
    repository,
    userConfigId = "",
    sortMode,
    actionOwnerId = "",
    actionOwnerName = "",
    dataFetchingMode,
    permanentFilter,
    needToRegisterContext = true,
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

  const content = (
    <DataTableActionsContext.Provider value={instance}>
      <TempDataSetBridge>
        {children}
      </TempDataSetBridge>
    </DataTableActionsContext.Provider>
  );

  return needToRegisterContext
    ? (
      <DataTableProviderWithRepositoryWithContext
        userConfigId={userConfigId}
        actionOwnerId={actionOwnerId}
        actionOwnerName={actionOwnerName}
        instance={instance}
      >
        {content}
      </DataTableProviderWithRepositoryWithContext>
    )
    : <>{content}</>;
};
