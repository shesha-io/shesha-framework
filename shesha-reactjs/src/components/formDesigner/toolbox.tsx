import React, { FC, useMemo } from 'react';
import { ToolboxComponents } from './toolboxComponents';
import { ToolboxDataSources } from './toolboxDataSources';
import { useStyles } from './styles/styles';
import { Tabs } from 'antd';
import { isEntityMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { useMetadataOrUndefined } from '@/providers';
import { IDataSource } from '@/providers/formDesigner/models';

const Toolbox: FC = () => {
  const { styles } = useStyles();
  const currentMeta = useMetadataOrUndefined();

  const currentMetaId = currentMeta?.id;
  const metadata = currentMeta?.metadata;

  const builderItems = useMemo(() => {
    const dataSources: IDataSource[] = [];

    const defaultItems = [{ key: '1', label: 'Components', children: <ToolboxComponents /> }];

    if (isEntityMetadata(metadata))
      dataSources.push({
        id: currentMetaId ?? "",
        name: metadata.name,
        module: metadata.module,
        containerType: metadata.fullClassName,
        items: isPropertiesArray(metadata.properties) ? metadata.properties : [],
      });
    if (dataSources.length > 0) {
      return [...defaultItems, { key: '2', label: 'Data', children: <ToolboxDataSources dataSources={dataSources} /> }];
    } else {
      return [...defaultItems];
    }
  }, [metadata, currentMetaId]);

  return (
    <div className={styles.shaDesignerToolbox}>
      <Tabs style={{ paddingBottom: '50px' }} defaultActiveKey="1" type="card" items={[...builderItems]} />
    </div>
  );
};

export default Toolbox;
