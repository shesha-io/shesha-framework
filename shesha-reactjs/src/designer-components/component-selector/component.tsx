import { BorderOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from 'providers/form/utils';
import React from 'react';
import { ConfigurableFormItem, FormComponentSelector } from '../../components';
import { IToolboxComponent } from '../../interfaces';
import { useForm } from '../../providers';
import { IComponentSelectorComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

export type IActionParameters = [{ key: string; value: string }];

export const ComponentSelectorComponent: IToolboxComponent<IComponentSelectorComponentProps> = {
  type: 'component-selector',
  name: 'Component selector',
  icon: <BorderOutlined />,
  isHidden: true,
  factory: ({ style, ...model }: IComponentSelectorComponentProps) => {
    const { formMode } = useForm();

    const { noSelectionItemText, noSelectionItemValue } = model;

    return (
      <ConfigurableFormItem model={model}>
        <FormComponentSelector
          componentType={model.componentType}
          noSelectionItem={
            noSelectionItemText ? { label: noSelectionItemText, value: noSelectionItemValue } : undefined
          }
          readOnly={formMode === 'readonly'}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m.add<IComponentSelectorComponentProps>(0, (prev) => ({ ...prev, componentType: 'input' })),
};
