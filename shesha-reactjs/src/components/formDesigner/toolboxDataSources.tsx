import React, { FC, useMemo } from 'react';
import { Collapse, Empty, Tooltip } from 'antd';
import { useLocalStorage } from '../../hooks';
import { useMetadata } from '../../providers';
import { IDataSource } from '../../providers/formDesigner/models';
import SearchBox from './toolboxSearchBox';
import DataSourceTree from './dataSourceTree';
import { IPropertyMetadata } from '../../interfaces/metadata';
import { getClassNameFromFullName } from '../../providers/metadataDispatcher/utils';
import { useFormDesigner } from '../../providers/formDesigner';

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
      const childItems = getVisibleProperties(item.properties, searchText);
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

  const currentMeta = useMetadata(false);
  const currentDataSource: IDataSource = Boolean(currentMeta?.metadata?.properties)
    ? {
        id: currentMeta.id,
        name: currentMeta.metadata?.name,
        containerType: currentMeta.metadata?.type,
        items: currentMeta.metadata?.properties,
      }
    : null;

  const { dataSources: formDs, activeDataSourceId } = useFormDesigner();

  const allDataSources = useMemo<IDataSource[]>(() => {
    const dataSources = [...formDs];
    if (currentDataSource) dataSources.push(currentDataSource);

    return dataSources;
  }, [formDs, currentDataSource]);

  const datasourcesWithVisible = useMemo<FilteredDataSource[]>(() => {
    const dataSources = allDataSources.map<FilteredDataSource>(ds => ({
      datasource: ds,
      visibleItems: getVisibleProperties(ds.items, searchText),
    }));
    return dataSources;
  }, [allDataSources, searchText]);

  const itemContainsText = (item: IPropertyMetadata, loweredSearchText: string): boolean => {
    if (item.path?.toLowerCase()?.includes(loweredSearchText) || item.label?.toLowerCase()?.includes(loweredSearchText))
      return true;

    return (item.properties ?? []).some(child => itemContainsText(child, loweredSearchText));
  };

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

            const classes = ['sha-toolbox-panel'];
            if (ds.datasource.id === activeDataSourceId) classes.push('active');

            let header = (
              <Tooltip placement="bottom" title={ds.datasource.name} mouseEnterDelay={1}>
                {shortName}
              </Tooltip>
            );

      
            return visibleItems.length === 0 ? null : (
              <Panel header={header} key={dsIndex.toString()} className={classes.reduce((a, c) => a + ' ' + c)}>
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
