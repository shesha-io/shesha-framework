import React, { FC, useMemo } from 'react';
import { Collapse, Empty, Tooltip } from 'antd';
import { useLocalStorage } from '@/hooks';
import { IDataSource } from '@/providers/formDesigner/models';
import SearchBox from './toolboxSearchBox';
import DataSourceTree from './dataSourceTree';
import { IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { getClassNameFromFullName } from '@/providers/metadataDispatcher/utils';
import { useStyles } from './styles/styles';

export interface IToolboxDataSourcesProps {
  dataSources: IDataSource[];
}

interface FilteredDataSource {
  datasource: IDataSource;
  visibleItems: IPropertyMetadata[];
}

const getVisibleProperties = (items: IPropertyMetadata[], searchText: string): IPropertyMetadata[] => {
  const result: IPropertyMetadata[] = [];
  if (!items) return result;

  items.forEach((item) => {
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

export const ToolboxDataSources: FC<IToolboxDataSourcesProps> = ({ dataSources }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaDesigner.toolbox.datasources.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaDesigner.toolbox.datasources.search', '');
  const { styles } = useStyles();

  const datasourcesWithVisible = useMemo<FilteredDataSource[]>(() => {
    const dataSourcesX = dataSources.map<FilteredDataSource>((ds) => ({
      datasource: ds,
      visibleItems: getVisibleProperties(ds.items, searchText),
    }));
    return dataSourcesX;
  }, [searchText, dataSources]);


  const onCollapseChange = (key: string | string[]): void => {
    setOpenedKeys(Array.isArray(key) ? key : [key]);
  };
  return (
    <>
      <div className={styles.shaToolboxComponents}>
        <SearchBox value={searchText} onChange={setSearchText} placeholder="Search data properties" />
        <Collapse
          activeKey={openedKeys}
          onChange={onCollapseChange}
          items={datasourcesWithVisible.map((ds, dsIndex) => {
            const visibleItems = ds.visibleItems;
            const shortName = getClassNameFromFullName(ds.datasource.name);

            const header = (
              <Tooltip placement="bottom" title={ds.datasource.name} mouseEnterDelay={1}>
                {shortName}
              </Tooltip>
            );

            return visibleItems.length === 0
              ? null
              : {
                key: dsIndex.toString(),
                label: header,
                children: (
                  <DataSourceTree
                    items={visibleItems}
                    searchText={searchText}
                    defaultExpandAll={(searchText ?? '') !== ''}

                  />
                ) };
          }).filter((item) => Boolean(item))}
        />
      </div>

      {datasourcesWithVisible.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" />
      )}
    </>
  );
};

export default ToolboxDataSources;
