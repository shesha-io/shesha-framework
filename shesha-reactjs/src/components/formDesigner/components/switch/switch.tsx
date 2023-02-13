import { SwitcherOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import React from 'react';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import { DataTypes } from '../../../../interfaces/dataTypes';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { SwitchSize } from 'antd/lib/switch';

export interface ISwitchProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const SwitchComponent: IToolboxComponent<ISwitchProps> = {
  type: 'switch',
  name: 'Switch',
  icon: <SwitcherOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  factory: ({ size, ...model }: ISwitchProps) => {
    const { formMode, isComponentDisabled, formData } = useForm();

    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

    const style = getStyle(model?.style, formData);

    return (
      <ConfigurableFormItem model={model}>
        {isReadOnly ? (
          <ReadOnlyDisplayFormItem type="switch" disabled={disabled} />
        ) : (
          <Switch disabled={disabled} style={style} size={size as SwitchSize} />
        )}
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    return {
      ...model,
      label: 'Switch',
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default SwitchComponent;
