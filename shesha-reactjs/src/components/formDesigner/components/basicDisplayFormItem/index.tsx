import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { FileOutlined } from '@ant-design/icons';
import { useForm } from '../../../../providers';
import _ from 'lodash';

export interface IBasicDisplayFormItemProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const BasicDisplayFormItemComponent: IToolboxComponent<IBasicDisplayFormItemProps> = {
  type: 'displayFormItem',
  name: 'Display Form Item',
  icon: <FileOutlined />,
  isHidden: true,
  factory: (model: IBasicDisplayFormItemProps) => {
    const { formData } = useForm();

    const getDisplayValue = () => {
      const value = _.get(formData, model?.name);

      return typeof value === 'object' ? null : _.get(formData, model?.name);
    };

    return (
      <ConfigurableFormItem model={model} className="display-form-item">
        <span>{formData ? getDisplayValue() : ''}</span>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default BasicDisplayFormItemComponent;
