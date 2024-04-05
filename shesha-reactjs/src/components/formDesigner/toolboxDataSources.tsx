import React, { FC, useMemo } from 'react';
import { Collapse, Empty, Tooltip } from 'antd';
import { useLocalStorage } from '@/hooks';
import { useMetadata } from '@/providers';
import { IDataSource } from '@/providers/formDesigner/models';
import SearchBox from './toolboxSearchBox';
import DataSourceTree from './dataSourceTree';
import { IPropertyMetadata, isEntityMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { getClassNameFromFullName } from '@/providers/metadataDispatcher/utils';
import { useFormDesigner } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

const { Panel } = Collapse;

export interface IToolboxDataSourcesProps {}

interface FilteredDataSource {
  datasource: IDataSource;
  visibleItems: IPropertyMetadata[];
}

const getVisibleProperties = (items: IPropertyMetadata[], searchText: string): IPropertyMetadata[] => {
  const result: IPropertyMetadata[] = [];
  if (!items) return result;

  items.forEach(item => {
    if (!item.isFrameworkRelated && item.isVisible) {
      const childItems = isPropertiesArray(item.properties) ? getVisibleProperties(item.properties, searchText) : [];
      const matched =
        (searchText ?? '') === '' ||
        item.path?.toLowerCase().includes(searchText) ||
        item.label?.toLowerCase().includes(searchText);

      if (matched || childItems.length > 0) {
        const filteredItem: IPropertyMetadata = { ...item, properties: childItems };
        result.push(filteredItem);
      }
    }
  });

  return result;
};

export const ToolboxDataSources: FC<IToolboxDataSourcesProps> = () => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaDesigner.toolbox.datasources.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaDesigner.toolbox.datasources.search', '');
  const { styles } = useStyles();

  const currentMeta = useMetadata(false);

  const { dataSources: formDs, activeDataSourceId } = useFormDesigner();

  const allDataSources = useMemo<IDataSource[]>(() => {
    const dataSources = [...formDs];
    if (isEntityMetadata(currentMeta?.metadata)) dataSources.push({
      id: currentMeta.id,
      name: currentMeta.metadata.name,
      containerType: currentMeta.metadata.entityType,
      items: isPropertiesArray(currentMeta.metadata.properties) ? currentMeta.metadata.properties : [],
    });

    return dataSources;
  }, [formDs, currentMeta?.metadata]);

  const datasourcesWithVisible = useMemo<FilteredDataSource[]>(() => {
    const dataSources = allDataSources.map<FilteredDataSource>(ds => ({
      datasource: ds,
      visibleItems: getVisibleProperties(ds.items, searchText),
    }));
    return dataSources;
  }, [allDataSources, searchText]);

  if (allDataSources.length === 0) return null;

  const onCollapseChange = (key: string | string[]) => {
    setOpenedKeys(Array.isArray(key) ? key : [key]);
  };
  return (
    <>
      <div className="sidebar-subheader">Data</div>
      <SearchBox value={searchText} onChange={setSearchText} placeholder="Search data properties" />

      {datasourcesWithVisible.length > 0 && (
        <Collapse activeKey={openedKeys} onChange={onCollapseChange}>
          {datasourcesWithVisible.map((ds, dsIndex) => {
            const visibleItems = ds.visibleItems;
            const shortName = getClassNameFromFullName(ds.datasource.name);

            const header = (
              <Tooltip placement="bottom" title={ds.datasource.name} mouseEnterDelay={1}>
                {shortName}
              </Tooltip>
            );
      
            return visibleItems.length === 0 ? null : (
              <Panel header={header} key={dsIndex.toString()} className={classNames(styles.shaToolboxPanel, { active: ds.datasource.id === activeDataSourceId })}>
                <DataSourceTree
                  items={visibleItems}
                  searchText={searchText}
                  defaultExpandAll={(searchText ?? '') !== ''}
                />
              </Panel>
            );
          })}
        </Collapse>
      )}
      {datasourcesWithVisible.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" />
      )}
    </>
  );
};

export default ToolboxDataSources;
