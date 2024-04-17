import React from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { DataListSettingsForm } from './dataListSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl, { NotConfiguredWarning } from './dataListControl';
import { useDataTableStore } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStore(false);
    if (model.hidden) return null;
  
    const dataSource = model.dataSource
      ? ds.getDataSource(model.dataSource)?.dataSource
      : dts;
  
    return dataSource
      ? <DataListControl {...model} dataSourceInstance={dataSource}/>
      : <NotConfiguredWarning />;
  },
  migrator: m => m
    .add<IDataListComponentProps>(0, prev => {
      return {
        ...prev,
        formSelectionMode: 'name',
        selectionMode: 'none',
        items: [],
      };
    })
    .add<IDataListComponentProps>(1, prev => {
      return {
        ...prev,
        orientation: 'vertical',
        listItemWidth: 1
      };
    })
    .add<IDataListComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDataListComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDataListComponentProps>(4, prev => {
      return {
        ...prev,
        collapsible: true
      };
    })
    .add<IDataListComponentProps>(5, prev => {
      return {
        ...prev,
        canAddInline: 'no',
        canEditInline: 'no',
        canDeleteInline: 'no',
        inlineEditMode: 'one-by-one',
        inlineSaveMode: 'manual',
        dblClickActionConfiguration: prev['actionConfiguration']
        
      };
    })
    .add<IDataListComponentProps>(6, prev => ({ ...prev, dblClickActionConfiguration: migrateNavigateAction(prev.dblClickActionConfiguration) }))
  ,
  settingsFormFactory: (props) => (<DataListSettingsForm {...props} />),
};

export default DataListComponent;