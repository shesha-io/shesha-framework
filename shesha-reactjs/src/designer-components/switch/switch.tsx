import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SwitcherOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { SwitchSize } from 'antd/lib/switch';
import React from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ISwitchComponentProps, SwitchComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';

const SwitchComponent: SwitchComponentDefinition = {
  type: 'switch',
  name: 'Switch',
  icon: <SwitcherOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem<boolean> model={model} valuePropName="checked">
        {(value, onChange, _, ctx) => {
          return (
            <Switch
              className="sha-switch"
              disabled={model.readOnly ?? false}
              {...(model.allStyles?.jsStyle ? { style: model.allStyles.jsStyle } : {})}
              size={model.size as SwitchSize}
              checked={value ?? false}

              // TODO EVENTS
              onChange={(checked, event) => {
                ctx?.handleEvent(event, checked, model.onChangeCustom);
                onChange(checked);
              }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      label: 'Switch',
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<ISwitchComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ISwitchComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ISwitchComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ISwitchComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<ISwitchComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    }),
};

export default SwitchComponent;
