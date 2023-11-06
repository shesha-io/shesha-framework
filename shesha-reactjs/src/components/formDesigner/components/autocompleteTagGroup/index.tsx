import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { TagOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import AutocompleteTagGroup from '../../../autocompleteTagGroup';
import { useForm } from '../../../..';
import { migratePropertyName, migrateCustomFunctions } from '../../../../designer-components/_common-migrations/migrateSettings';

export interface IAutocompleteTagsOutlinedComponentProps extends IConfigurableFormComponent {
  value?: string[];
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values?: string[]) => void;
  /**
   * Whether this control is disabled
   */
  disabled?: boolean;
  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteTagGroupComponent: IToolboxComponent<IAutocompleteTagsOutlinedComponentProps> = {
  type: 'autocompleteTagGroup',
  name: 'Autocomplete Tags Outlined',
  icon: <TagOutlined />,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    const { formMode } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => 
          <AutocompleteTagGroup
            value={value}
            defaultValue={model?.defaultValue}
            onChange={onChange}
            autocompleteUrl={model?.autocompleteUrl}
            readOnly={model?.readOnly || formMode === 'readonly'}
            disabled={model?.disabled}
          />
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IAutocompleteTagsOutlinedComponentProps>(0, (prev: IAutocompleteTagsOutlinedComponentProps) => migratePropertyName(migrateCustomFunctions(prev)))
,
};

export default AutocompleteTagGroupComponent;
