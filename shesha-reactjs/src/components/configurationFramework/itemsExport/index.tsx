import axios from 'axios';
import FileSaver from 'file-saver';
import React, { MutableRefObject, useState } from 'react';
import { FC } from 'react';
import {
  Button,
  Form,
  Result,
  Skeleton,
  Spin,
  Switch,
  Tree
} from 'antd';
import { getFileNameFromResponse } from '@/utils/fetchers';
import { useSheshaApplication } from '@/providers';
import { EMPTY_FILTER, FilterState } from './models';
import { ExportFilter } from './filter';
import { useTreeForExport } from '@/configuration-studio/apis';
import { TreeNode } from '@/configuration-studio/models';
import { DownOutlined } from '@ant-design/icons';

export interface IExportInterface {
  exportExecuter: () => Promise<any>;
  canExport: boolean;
  exportInProgress: boolean;
}

export interface IConfigurationItemsExportProps {
  onExported?: () => void;
  exportRef: MutableRefObject<IExportInterface>;
}

export const ConfigurationItemsExport: FC<IConfigurationItemsExportProps> = (props) => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTER);
  const [exportDependencies, setExportDependencies] = useState<boolean>(true);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [exportInProgress, setExportInProgress] = useState(false);
  const { data: treeData, error, isLoading, mutate: refreshTree } = useTreeForExport();

  const getExportFilter = () => {
    return { in: [{ var: 'id' }, checkedIds] };
  };

  const exportExecuter = () => {
    const filter = getExportFilter();
    const exportUrl = `${backendUrl}/api/services/app/ConfigurationStudio/ExportPackage`;
    

    setExportInProgress(true);
    return axios({
      url: exportUrl,
      method: 'POST',
      data: {
        filter: JSON.stringify(filter),
        exportDependencies: exportDependencies,
        //versionSelectionMode: itemSelectionMode,
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

  const onRefreshClick = () => {
    refreshTree();
  };

  const onCheck = (checkedIds: string[]) => {
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
          {treeData && (
            <>
              <Tree<TreeNode>
                showLine
                checkable
                showIcon
                switcherIcon={<DownOutlined />}
                treeData={treeData.treeNodes}
                onCheck={onCheck}
                checkedKeys={checkedIds}
              />
              <Form.Item label="Include dependencies">
                <Switch checked={exportDependencies} onChange={setExportDependencies}></Switch>
              </Form.Item>
            </>
          )}
        </Skeleton>
      </Form>
    </Spin>
  );
};

export default ConfigurationItemsExport;