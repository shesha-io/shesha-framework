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
import { useDataTableStore } from '@/index';
import ConfigError from '@/components/configError';

export interface IQuickSearchComponentProps extends IConfigurableFormComponent {
  block?: boolean;
}

const QuickSearchComponent: IToolboxComponent<IQuickSearchComponentProps> = {
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model: { block, hidden, id } }) => {
    const store = useDataTableStore(false);
    return hidden
      ? null
      : store
        ? <GlobalTableFilter block={block} />
        : <ConfigError
          type='datatable.quickSearch'
          errorMessage='Quick Search must be used within a Data Table Context'
          comoponentId={id}
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
      .add<IQuickSearchComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
  ,
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default QuickSearchComponent;
