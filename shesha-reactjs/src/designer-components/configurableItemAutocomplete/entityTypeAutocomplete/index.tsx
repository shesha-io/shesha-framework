import React from 'react';
import { ConfigurableFormItem } from "@/components";
import EntityTypeAutocomplete from "@/components/configurableItemAutocomplete/entityTypeAutocomplete";
import { FormMarkup } from "@/interfaces";
import { FileSearchOutlined } from "@ant-design/icons";
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { EntityTypeAutocompleteComponentDefinition, IEntityTypeAutocompleteComponentProps } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const EntityTypeAutocompleteComponent: EntityTypeAutocompleteComponentDefinition = {
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
              baseModel={model.baseModel}
              readOnly={model.readOnly}
              size={model.size}
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
