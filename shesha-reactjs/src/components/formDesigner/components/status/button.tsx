import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { InfoCircleOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { Tag } from 'antd';
import { useForm } from '../../../../providers';

export type IActionParameters = [{ key: string; value: string }];

export interface IStatusFieldProps extends IConfigurableFormComponent {
  color: string;
  name: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const StatusField: IToolboxComponent<IStatusFieldProps> = {
  type: 'status',
  name: 'Status',
  icon: <InfoCircleOutlined />,
  factory: (model: IStatusFieldProps) => {
    const { formData } = useForm();

    const value = evaluateValue(model?.name, { data: formData });

    return <Tag color={model?.color}>{value}</Tag>;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const buttonModel: IStatusFieldProps = {
      ...model,
    };
    return buttonModel;
  },
};

export default StatusField;
