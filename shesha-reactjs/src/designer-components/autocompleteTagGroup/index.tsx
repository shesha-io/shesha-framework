import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { TagOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import AutocompleteTagGroup from '@/components/autocompleteTagGroup';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

export interface IAutocompleteTagsOutlinedComponentProps extends IConfigurableFormComponent {
  value?: string[];
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values?: string[]) => void;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteTagGroupComponent: IToolboxComponent<IAutocompleteTagsOutlinedComponentProps> = {
  type: 'autocompleteTagGroup',
  name: 'Autocomplete Tags Outlined',
  icon: <TagOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (
          <AutocompleteTagGroup
            value={value}
            defaultValue={model?.defaultValue}
            onChange={onChange}
            autocompleteUrl={model?.autocompleteUrl}
            readOnly={model?.readOnly}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IAutocompleteTagsOutlinedComponentProps>(0, (prev: IAutocompleteTagsOutlinedComponentProps) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAutocompleteTagsOutlinedComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAutocompleteTagsOutlinedComponentProps>(2, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
      defaultValue: migrateFormApi.withoutFormData(prev?.defaultValue),
    })),
};

export default AutocompleteTagGroupComponent;
