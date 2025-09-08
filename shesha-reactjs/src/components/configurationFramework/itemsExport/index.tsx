import * as RestfulShesha from '@/utils/fetchers';
import axios from 'axios';
import FileSaver from 'file-saver';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { FC } from 'react';
import {
  Form,
  Select,
  Skeleton,
  Spin,
  Switch
} from 'antd';
import { LEGACY_ITEMS_MODULE_NAME } from '@/shesha-constants';
import { getFileNameFromResponse } from '@/utils/fetchers';
import { getIndexesList } from '../treeUtils';
import { AbpWrappedResponse, ErrorInfo } from '@/interfaces/gql';
import { ItemsTree } from '../itemsTree';
import { useSheshaApplication } from '@/providers';
import {
  ConfigurationItemDto,
  IModule,
  IConfigurationItem,
  ModulesDictionary,
  ConfigItemDataNode,
  ITreeState,
} from '../models';

export interface IExportInterface {
  exportExecuter: () => Promise<any>;
  canExport: boolean;
  exportInProgress: boolean;
}

export interface IConfigurationItemsExportProps {
  onExported?: () => void;
  exportRef: MutableRefObject<IExportInterface>;
}

type VerionSelectionMode = 'live' | 'ready' | 'latest';

type GetFlatTreePayload = {
  mode: number;
};

