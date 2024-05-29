import React, { FC } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';
import { useStyles } from './styles/styles';
import { Tabs } from 'antd';

export interface IProps { }

const Toolbox: FC<IProps> = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.shaDesignerToolbox}>
      <Tabs defaultActiveKey="1"
        type='card'
        items={[
          { key: '1', label: 'Widgets', children: <ToolboxComponents /> },
          { key: '2', label: 'Data', children: <ToolboxDataSources /> }
        ]}
      />
    </div>
  );
};

export default Toolbox;
