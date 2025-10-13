import React from 'react';
import settingsFormJson from './settingsForm.json';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SelectColumnsButton } from './selectColumnsButton';
import { SlidersOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';

export type ISelectColumnsButtonComponentProps = IConfigurableFormComponent;

const settingsForm = settingsFormJson as FormMarkup;

const SelectColumnsButtonComponent: IToolboxComponent<ISelectColumnsButtonComponentProps> = {
  type: 'datatable.selectColumnsButton',
  isInput: false,
  name: 'Table Select Columns Button',
  icon: <SlidersOutlined />,
  Factory: ({ }) => {
    return <SelectColumnsButton />;
  },
  initModel: (model: ISelectColumnsButtonComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: (m) => m
    .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ISelectColumnsButtonComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ISelectColumnsButtonComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) })),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  isHidden: true, // note: to be removed, now is used only for backward compatibility
};

export default SelectColumnsButtonComponent;
