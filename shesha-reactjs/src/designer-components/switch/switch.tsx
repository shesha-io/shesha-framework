import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SwitcherOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { SwitchChangeEventHandler, SwitchSize } from 'antd/lib/switch';
import React from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ISwitchComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

interface ISwitchComponentCalulatedValues {
  eventHandlers: IEventHandlers;
}

const SwitchComponent: IToolboxComponent<ISwitchComponentProps, ISwitchComponentCalulatedValues> = {
  type: 'switch',
  name: 'Switch',
  icon: <SwitcherOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  calculateModel: (model, allData) => ({ eventHandlers: getAllEventHandlers(model, allData) }),
  Factory: ({ model, calculatedModel }) => {
    return (
      <ConfigurableFormItem model={model} valuePropName="checked">
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal: SwitchChangeEventHandler = (checked: boolean, event) => {
            customEvents.onChange({ value: checked }, event);
            if (typeof onChange === 'function') onChange(checked);
          };

          return model.readOnly ? (
            <ReadOnlyDisplayFormItem type="switch" disabled={model.readOnly} checked={value} />
          ) : (
            <Switch 
              className="sha-switch"
              disabled={model.readOnly}
              style={model.allStyles.fullStyle}
              size={model.size as SwitchSize}
              checked={value}
              defaultChecked={model.defaultChecked}
              defaultValue={model.defaultValue}
              onChange={onChangeInternal} />
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<ISwitchComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ISwitchComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ISwitchComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ISwitchComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<ISwitchComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        style: prev.style
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
  ,
};

export default SwitchComponent;