export const ConfigurationItemsExport: FC<IConfigurationItemsExportProps> = (props) => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [versionsMode, setVersionsMode] = useState<VerionSelectionMode>('live');
  const [exportDependencies, setExportDependencies] = useState<boolean>(true);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [treeState, setTreeState] = useState<ITreeState>(null);
  
  const getListFetcherQueryParams = (mode: VerionSelectionMode): GetFlatTreePayload => {
    switch(mode){
      default:
      case 'live': return { mode: 1 };
      case 'ready': return { mode: 2 };
      case 'latest': return { mode: 3 };
    }    
  };

  const applyItems = (allItems: ConfigurationItemDto[]) => {
    if (!allItems) {
      setTreeState(null);
      return;
    }

    const modules: ModulesDictionary = {};
    allItems.forEach((item) => {
      const itemModule = item.module ?? { id: null, name: LEGACY_ITEMS_MODULE_NAME };
      let moduleContainer: IModule = modules[itemModule.id];
      if (!moduleContainer) {
        moduleContainer = { id: itemModule.id, name: itemModule.name, description: itemModule.description, itemTypes: {} };
        modules[itemModule.id] = moduleContainer;
      }
      let itemType = moduleContainer.itemTypes[item.itemType];
      if (!itemType) {
        itemType = { name: item.itemType, items: [], applications: {} };
        moduleContainer.itemTypes[itemType.name] = itemType;
      }

      const configurationItem: IConfigurationItem = {
        id: item.id,
        name: item.name,
        label: item.label,
        description: item.description,
      };

      if (item.application && item.application.appKey) {
        let applicationNode = itemType.applications[item.application.appKey];
        if (!applicationNode) {
          applicationNode = {
            appKey: item.application.appKey,
            name: item.application.name,
            items: [],
            //id: item.application.id,
          };
          itemType.applications[item.application.appKey] = applicationNode;
        }
        applicationNode.items.push(configurationItem);
      } else {
        itemType.items.push(configurationItem);
      }
    });

    let treeNodes: ConfigItemDataNode[] = [];

    for (const moduleName in modules) {
      if (!modules.hasOwnProperty(moduleName)) continue;
      const moduleContainer = modules[moduleName];
      const moduleNode: ConfigItemDataNode = {
        key: moduleContainer.id ?? '-',
        title: moduleContainer.name,
        children: [],
        isLeaf: false,
      };
      treeNodes.push(moduleNode);

      for (const itName in moduleContainer.itemTypes) {
        if (!moduleContainer.itemTypes.hasOwnProperty(itName)) continue;
        const itemType = moduleContainer.itemTypes[itName];
        if (itemType) {
          const itemTypeNode: ConfigItemDataNode = {
            key: `${moduleContainer.id}/${itemType.name}`,
            title: itemType.name,
            children: [],
            isLeaf: false,
          };
          moduleNode.children.push(itemTypeNode);

          for (const appKey in itemType.applications) {
            if (!itemType.applications.hasOwnProperty(appKey)) continue;
            const application = itemType.applications[appKey];

            const appNode: ConfigItemDataNode = {
              key: `${moduleContainer.id}/${itemType.name}/${application.appKey}`,
              title: application.appKey,
              isLeaf: false,
              children: application.items.map<ConfigItemDataNode>((item) => ({
                key: item.id,
                title: item.name,
                isLeaf: true,
                itemId: item.id,
              })),
            };
            itemTypeNode.children.push(appNode);
          }
          const nonAppItems = itemType.items.map<ConfigItemDataNode>((item) => ({
            key: item.id,
            title: item.name,
            isLeaf: true,
            itemId: item.id,
          }));
          itemTypeNode.children.push(...nonAppItems);
          //itemTypeNode.children = itemType.items.map<ConfigItemDataNode>(item => ({ key: item.id, title: item.name, isLeaf: true, itemId: item.id }));
        }
      }
      moduleNode.children = moduleNode.children.sort((a, b) => (a.title < b.title ? -1 : a.title === b.title ? 0 : 1));
    }
    treeNodes = treeNodes.sort((a, b) => (a.key === '-' ? -1 : b.key === '-' ? 1 : a < b ? -1 : 1));

    const dataIndexes = getIndexesList(treeNodes);

    setTreeState({ treeNodes: treeNodes, indexes: dataIndexes, itemsCount: allItems.length });
  };

  useEffect(() => {
    setIsLoading(true);
    RestfulShesha.get<AbpWrappedResponse<ConfigurationItemDto[], ErrorInfo>, any, GetFlatTreePayload, void>(
      `/api/services/app/ConfigurationItem/GetExportFlatTree`,
      getListFetcherQueryParams(versionsMode),
      { base: backendUrl, headers: httpHeaders }
    ).then((response) => {
      applyItems(response.result);
      setIsLoading(false);
    });
  }, [versionsMode]);

  const getExportFilter = () => {
    return { in: [{ var: 'id' }, checkedIds] };
  };

  const exportExecuter = () => {
    const filter = getExportFilter();
    const exportUrl = `${backendUrl}/api/services/app/ConfigurationItem/ExportPackage`;

    setExportInProgress(true);
    return axios({
      url: exportUrl,
      method: 'POST',
      data: {
        filter: JSON.stringify(filter),
        exportDependencies: exportDependencies,
        versionSelectionMode: versionsMode,
      },
      responseType: 'blob', // important
      headers: httpHeaders,
    })
      .then((response) => {
        const fileName = getFileNameFromResponse(response) ?? 'package.zip';
        FileSaver.saveAs(new Blob([response.data]), fileName);
        setExportInProgress(false);
        if (Boolean(props.onExported)) props.onExported();
      })
      .catch((e) => {
        setExportInProgress(false);
        throw e;
      });
  };

  if (props.exportRef)
    props.exportRef.current = {
      exportExecuter: exportExecuter,
      canExport: checkedIds.length === 0,
      exportInProgress: exportInProgress,
    };

  const onChangeSelection = (checkedIds: string[]) => {
    setCheckedIds(checkedIds);
  };

  return (
    <Spin spinning={exportInProgress} tip="Exporting...">
      <Form>
        <Form.Item label="Versions to include">
          <Select
            value={versionsMode}
            onChange={setVersionsMode}
            options={[
              {
                value: 'live',
                label: 'Live',
              },
              {
                value: 'ready',
                label: 'Ready',
              },
              {
                value: 'latest',
                label: 'Latest',
              },
            ]}
          />
        </Form.Item>
        <Form.Item label="Include all dependencies">
          <Switch checked={exportDependencies} onChange={setExportDependencies}></Switch>
        </Form.Item>
        <Skeleton loading={isLoading}>
          {treeState && (
            <>
              <ItemsTree treeState={treeState} onChangeSelection={onChangeSelection} />
            </>
          )}
        </Skeleton>
      </Form>
    </Spin>
  );
};

export default ConfigurationItemsExport;
