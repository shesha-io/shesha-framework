import React from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { GlobalTableFilter } from '@/components';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { Alert } from 'antd';
import { useDataTableStore } from '@/index';

export interface IQuickSearchComponentProps extends IConfigurableFormComponent {
  block?: boolean;
}

const QuickSearchComponent: IToolboxComponent<IQuickSearchComponentProps> = {
  type: 'datatable.quickSearch',
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model: { block, hidden } }) => {
    const store = useDataTableStore(false);
    return hidden 
      ? null 
      : store 
        ? <GlobalTableFilter block={block} />
        : <Alert
          className="sha-designer-warning"
          message="Quick Search must be used within a Data Table Context"
          type="warning"
        />;
  },
  initModel: (model: IQuickSearchComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: (m) =>
    m
      .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IQuickSearchComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IQuickSearchComponentProps>(2, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default QuickSearchComponent;
