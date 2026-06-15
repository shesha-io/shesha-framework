import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { TagOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import AutocompleteTagGroup from '@/components/autocompleteTagGroup';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getStringPropertyOrUndefined } from '@/utils/object';

export interface IAutocompleteTagsOutlinedComponentProps extends IConfigurableFormComponent {
  value?: string[] | undefined;
  autocompleteUrl: string;
  onChange?: ((values?: string[]) => void) | undefined;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteTagGroupComponent: IToolboxComponent<IAutocompleteTagsOutlinedComponentProps> = {
  type: 'autocompleteTagGroup',
  name: 'Autocomplete Tags Outlined',
  icon: <TagOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem<string[]> model={model}>
        {(value, onChange) => (
          <AutocompleteTagGroup
            value={value}
            onChange={onChange}
            autocompleteUrl={model.autocompleteUrl}
            readOnly={model.readOnly}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IAutocompleteTagsOutlinedComponentProps>(0, (prev) => {
      return {
        ...migratePropertyName(migrateCustomFunctions(prev)),
        autocompleteUrl: getStringPropertyOrUndefined(prev, "autocompleteUrl") ?? "",
      };
    })
    .add<IAutocompleteTagsOutlinedComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAutocompleteTagsOutlinedComponentProps>(2, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
    })),
};

export default AutocompleteTagGroupComponent;
