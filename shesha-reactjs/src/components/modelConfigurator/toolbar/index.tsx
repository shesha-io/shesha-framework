import React, { FC } from 'react';
import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useModelConfigurator } from '@/providers';
import { useStyles } from '../styles/styles';

export interface IProps { }

export const ModelConfiguratorToolbar: FC<IProps> = () => {
  const { styles } = useStyles();
  const configurator = useModelConfigurator();

  const onSaveClick = () => {
    configurator.saveForm()
      .catch((_error) => {
      // ToDo: AS - handle error
      // if (!error?.errorFields) message.error('Failed to save configuration');
      });
  };

  return (
    <div className={styles.shaModelConfiguratorToolbar}>
      <div className={styles.shaModelConfiguratorToolbarRight}>
        <Button key="save" onClick={onSaveClick} type="primary">
          <SaveOutlined /> Save
        </Button>
      </div>
    </div>
  );
};

export default ModelConfiguratorToolbar;
