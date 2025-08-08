import React from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl, { NotConfiguredWarning } from './dataListControl';
import { useDataTableStore } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
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
    .add<IDataListComponentProps>(0, prev => ({...prev, formSelectionMode: 'name', selectionMode: 'none', items: []}))
    .add<IDataListComponentProps>(1, prev => ({...prev, orientation: 'vertical', listItemWidth: 1 }))
    .add<IDataListComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDataListComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDataListComponentProps>(4, prev => ({...prev, collapsible: true}))
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
    .add<IDataListComponentProps>(7, (prev: IDataListComponentProps) => ({
      ...migrateFormApi.properties(prev),
      onNewListItemInitialize: migrateFormApi.full(prev.onNewListItemInitialize),
      onListItemSave: migrateFormApi.full(prev.onListItemSave)
    }))
    .add<IDataListComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
    
,
settingsFormMarkup: (data) => getSettings(data),
};

export default DataListComponent;

