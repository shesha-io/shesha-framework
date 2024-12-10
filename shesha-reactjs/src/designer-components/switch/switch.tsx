import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useFormData } from '@/providers';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SwitcherOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { SwitchSize } from 'antd/lib/switch';
import React from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ISwitchComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

const SwitchComponent: IToolboxComponent<ISwitchComponentProps> = {
  type: 'switch',
  name: 'Switch',
  icon: <SwitcherOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model: passedModel }) => {
    const { size, ...model } = passedModel;
    const { data: formData } = useFormData();

    const style = getStyle(model?.style, formData);

    return (
      <ConfigurableFormItem model={model} valuePropName="checked" initialValue={model?.defaultValue}>
        {(value, onChange) => {
          return model.readOnly ? (
              <ReadOnlyDisplayFormItem type="switch" disabled={model.readOnly} checked={value} />
            ) : (
              <Switch className="sha-switch" disabled={model.readOnly} style={style} size={size as SwitchSize} checked={value} onChange={onChange} />
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
    .add<ISwitchComponentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<ISwitchComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        style: prev.style
      };

      return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
    })
  ,
};

export default SwitchComponent;
