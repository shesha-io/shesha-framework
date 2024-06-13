import React from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { FilterOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { AdvancedFilterButton } from './advancedFilterButton';
import { ConfigurableFormItem } from '@/components';


const FilterComponent: IToolboxComponent<IConfigurableFormComponent> = {
  type: 'datatable.filter',
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) => {

    return model.hidden ? null : <AdvancedFilterButton />;
  },
  initModel: (model) => {
    return {
      ...model,
    };
  },
  migrator: (m) =>
    m
      .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IConfigurableFormComponent>(1, (prev) => migrateVisibility(prev))
      .add<IConfigurableFormComponent>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
  ,
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default FilterComponent;
