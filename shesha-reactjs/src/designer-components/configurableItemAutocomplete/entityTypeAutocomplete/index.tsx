import React from 'react';
import { ConfigurableFormItem } from "@/components";
import EntityTypeAutocomplete, { EntityTypeAutocompleteType } from "@/components/configurableItemAutocomplete/entityTypeAutocomplete";
import { FormMarkup, IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { FileSearchOutlined } from "@ant-design/icons";
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';

const settingsForm = settingsFormJson as FormMarkup;

export interface IEntityTypeAutocompleteComponentProps extends IConfigurableFormComponent {
  entityTypeAutocompleteType?: EntityTypeAutocompleteType;
}

const EntityTypeAutocompleteComponent: IToolboxComponent<any, any> = {
  type: 'entityTypeAutocomplete',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Entity Type Autocomplete',
  icon: <FileSearchOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return (
            <EntityTypeAutocomplete
              type={model.entityTypeAutocompleteType}
              value={value}
              onChange={onChange}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IEntityTypeAutocompleteComponentProps>(0, (prev) => ({
      ...prev,
      entityTypeAutocompleteType: 'All',
    })),
};

export default EntityTypeAutocompleteComponent;
