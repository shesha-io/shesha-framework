import React from 'react';
import settingsFormJson from './settingsForm.json';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { GlobalTableFilter } from '@/components';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

export interface IQuickSearchComponentProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const QuickSearchComponent: IToolboxComponent<IQuickSearchComponentProps> = {
  type: 'datatable.quickSearch',
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: () => {
    return <GlobalTableFilter />;
  },
  initModel: (model: IQuickSearchComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: m => m
    .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IQuickSearchComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default QuickSearchComponent;
