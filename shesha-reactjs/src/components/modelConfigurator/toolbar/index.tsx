import React, { FC } from 'react';
import { Button } from 'antd';
import {
  SaveOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useShaRouting } from '../../../providers/shaRouting';
import { useModelConfigurator } from '../../../providers';

export interface IProps { }

export const ModelConfiguratorToolbar: FC<IProps> = () => {
  const { load, submit, id } = useModelConfigurator();
  const { router } = useShaRouting();

  const onSaveClick = () => {
    submit();
  };

  const onLoadClick = () => {
    load();
  };

  const onCancelClick = () => {
    router?.back();
  };

  return (
    <div className="sha-model-configurator-toolbar">
      <div className="sha-model-configurator-toolbar-right">
        {false && (
          <Button onClick={onCancelClick} type="primary" danger>
            <CloseCircleOutlined /> Cancel
          </Button>
        )}
        <Button key="load" onClick={onLoadClick} type="default">
          <ReloadOutlined /> Load
        </Button>
        {Boolean(id) && (
          <Button key="save" onClick={onSaveClick} type="primary">
            <SaveOutlined /> Save
          </Button>
        )}
        {!Boolean(id) && (
          <Button key="create" onClick={onSaveClick} type="primary">
            <FileAddOutlined /> Create
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModelConfiguratorToolbar;
