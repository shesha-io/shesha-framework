import React from 'react';
import { ConfigurableFormItem } from "@/components";
import EntityTypeAutocomplete, { EntityIdentifier, EntityTypeAutocompleteType } from "@/components/configurableItemAutocomplete/entityTypeAutocomplete";
import { FormMarkup, IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { FileSearchOutlined } from "@ant-design/icons";
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';

const settingsForm = settingsFormJson as FormMarkup;

export interface IEntityTypeAutocompleteComponentProps extends IConfigurableFormComponent {
  entityTypeAutocompleteType?: EntityTypeAutocompleteType;
  baseModel?: EntityIdentifier;
}

const EntityTypeAutocompleteComponent: IToolboxComponent<IEntityTypeAutocompleteComponentProps, IEntityTypeAutocompleteComponentProps> = {
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
