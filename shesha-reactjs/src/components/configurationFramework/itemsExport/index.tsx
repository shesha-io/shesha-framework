import axios from 'axios';
import FileSaver from 'file-saver';
import React, { MutableRefObject, useMemo, useState, FC } from 'react';

import {
  Button,
  Card,
  Empty,
  Form,
  Result,
  Skeleton,
  Spin,
  Switch,
  Tree,
} from 'antd';
import { getFileNameFromResponse } from '@/utils/fetchers';
import { useSheshaApplication } from '@/providers';
import { EMPTY_FILTER, FilterState } from './models';
import { ExportFilter } from './filter';
import { useTreeForExport } from '@/configuration-studio/apis';
import { isConfigItemTreeNode, isNodeWithChildren, TreeNode } from '@/configuration-studio/models';
import { DownOutlined } from '@ant-design/icons';
import { getTitleWithHighlight } from '@/configuration-studio/filter-utils';

export interface IExportInterface {
  exportExecuter: () => Promise<any>;
  canExport: boolean;
  exportInProgress: boolean;
}

export interface IConfigurationItemsExportProps {
  onExported?: () => void;
  exportRef: MutableRefObject<IExportInterface | undefined>;
}

export const ConfigurationItemsExport: FC<IConfigurationItemsExportProps> = (props) => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTER);
  const [exportDependencies, setExportDependencies] = useState<boolean>(true);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [exportInProgress, setExportInProgress] = useState(false);
  const { data: treeData, error, isLoading, mutate: refreshTree } = useTreeForExport();

  const treeNodes = treeData?.treeNodes;
  const filteredTreeNodes = useMemo<TreeNode[] | undefined>(() => {
    if (!treeNodes)
      return undefined;

    const { quickSearch, mode } = filterState;

    const loop = (data: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];
      data.forEach((node) => {
        if (isConfigItemTreeNode(node)) {
          const filterPassed = mode === 'all' ||
            (mode === 'updated' && node.flags.isUpdated) ||
            (mode === 'updated-by-me' && node.flags.isUpdatedByMe);
          if (filterPassed) {
            if (quickSearch) {
              const newTitle = getTitleWithHighlight(node, quickSearch);
              if (newTitle)
                result.push({ ...node, title: newTitle });
            } else
              result.push(node);
          }
        }

        if (isNodeWithChildren(node)) {
          const nodeChildren = loop(node.children);
          if (nodeChildren.length > 0)
            result.push({ ...node, children: nodeChildren });
        }
      });
      return result;
    };

    const newNodes = loop(treeNodes);
    return newNodes;
  }, [treeNodes, filterState]);

  const getExportFilter = (): object => {
    return { in: [{ var: 'id' }, checkedIds] };
  };

  const exportExecuter = (): Promise<void> => {
    const filter = getExportFilter();
    const exportUrl = `${backendUrl}/api/services/app/ConfigurationStudio/ExportPackage`;


    setExportInProgress(true);
    return axios({
      url: exportUrl,
      method: 'POST',
      data: {
        filter: JSON.stringify(filter),
        exportDependencies: exportDependencies,
        // versionSelectionMode: itemSelectionMode,
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

  const onRefreshClick = (): void => {
    refreshTree();
  };

  const onCheck = (checkedIds: string[]): void => {
    setCheckedIds(checkedIds);
  };

  return (
    <Spin spinning={exportInProgress} tip="Exporting...">
      <Form>
        <Form.Item label="Filter by">
          <ExportFilter value={filterState} onChange={setFilterState} />
        </Form.Item>
        {error && (
          <Result
            status="500"
            title="500"
            subTitle="Sorry, something went wrong."
            extra={<Button type="primary" onClick={onRefreshClick}>Refresh</Button>}
          />
        )}
        <Skeleton loading={isLoading}>
          {filteredTreeNodes && (
            filteredTreeNodes.length > 0
              ? (
                <>
                  <Card
                    styles={{ body: { padding: 0, maxHeight: '70vh', overflowY: 'auto' } }}
                  >
                    <Tree<TreeNode>
                      showLine
                      checkable
                      showIcon
                      switcherIcon={<DownOutlined />}
                      treeData={filteredTreeNodes}
                      onCheck={onCheck}
                      checkedKeys={checkedIds}
                    />
                  </Card>
                  <Form.Item label="Include dependencies">
                    <Switch checked={exportDependencies} onChange={setExportDependencies}></Switch>
                  </Form.Item>
                </>
              )
              : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items found" />
              )
          )}
        </Skeleton>
      </Form>
    </Spin>
  );
};

export default ConfigurationItemsExport;
