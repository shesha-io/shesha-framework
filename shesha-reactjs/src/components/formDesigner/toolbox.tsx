import React, { FC, useMemo } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';
import { useStyles } from './styles/styles';
import { Tabs } from 'antd';
import { isEntityMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { useMetadata } from '@/providers';

const Toolbox: FC = () => {
  const { styles } = useStyles();
  const currentMeta = useMetadata(false);

  const builderItems = useMemo(() => {
    const dataSources = [];

    const defaultItems = [{ key: '1', label: 'Components', children: <ToolboxComponents /> }];

    if (isEntityMetadata(currentMeta?.metadata))
      dataSources.push({
        id: currentMeta.id,
        name: currentMeta.metadata.name,
        containerType: currentMeta.metadata.entityType,
        items: isPropertiesArray(currentMeta.metadata.properties) ? currentMeta.metadata.properties : [],
      });
    if (dataSources.length > 0) {
      return [...defaultItems, { key: '2', label: 'Data', children: <ToolboxDataSources dataSources={dataSources} /> }];
    } else {
      return [...defaultItems];
    }
  }, [currentMeta?.metadata, currentMeta?.id]);

  return (
    <div className={styles.shaDesignerToolbox}>
      <Tabs style={{ paddingBottom: '50px' }} defaultActiveKey="1" type="card" items={[...builderItems]} />
    </div>
  );
};

export default Toolbox;
