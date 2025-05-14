import React, { FC, useMemo } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';
import { useStyles } from './styles/styles';
import { Tabs } from 'antd';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { isEntityMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { useMetadata } from '@/providers';

export interface IProps { }

const Toolbox: FC<IProps> = () => {
  const { styles } = useStyles();
  const formDs = useFormDesignerStateSelector(x => x.dataSources);
  const currentMeta = useMetadata(false);

  const builderItems = useMemo(() => {
    const dataSources = [...formDs];

    const defaultItems = [{ key: '1', label: 'Widgets', children: <ToolboxComponents /> }];

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
  }, [formDs, currentMeta?.metadata, currentMeta?.id]);

  return (
    <div className={styles.shaDesignerToolbox}>
      <Tabs style={{paddingBottom: '50px'}} defaultActiveKey="1" type="card" items={[...builderItems]} />
    </div>
  );
};

export default Toolbox;
