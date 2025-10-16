import { BorderOutlined } from '@ant-design/icons';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React from 'react';
import { ConfigurableFormItem, FormComponentSelector } from '@/components';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useMetadata } from '@/providers';
import { IComponentSelectorComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

export type IActionParameters = [{ key: string; value: string }];

export const ComponentSelectorComponent: IToolboxComponent<IComponentSelectorComponentProps> = {
  type: 'component-selector',
  name: 'Component selector',
  icon: <BorderOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model: passedModel }) => {
    const { style, ...model } = passedModel;
    const { data: formData } = useFormData();

    const propertyName = model.propertyAccessor
      ? evaluateString(model.propertyAccessor, { data: formData })
      : null;
    const { noSelectionItemText, noSelectionItemValue } = model;
    const meta = useMetadata(false);

    const propertyMeta = propertyName && meta
      ? meta.getPropertyMeta(propertyName)
      : null;

    return (
      <ConfigurableFormItem model={model}>
        <FormComponentSelector
          componentType={model.componentType}
          noSelectionItem={
            noSelectionItemText ? { label: noSelectionItemText, value: noSelectionItemValue } : undefined
          }
          readOnly={model.readOnly}
          propertyMeta={propertyMeta}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IComponentSelectorComponentProps>(0, (prev) => ({ ...prev, componentType: 'input' }))
    .add<IComponentSelectorComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IComponentSelectorComponentProps>(2, (prev) => migrateVisibility(prev)),
};
